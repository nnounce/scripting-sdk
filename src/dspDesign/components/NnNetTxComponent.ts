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

import { ANnDspComponent } from "./NnDspComponent.ts";
import { NnComponentName } from "./NnComponentName.ts";
import { WebSocketCommunication } from "../../communication/WebSocketCommunication.ts";
import { NnLoggerConfig } from "../../utils/LoggerUtil.ts";
import { DesignUtil } from "../DesignUtil.ts";

/**
 * Represents a network transmit component that extends the base `ANnDspComponent` class.
 * This component is responsible for managing network transmit functionality
 * while supporting WebSocket communication and logging configurations.
 *
 * @extends ANnDspComponent
 */
export class NnNetTxComponent extends ANnDspComponent {
	/**
	 * Constructs an instance of the class by initializing the necessary properties and calling the superclass constructor.
	 *
	 * @param {number|string} componentId - The unique identifier for the component.
	 * @param {WebSocketCommunication} webSocket - The WebSocket communication instance to be used for this component.
	 * @param {DesignUtil} designUtil - Device design util.
	 * @param {NnLoggerConfig} loggerConfig - The configuration settings for the logger.
	 */
	constructor(componentId: number | string, webSocket: WebSocketCommunication, designUtil: DesignUtil, loggerConfig: NnLoggerConfig) {
		super(componentId, NnComponentName.NET_TX_COMPONENT_NAME, webSocket, designUtil, loggerConfig);
	}
}
