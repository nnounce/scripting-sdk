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

import { NnDuckerStatesUtil } from "./NnDuckerStatesUtil.ts";
import { Consumer } from "../../../utils/FunctionalInterfaces.ts";
import { DesignUtil } from "../../DesignUtil.ts";
import { NnDspDuckerControl } from "../../../nnDsp.ts";
import { WebSocketCommunication } from "../../../communication/WebSocketCommunication.ts";
import { NnLoggerConfig } from "../../../utils/LoggerUtil.ts";

/**
 * Represents a component that manages and interacts with ducker functionality. It communicates via WebSocket
 * and utilizes a utility class to handle the ducker states and events.
 *
 * The `NnDuckerComponent` implements the `NnDspDuckerControl` interface and acts as an abstraction layer.
 */
export class NnDuckerComponent implements NnDspDuckerControl {
	private readonly id: number | string;
	private readonly webSocket: WebSocketCommunication;
	private readonly duckerStatesUtil: NnDuckerStatesUtil;
	private readonly designUtil: DesignUtil;

	/**
	 * Constructor for initializing an instance with an identifier and WebSocket communication.
	 *
	 * @param {number|string} id - The unique identifier for the instance, which can be a number or a string.
	 * @param {WebSocketCommunication} webSocket - The WebSocket communication instance used for establishing communication.
	 * @param {DesignUtil} designUtil - Device design util.
	 * @param {NnLoggerConfig} loggerConfig - Logging configuration
	 * @return {void}
	 */
	constructor(id: number | string, webSocket: WebSocketCommunication, designUtil: DesignUtil, loggerConfig: NnLoggerConfig) {
		this.id = id;
		this.webSocket = webSocket;
		this.duckerStatesUtil = new NnDuckerStatesUtil(this.webSocket, loggerConfig);
		this.designUtil = designUtil;
	}

	/**
	 * Registers a listener for the ducker priority active change event.
	 * @param activeChangeCb The callback function to be invoked each time the ducker priority state changes. Consumed boolean indicates whather priority input is active.
	 */
	public async onActiveChange(activeChangeCb: Consumer<boolean>): Promise<void> {
		await this.designUtil.loadDesign();
		const componentId = this.designUtil.getComponentId(this.id);
		if (componentId === null) {
			throw new Error(`Component with id '${this.id}' not found in design`);
		}
		this.duckerStatesUtil.onActiveChange(componentId, activeChangeCb);
	}
}
