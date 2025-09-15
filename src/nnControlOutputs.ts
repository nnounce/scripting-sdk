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

import { WebSocketCommunication } from "./communication/WebSocketCommunication.ts";
import { IoPinOutputSetRawEvent } from "./events/outgoing/IoPinOutputSetRawEvent.ts";
import { IOControlStates } from "./ioControl/IOControlStates.ts";
import { IoPinType } from "./ioControl/IoPinType.ts";
import { logger, NnLoggerConfig } from "./utils/LoggerUtil.ts";

/**
 * Represents a control interface for output pin in digital mode.
 * Pins are numbered from 1
 *
 * Digital mode returns true or false based on voltage on pin compared to rail voltage.
 * - \>=0.6 - pin is high (has rail voltage) - true
 * - 0.0 - pin is low (has 0 voltage) - false
 */
export type DigitalOutputPinControl = {
	/**
	 * Returns the state of the control pin based on the detected voltage.
	 *
	 * If the voltage at the control pin is at least 60% of the reference voltage, this method
	 * returns ```true```; otherwise, it returns ```false```.
	 */

	getValue: { (): boolean };
	/**
	 * Sets the control pin state based on the provided boolean value.
	 *
	 * If ```true``` is passed, the control pin is set to the rail voltage. If ```false``` is passed,
	 * the control pin is set to 0 volts.
	 *
	 * @param value the desired state of the control pin
	 */
	setValue: { (value: boolean): void };
};

/**
 * Represents a control interface for output pin in relay mode.
 * Pins are numbered from 1.
 *
 * relay SPST On-Off:
 * - 1.0 - relay is closed
 * - 0.0 - relay is open
 *
 * relay SPDT On-On:
 * - 1.0 - relay is closed (C connected to NO)
 * - 0.0 - relay is open (C connected to NC)
 */
export type RelayOutputPinControl = {
	/**
	 * Opens the relay, setting its state to open.
	 *
	 * This method activates the relay, allowing the circuit to be broken (i.e., no current flows through).
	 */
	open: { (): void };
	/**
	 * Closes the relay, setting its state to closed.
	 *
	 * This method activates the relay to complete the circuit, allowing current to flow through.
	 */
	close: { (): void };
	/**
	 * Checks if the relay is currently open.
	 *
	 * @return ```true``` if the relay is open (circuit is broken), ```false``` otherwise.
	 */
	isOpen: { (): boolean };
	/**
	 * Checks if the relay is currently closed.
	 *
	 * @return ```true``` if the relay is closed (circuit is complete), ```false``` otherwise.
	 */
	isClosed: { (): boolean };
};

/**
 * Fixed pins - hardcoded in hardware and cannot be changed
 *
 * outputs:
 * - digital | analog | relay
 */
export class NnControlOutputsDefinition {
	private webSocket: WebSocketCommunication;
	private loggerConfig: NnLoggerConfig;
	private ioControlStates: IOControlStates;

	/**
	 * Constructs a new instance of the class.
	 *
	 * @param {WebSocketCommunication} webSocket - Instance of the WebSocketCommunication for managing WebSocket communication.
	 * @param {NnLoggerConfig} loggerConfig - Configuration settings for the logger.
	 * @param {IOControlStates} ioControlStates - The IO control states required for managing input/output.
	 */
	private constructor(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig, ioControlStates: IOControlStates) {
		this.webSocket = webSocket;
		this.loggerConfig = loggerConfig;
		this.ioControlStates = ioControlStates;
	}

	/**
	 * Creates new instance
	 */
	public static getInstance(
		webSocket: WebSocketCommunication,
		loggerConfig: NnLoggerConfig,
		ioControlStates: IOControlStates
	): NnControlOutputsDefinition {
		return new NnControlOutputsDefinition(webSocket, loggerConfig, ioControlStates);
	}

	/**
	 * Get pin control in digital mode. Method param indicates which pin is controlled.
	 * Pins are numbered from 1.
	 *
	 * Digital mode returns true or false based on voltage on pin compared to rail voltage.
	 * - \>=0.6 - pin is high (has rail voltage) - true
	 * - 0.0 - pin is low (has 0 voltage) - false
	 * @param pin numbered from 1
	 */
	public digital(pin: number): DigitalOutputPinControl {
		return {
			getValue: () => this.getOutputValue(pin) >= 0.6,
			setValue: value => this.setOutputValue(pin, value ? 1 : 0),
		};
	}

	/**
	 * Get pin control in relay mode. Method param indicates which pin is controlled.
	 * Pins are numbered from 1.
	 *
	 * relay SPST On-Off:
	 * - 1.0 - relay is closed
	 * - 0.0 - relay is open
	 *
	 * relay SPDT On-On:
	 * - 1.0 - relay is closed (C connected to NO)
	 * - 0.0 - relay is open (C connected to NC)
	 * @param pin numbered from 1
	 */
	public relay(pin: number): RelayOutputPinControl {
		return {
			open: () => this.setOutputValue(pin, 0),
			close: () => this.setOutputValue(pin, 1),
			isOpen: () => this.getOutputValue(pin) == 0,
			isClosed: () => this.getOutputValue(pin) == 1,
		};
	}

	private setOutputValue(pin: number, value: number): void {
		const ioPinOutputSet: IoPinOutputSetRawEvent = {
			type: "ioPinOutputSetRawEvent",
			pinType: IoPinType.CONTROL,
			pin: pin,
			value: value,
		};
		this.webSocket.sendEvent(ioPinOutputSet);
	}

	private getOutputValue(pin: number): number {
		const output = this.ioControlStates.getOutputValue(pin);
		if (output == null) {
			this.loggerConfig.isEnabledInternal() && logger.warn(`Output pin '${pin}' was not found`);
			return 0;
		}
		return output.value;
	}
}
