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

import { ANpdConfig, DesignMetadata } from "../events/dto/DspDesign.ts";
import { RetryUtil } from "../utils/RetryUtil.ts";
import { WebSocketCommunication } from "../communication/WebSocketCommunication.ts";
import { createDesignLoadEvent } from "../events/outgoing/DesignLoadEvent.ts";
import { logger } from "../utils/LoggerUtil.ts";
import { DesignLoadResultEvent } from "../events/incoming/DesignLoadResultEvent.ts";
import { DesignRuntimeChangedSubscriptionRequestEvent } from "../events/outgoing/DesignRuntimeChangedSubscriptionRequestEvent.ts";
import { DesignRuntimeChangedSubscriptionNotifyEvent } from "../events/incoming/DesignRuntimeSubscriptionNotify.ts";
import { NnComponentName } from "./components/NnComponentName.ts";
import { NpdComponentMetadata } from "./components/NpdComponentMetadata.ts";
import { Callback } from "../utils/FunctionalInterfaces.ts";

/**
 * Enum representing the possible states of a design loading process.
 *
 * @enum {number}
 * @property {number} NONE - Represents the initial or default state where no loading has started.
 * @property {number} DONE - Indicates that the loading process was completed successfully.
 * @property {number} LOADING - Denotes that the loading process is currently in progress.
 * @property {number} ERROR - Signifies that an error occurred during the loading process.
 */
enum LoadDesignState {
	NONE,
	DONE,
	LOADING,
	ERROR,
}

/**
 * Partial design holding only supported runtime data (for components NetTx. NetRx, Gain),
 * which are updated on change, design metadata and map for component name to component ID
 */
interface PartialDesign {
	metadata: DesignMetadata;
	runtime: { [key: string]: ANpdConfig };
	nameToId: Map<string, number>;
}

/**
 * The DesignHelper class provides functionality to assist with the design loading process.
 * It tracks the state of design loading, handles events, and manages runtime processing logic.
 *
 * Properties:
 * - partialDesign: The loaded partial design object, if applicable.
 * - timestamp: A numeric timestamp indicating the last update time for the design.
 * - state: The current state of the design loading process, represented by an enum of type LoadDesignState.
 * - loadFinishConsumers: An array of consumer functions that are triggered upon the completion of design loading.
 * - loaderIdentifier: An optional identifier for the design loader being used.
 */
class DesignHelper {
	public partialDesign?: PartialDesign;
	public timestamp: number;
	public state: LoadDesignState;
	public loadFinishConsumers: Array<Callback>;
	public loaderIdentifier?: string;

	/**
	 * Initializes a new instance of the class with default properties.
	 * The `timestamp` is set to 0, `state` is set to `LoadDesignState.NONE`,
	 * `loadFinishConsumers` is initialized as an empty array, and
	 *
	 * @return {Object} An instance of the class with default values for all properties.
	 */
	constructor() {
		this.timestamp = 0;
		this.state = LoadDesignState.NONE;
		this.loadFinishConsumers = [];
	}
}

/**
 * Utility class for managing the design metadata and communicating with a WebSocket for design-related operations.
 * This class handles loading, initializing, and maintaining design state and metadata, and it facilitates communication
 * between the client application and a remote WebSocket server for real-time design updates.
 */
export class DesignUtil {
	private static readonly DESIRED_COMPONENT_TYPES: string[] = [
		NnComponentName.GAIN_COMPONENT_NAME,
		NnComponentName.NET_RX_COMPONENT_NAME,
		NnComponentName.NET_TX_COMPONENT_NAME,
		NnComponentName.DUCKER_COMPONENT_NAME,
	];

	private designMetadata = new DesignHelper();
	private webSocket: WebSocketCommunication;

	private constructor(websocket: WebSocketCommunication) {
		this.webSocket = websocket;
	}

	public static getInstance(websocket: WebSocketCommunication): DesignUtil {
		return new DesignUtil(websocket);
	}

	/**
	 * Initializes the design by subscribing to necessary events and loading design metadata.
	 *
	 * @return {Promise<void>} A Promise that resolves when the design initialization is complete.
	 * @throws {Error} If an error occurs during the initialization process.
	 */
	public async initDesign() {
		if (this.designMetadata.state !== LoadDesignState.NONE) {
			return;
		}
		try {
			// first load design to populate this.designMetadata.partialDesign
			const designChangePromise = new Promise<void>(resolve => {
				let resolved = false;
				this.webSocket.subscribeToLiveEvent("designChangeSubscriptionRequest", "designChangeNotify", async event => {
					this.designMetadata.partialDesign = undefined;
					this.designMetadata.state = LoadDesignState.NONE;
					await this.loadDesign();
					if (!resolved) {
						resolved = true;
						resolve();
					}
				});
			});
			await designChangePromise;

			// now subscribe for runtime changes
			const requestEvent: DesignRuntimeChangedSubscriptionRequestEvent = {
				type: "designRuntimeChangedSubscriptionRequest",
				keepAliveMs: 0,
				responseTag: "deno-script-api",
				componentNames: DesignUtil.DESIRED_COMPONENT_TYPES,
			};

			// add listener for changes, then send subscription event
			const runtimeChangedSubscriptionPromise = new Promise<void>(resolve => {
				let resolved = false;
				this.webSocket.addEventHandler("designRuntimeChangedSubscriptionNotify", event => {
					this.processRuntimeChangedNotifyEvent(event as DesignRuntimeChangedSubscriptionNotifyEvent);
					if (!resolved) {
						resolved = true;
						resolve();
					}
				});
			});
			// using sendEvent(..) instead of subscribeToLiveEvent(..) because subscription event has extra field 'componentNames'
			this.webSocket.sendEvent(requestEvent, true);
			await runtimeChangedSubscriptionPromise;
		} catch (e) {
			logger.error("Error during init DSP design. Error: ", String(e));
			throw e;
		}
	}

	/**
	 * This method loads the design data.
	 *
	 * @return {Object} The partial design metadata loaded during the process.
	 * @throws Will throw an error if the loading process fails. If the DSP is not running any design, this method will set internal Error state and return normally. Accessing the design later will result in an error.
	 */
	public async loadDesign() {
		const identifier = DesignUtil.getIdentifier();
		try {
			await this.loadDesignInternal(identifier);
		} catch (e) {
			logger.error("Error during loading design: {}", e);
			this.notifyAllDesignConsumers();
			throw e;
		}
	}

	/**
	 * Retrieves the metadata for a specific component based on its ID or name and type.
	 *
	 * @param {number | string} id - The ID or name of the component to retrieve.
	 * @param {string} type - The type of the component to which the metadata belongs.
	 * @return {NpdComponentMetadata} The metadata object of the specified component if found.
	 * @throws {Error} If the component cannot be found by the specified ID or name and type.
	 */
	public getComponentMetadata(id: number | string, type: string): NpdComponentMetadata {
		if (this.designMetadata.state !== LoadDesignState.DONE) {
			throw new Error("Design is not available.");
		}
		const componentId = this.getComponentId(id);

		if (componentId == null) {
			throw new Error("Cannot find component with ID or name '" + id + "'.");
		}

		const npdComponentConfig = this.designMetadata.partialDesign?.runtime?.[componentId] ?? null;

		if (this.designMetadata.partialDesign && npdComponentConfig?.type === type) {
			return new NpdComponentMetadata(
				npdComponentConfig,
				this.designMetadata.partialDesign.runtime,
				this.designMetadata.partialDesign.metadata
			);
		}

		let available: string[] = [];
		if (this.designMetadata.partialDesign?.runtime) {
			available = Object.entries(this.designMetadata.partialDesign.runtime)
				.filter(entry => entry[1].type === type)
				.map(entry => entry[0]);
		}
		const identifierText = id === componentId ? "name" : "ID";
		logger.error(
			"Cannot find runtime {} component with {} '{}'. Available IDs are {}",
			type,
			identifierText,
			componentId,
			available.join(", ")
		);
		throw new Error("Cannot find component with ID or name '" + id + "' of type '" + type + "'.");
	}

	/**
	 * Retrieves the component identifier as a string. If the input ID is a string, it attempts to map it
	 * to a numerical ID using the provided design. Otherwise, it converts the numerical ID directly to a string.
	 *
	 * @param {number | string} id - The component identifier, which can either be a number or a string.
	 * @return {string} The component identifier represented as a string. If a matching ID is not found for a string input, returns the input string.
	 */
	public getComponentId(id: number | string): string | null {
		if (this.designMetadata.state !== LoadDesignState.DONE) {
			throw new Error("Design is not available.");
		}
		const dspDesign = this.designMetadata.partialDesign;
		if (!dspDesign) {
			return null;
		}
		if (typeof id === "string") {
			const id_number = dspDesign.nameToId.get(id);
			return id_number ? `${id_number}` : id;
		}

		return `${id}`;
	}

	private processRuntimeChangedNotifyEvent(event: DesignRuntimeChangedSubscriptionNotifyEvent) {
		if (!this.designMetadata.partialDesign) {
			// design should be loaded due to initialization or change
			return;
		}
		for (const componentRuntime of event.data) {
			this.designMetadata.partialDesign.runtime[`${componentRuntime.index}`] = {
				type: componentRuntime.cmpType,
				...componentRuntime.data,
			};
		}
	}

	private async loadDesignInternal(identifier: string) {
		if (this.designMetadata.state == LoadDesignState.LOADING && this.designMetadata.loaderIdentifier !== identifier) {
			// some ask for design before. wait for its completion
			return new Promise<void>((resolve, reject) => {
				if (this.designMetadata.state == LoadDesignState.LOADING) {
					this.designMetadata.loadFinishConsumers.push(() => {
						resolve();
					});
				} else {
					// main loader finish design load before creating this promise, finish the promise new design is already loaded
					resolve();
				}
			});
		}

		// set this thread as main loader. Other load request which will come until the design is not loaded will be registered as
		// consumers and these will wait for main loader result
		this.designMetadata.state = LoadDesignState.LOADING;
		this.designMetadata.loaderIdentifier = identifier;
		const event = await RetryUtil.runAsync("Loading design", () => this.webSocket.sendEventWithResponse(createDesignLoadEvent()));
		const dspDesign = (event as DesignLoadResultEvent).data;

		if (!dspDesign) {
			// DSP is not running any design, so we set our state and return
			// this leads to script API not crashing, but accessing/modifying design runtime will throw an error
			this.designMetadata.state = LoadDesignState.ERROR;
			this.notifyAllDesignConsumers();
			return;
		}
		const nameToIdMap: Map<string, number> = new Map();
		const runtime: { [key: string]: ANpdConfig } = {};

		Object.entries(dspDesign.runtime)
			.filter(entry => DesignUtil.DESIRED_COMPONENT_TYPES.indexOf(entry[1].type) > -1)
			.forEach(entry => {
				const key = entry[0];
				runtime[key] = entry[1];
			});

		Object.values(dspDesign.drawflow.Home.data)
			.filter(entry => DesignUtil.DESIRED_COMPONENT_TYPES.indexOf(entry.type) > -1)
			.forEach(node => {
				nameToIdMap.set(node.name, node.id);
			});
		this.designMetadata.partialDesign = {
			nameToId: nameToIdMap,
			metadata: dspDesign.metadata,
			runtime: runtime,
		};
		this.designMetadata.timestamp = Date.now();
		this.designMetadata.state = LoadDesignState.DONE;
		this.notifyAllDesignConsumers();
	}

	private notifyAllDesignConsumers() {
		this.designMetadata.loadFinishConsumers.forEach(consumer => consumer());
		this.designMetadata.loadFinishConsumers = [];
	}

	private static getIdentifier() {
		return `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
	}
}
