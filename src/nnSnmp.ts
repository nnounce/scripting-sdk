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
import { SnmpTrapSubscriptionNotify } from "./events/incoming/SnmpTrapSubscriptionNotify.ts";
import { Consumer } from "./utils/FunctionalInterfaces.ts";

/**
 * Define API for working with snmp traps
 */
export class NnSnmpDefinition {
	private webSocket: WebSocketCommunication;

	/**
	 * Creates an instance of the class with a specified WebSocketCommunication object.
	 *
	 * @param {WebSocketCommunication} webSocket - The WebSocketCommunication instance used for communication.
	 */
	private constructor(webSocket: WebSocketCommunication) {
		this.webSocket = webSocket;
	}

	/**
	 * Create new instance
	 */
	public static getInstance(webSocket: WebSocketCommunication): NnSnmpDefinition {
		return new NnSnmpDefinition(webSocket);
	}

	/**
	 * Method will create subscription for SNMP traps.
	 * @param eventConsumer {@link Consumer} of {@link SnmpTrapSubscriptionNotify}
	 */
	public subscribeForTrap(eventConsumer: Consumer<SnmpTrapSubscriptionNotify>): void {
		this.webSocket.subscribeToEvent("snmpTrapSubscriptionRequest", "snmpTrapSubscriptionNotify", 100, event =>
			eventConsumer(event as SnmpTrapSubscriptionNotify)
		);
	}
}
