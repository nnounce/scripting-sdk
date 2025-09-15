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

import { NnGainComponent } from "./dspDesign/components/NnGainComponent.ts";
import { NnNetRxComponent } from "./dspDesign/components/NnNetRxComponent.ts";
import { NnNetTxComponent } from "./dspDesign/components/NnNetTxComponent.ts";
import { NnDuckerComponent } from "./dspDesign/components/ducker/NnDuckerComponent.ts";
import { NnDspComponentControl } from "./dspDesign/components/NnDspComponentControl.ts";
import { WebSocketCommunication } from "./communication/WebSocketCommunication.ts";
import { NnLoggerConfig } from "./utils/LoggerUtil.ts";
import { DesignUtil } from "./dspDesign/DesignUtil.ts";

/**
 * Represents the control interface for managing a DSP Ducker's behavior.
 */
export interface NnDspDuckerControl {
	/**
	 * Registers a listener for the ducker priority input active change event.
	 * @param onActiveChangeCb The callback function to be invoked each time the ducker priority input state changes. Consumed boolean indicates whether priority input is active.
	 */
	onActiveChange: { (onActiveChangeCb: { (priorityActive: boolean): void }): void };
}

/**
 * Define API for updating components
 */
export class NnDspDefinition {
	private _components: NnDspComponent;

	/**
	 * Private constructor for initializing the components using the provided WebSocket communication and logger configuration.
	 *
	 * @param {WebSocketCommunication} webSocket - The WebSocket communication instance used for message exchange.
	 * @param {NnLoggerConfig} loggerConfig - Configuration instance for logger settings.
	 * @param {DesignUtil} designUtil - Device design util instance
	 */
	private constructor(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig, designUtil: DesignUtil) {
		this._components = NnDspComponent.getInstance(webSocket, designUtil, loggerConfig);
	}

	/**
	 * Components holder
	 */
	public get components(): NnDspComponent {
		return this._components;
	}

	/**
	 * Creates new instance of the NnDspDefinition class
	 * using the provided WebSocketCommunication, logger configuration and DesignUtil.
	 *
	 * @param {WebSocketCommunication} webSocket - The WebSocket communication instance to be used.
	 * @param {NnLoggerConfig} loggerConfig - The logger configuration for the instance.
	 * @param {DesignUtil} designUtil - Device design util.
	 * @return {NnDspDefinition} The singleton instance of NnDspDefinition.
	 */
	public static getInstance(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig, designUtil: DesignUtil): NnDspDefinition {
		return new NnDspDefinition(webSocket, loggerConfig, designUtil);
	}
}

/**
 * Util for working with components
 */
export class NnDspComponent {
	private webSocket: WebSocketCommunication;
	private loggerConfig: NnLoggerConfig;
	private designUtil: DesignUtil;

	/**
	 * Constructs an instance of the class with the specified WebSocket communication handler and logger configuration.
	 *
	 * @param {WebSocketCommunication} websocket - The WebSocket communication handler used for data transmission.
	 * @param {DesignUtil} designUtil - Device design util
	 * @param {NnLoggerConfig} loggerConfig - The configuration settings for the logger.
	 */
	constructor(websocket: WebSocketCommunication, designUtil: DesignUtil, loggerConfig: NnLoggerConfig) {
		this.webSocket = websocket;
		this.loggerConfig = loggerConfig;
		this.designUtil = designUtil;
	}

	/**
	 * Create new instance
	 */
	public static getInstance(webSocket: WebSocketCommunication, designUtil: DesignUtil, loggerConfig: NnLoggerConfig): NnDspComponent {
		return new NnDspComponent(webSocket, designUtil, loggerConfig);
	}

	/**
	 * Method return gain component by its ID/name or null if none exists
	 * @param id number|string
	 * - number - id of the component
	 * - string - name of the component
	 */
	public gain(id: number | string): NnDspComponentControl {
		return new NnGainComponent(id, this.webSocket, this.designUtil, this.loggerConfig);
	}

	/**
	 * Method return net RX component by its ID/name or null if none exists
	 * @param id number|string
	 * - number - id of the component
	 * - string - name of the component
	 */
	public netRx(id: number | string): NnDspComponentControl {
		return new NnNetRxComponent(id, this.webSocket, this.designUtil, this.loggerConfig);
	}

	/**
	 * Method return net TX component by its ID/name or null if none exists
	 * @param id number|string
	 * - number - id of the component
	 * - string - name of the component
	 */
	public netTx(id: number | string): NnDspComponentControl {
		return new NnNetTxComponent(id, this.webSocket, this.designUtil, this.loggerConfig);
	}

	/**
	 * Method returns ducker component by its ID/name or null if none exist
	 * @param id number|string
	 * - number - id of the component
	 * - string - name of the component
	 */
	public ducker(id: number | string): NnDspDuckerControl {
		return new NnDuckerComponent(id, this.webSocket, this.designUtil, this.loggerConfig);
	}
}
