/**
 * Copyright 2025 Simpleway Europe a.s.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IoControl, IoPinStateSubscriptionNotify } from "../events/incoming/IoPinStateSubscriptionNotify.ts";
import { BiConsumer, Callback } from "../utils/FunctionalInterfaces.ts";
import { logger, NnLoggerConfig } from "../utils/LoggerUtil.ts";
import { WebSocketCommunication } from "../communication/WebSocketCommunication.ts";
import { IoPinMode } from "./IoPinMode.ts";
import { IoPinType } from "./IoPinType.ts";
import { createRequestId } from "../events/INnounceClientRequestEvent.ts";
import { IoPinStatePollSubscriptionRequestEvent } from "../events/outgoing/IoPinStatePollSubscriptionRequestEvent.ts";
import { IoPinStatePollSubscriptionResponseEvent } from "../events/incoming/IoPinStatePollSubscriptionResponseEvent.ts";

/**
 * This interface is designed to handle the removal of event listeners associated with input controls.
 *
 * @interface InputControl
 * @property {Callback} removeListener - A callback used for removing a listener associated with the input control.
 */
export interface InputControl {
	removeListener: Callback;
}

/**
 * A class responsible for managing and tracking the states of input and output controls.
 * This includes managing state updates and notifying listeners of input changes.
 */
export class IOControlStates {
	/**
	 * Represents a mapping of output pin numbers to their respective IoControl instances.
	 *
	 * This map is used for managing and controlling output states, where the key is the pin
	 * number (of type number) and the value is an instance of IoControl, which provides
	 * functionalities or configurations associated with that specific pin.
	 *
	 * The `outputStates` variable allows developers to track and manipulate the state
	 * of various output pins efficiently.
	 *
	 * @type {Map<number, IoControl>}
	 */
	private outputStates: Map<number /*pin*/, IoControl> = new Map();
	/**
	 * Stores the current state values of input pins.
	 * The key is the pin number and the value is the input level.
	 *
	 * @type {Map<number, number>}
	 */
	private inputStates: Map<number /*pin*/, number> = new Map();

	/**
	 * Maps input pins to their associated change listeners.
	 * When an input pin's state changes, all registered listeners for that pin are notified.
	 *
	 * @type {Map<number, Array<BiConsumer<number, number>>>}
	 */
	private inputChangeListeners: Map<number, Array<BiConsumer<number /*value*/, number /*oldValue*/>>> = new Map();

	/**
	 * WebSocket communication instance used for sending/receiving IO control events.
	 *
	 * @type {WebSocketCommunication}
	 */
	private webSocket: WebSocketCommunication;

	/**
	 * Configuration for the logger, controls internal logging behavior.
	 *
	 * @type {NnLoggerConfig}
	 */
	private loggerConfig: NnLoggerConfig;

	/**
	 * Flag indicating whether the instance has been fully initialized.
	 *
	 * @type {boolean}
	 */
	private initialized: boolean = false;

	/**
	 * Creates a new instance of IOControlStates.
	 * Initializes the WebSocket communication and sets up event handlers for IO pin state notifications.
	 *
	 * @param {WebSocketCommunication} webSocket - WebSocket communication instance for sending/receiving events
	 * @param {NnLoggerConfig} loggerConfig - Configuration for logging
	 */
	constructor(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig) {
		this.loggerConfig = loggerConfig;
		this.webSocket = webSocket;
		this.webSocket.addEventHandler("ioPinStateSubscriptionNotify", event =>
			this.onControlStateEvent((event as IoPinStateSubscriptionNotify).states)
		);
	}

	/**
	 * Returns instance of IOControlStates.
	 *
	 * @param {WebSocketCommunication} webSocket - WebSocket communication instance for sending/receiving events
	 * @param {NnLoggerConfig} loggerConfig - Configuration for logging
	 * @return {IOControlStates} Instance of IOControlStates
	 */
	public static getInstance(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig): IOControlStates {
		return new IOControlStates(webSocket, loggerConfig);
	}

	/**
	 * Initializes the instance by setting up WebSocket
	 * subscriptions for IO pin state updates.
	 *
	 * This method must be called after getInstance() and before using any IO control
	 * functionality. It sends a subscription request to receive regular updates of
	 * pin states and initializes internal state tracking.
	 *
	 * @throws {Error} If the initialization process fails
	 * @return {Promise<void>} A promise that resolves when initialization is complete
	 */
	public async init() {
		if (this.initialized) {
			return;
		}

		try {
			const requestEvent: IoPinStatePollSubscriptionRequestEvent = {
				type: "ioPinStateSubscriptionRequest",
				requestId: createRequestId(),
				dataEveryMs: 100,
				keepAliveMs: 0,
				responseTag: "deno-script-api",
			};
			const response = await this.webSocket.sendEventWithResponse<
				IoPinStatePollSubscriptionRequestEvent,
				IoPinStatePollSubscriptionResponseEvent
			>(requestEvent, true);
			this.onControlStateEvent(response.states);

			this.initialized = true;
		} catch (e) {
			logger.error("Error during init IO control. Error: ", String(e));
			throw e;
		}
	}

	/**
	 * Retrieves the IoControl instance for a specified output pin.
	 *
	 * @param {number} pin - The pin number to get the output value for
	 * @return {IoControl | undefined} The IoControl instance for the pin or undefined if not found
	 */
	public getOutputValue(pin: number): IoControl | undefined {
		return this.outputStates.get(pin);
	}

	/**
	 * Retrieves the current value of a specified input pin.
	 *
	 * @param {number} pin - The pin number to get the input value for
	 * @return {number} The current value of the input pin (defaults to 0 if not found)
	 */
	public getInputValue(pin: number): number {
		return this.inputStates.get(pin) ?? 0;
	}

	/**
	 * Registers a callback function to be called when an input pin's value changes.
	 *
	 * @param {number} input - The pin number to listen for changes on
	 * @param {BiConsumer<number, number>} listener - Callback function that receives the new value and old value
	 * @return {InputControl} An object with a removeListener method to unregister the callback
	 */
	public onInputChange(input: number, listener: BiConsumer<number, number>): InputControl {
		const changeCbs = this.inputChangeListeners.get(input) ?? [];
		changeCbs.push(listener);
		this.inputChangeListeners.set(input, changeCbs);
		return {
			removeListener: () => {
				const inputChangeCbs = this.inputChangeListeners.get(input) ?? [];
				const index = inputChangeCbs.indexOf(listener);
				inputChangeCbs.splice(index, 1);
				this.inputChangeListeners.set(input, inputChangeCbs);
			},
		};
	}

	/**
	 * Processes an array of IoControl states received from the hardware.
	 * Updates internal state maps and triggers callbacks for changed inputs.
	 *
	 * @param {Array<IoControl>} states - Array of IoControl objects containing pin state information
	 */
	private onControlStateEvent(states: Array<IoControl>) {
		// update outputs
		this.updateOutputValues(states);

		// check change on inputs
		const inputStates: IoControl[] = states.filter(s => s.pinMode == IoPinMode.INPUT && s.pinType == IoPinType.CONTROL);
		if (this.inputStates.size == 0) {
			inputStates.forEach(ioControl => this.inputStates.set(ioControl.pin, ioControl.value));
			return;
		}

		inputStates.forEach(ioControl => {
			const lastState: number = this.inputStates.get(ioControl.pin) || 0;
			const isChange: boolean = this.isChangeOnInput(ioControl.value, lastState);
			this.inputStates.set(ioControl.pin, ioControl.value);
			if (isChange) {
				this.loggerConfig.isEnabledInternal() &&
					logger.debug(
						"Control input '{}' changed raw value from '{}' to raw value '{}'",
						ioControl.pin,
						lastState,
						ioControl.value
					);
				const onChangeCallbacks = this.inputChangeListeners.get(ioControl.pin);
				onChangeCallbacks?.forEach(cb => cb(ioControl.value, lastState));
			}
		});
	}

	/**
	 * Determines if a change in input value is significant enough to trigger callbacks.
	 *
	 * @param {number} currentLevelState - The current value of the input
	 * @param {number} lastState - The previous value of the input
	 * @return {boolean} True if the change is significant (> 0.1), false otherwise
	 */
	private isChangeOnInput(currentLevelState: number, lastState: number): boolean {
		if (this.inputStates.size == 0) {
			return false;
		}
		return Math.abs(currentLevelState - lastState) > 0.1;
	}

	/**
	 * Updates the internal map of output states based on received IoControl states.
	 *
	 * @param {Array<IoControl>} states - Array of IoControl objects containing pin state information
	 */
	private updateOutputValues(states: Array<IoControl>) {
		states.forEach(ioControl => {
			if (ioControl.pinMode == IoPinMode.OUTPUT && ioControl.pinType == IoPinType.CONTROL) {
				this.outputStates.set(ioControl.pin, ioControl);
			}
		});
	}
}
