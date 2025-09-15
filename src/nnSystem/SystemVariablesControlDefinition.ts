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

import { WebSocketCommunication } from "../communication/WebSocketCommunication.ts";
import { SystemVariableChangeNotifyEvent } from "../events/incoming/SystemVariableChangeNotifyEvent.ts";
import { logger } from "../utils/LoggerUtil.ts";

/**
 * System variables control to manage variables from server
 */
export class SystemVariablesControlDefinition {
	private webSocket: WebSocketCommunication;
	private systemVariablesMap: Map<string, string>;
	private initialized: boolean = false;

	/**
	 * Private constructor for initializing the instance with WebSocket communication and system variables map.
	 *
	 * @param {WebSocketCommunication} webSocket - The WebSocket communication instance for handling WebSocket connections.
	 * @param {Map<string, string>} systemVariablesMap - A map containing key-value pairs of system variables.
	 */
	private constructor(webSocket: WebSocketCommunication, systemVariablesMap: Map<string, string>) {
		this.webSocket = webSocket;
		this.systemVariablesMap = systemVariablesMap;
	}

	/**
	 * Returns a new instance of the SystemVariablesControlDefinition.
	 *
	 * @param {WebSocketCommunication} webSocket - The WebSocketCommunication object used to initialize the instance.
	 * @return {SystemVariablesControlDefinition} New instance of the SystemVariablesControlDefinition.
	 */
	public static getInstance(webSocket: WebSocketCommunication): SystemVariablesControlDefinition {
		return new SystemVariablesControlDefinition(webSocket, new Map());
	}

	/**
	 * Initialize system variables control instance and set current system variables to map
	 */
	public async init() {
		if (this.initialized) {
			return;
		}
		try {
			const subscriptionPromise = new Promise<void>(resolve => {
				let resolved = false;
				this.webSocket.subscribeToLiveEvent("systemVariableChangeSubscriptionRequest", "systemVariableChangeNotify", event => {
					this.systemVariableChange(event as SystemVariableChangeNotifyEvent);
					if (!resolved) {
						resolved = true;
						resolve();
					}
				});
			});

			await subscriptionPromise;
			this.initialized = true;
		} catch (e) {
			logger.error("Error during init system variable control. Error: ", String(e));
			throw e;
		}
	}

	/**
	 * Get variable value by name
	 * @param name
	 */
	public get(name: string): string | undefined {
		return this.getVariableValue(name);
	}

	/**
	 * Get system variable value.
	 * If system variables wasn't initialized before, then load all system variables before return value
	 * @param name
	 * @private
	 */
	private getVariableValue(name: string): string | undefined {
		return this.systemVariablesMap.get(name);
	}

	/**
	 * Handle processing system variable change event
	 * @param event
	 * @private
	 */
	private systemVariableChange(event: SystemVariableChangeNotifyEvent) {
		if (event.fullState) {
			this.systemVariablesMap.clear();
		}
		const data = new Map(Object.entries(event.data));
		data.forEach((value, name) => {
			if (value == null) {
				this.systemVariablesMap.delete(name);
			} else {
				this.systemVariablesMap.set(name, value);
			}
		});
	}
}
