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

import { DspDesignRuntime, NpdComponentGainConfig, NpdComponentMuteConfig } from "../../events/dto/DspDesign.ts";
import { WebSocketCommunication } from "../../communication/WebSocketCommunication.ts";
import { createRuntimeUpdateEvent, RuntimeUpdateEvent } from "../../events/outgoing/RuntimeUpdateEvent.ts";
import { logger, NnLoggerConfig } from "../../utils/LoggerUtil.ts";
import { Processor } from "../../utils/FunctionalInterfaces.ts";
import { DesignUtil } from "../DesignUtil.ts";
import { INnounceClientResultEvent } from "../../events/INnounceClientResultEvent.ts";
import { NnDspComponentControl } from "./NnDspComponentControl.ts";
import { NpdComponentMetadata } from "./NpdComponentMetadata.ts";

const CHECK_DESIGN_UPDATE_ATTEMPT: number = 5;

/**
 * The ANnDspComponent class provides a representation of DSP (Digital Signal Processing) components
 * with support for controlling and managing runtime settings such as gain and mute.
 *
 * This class interacts with a WebSocket for communication and uses a logger configuration
 * for internal operations. It supports runtime configuration updates for DSP components
 * and includes retry mechanisms for ensuring the success of updates.
 *
 * The component uses metadata to access and modify configuration properties in real-time.
 */
export class ANnDspComponent implements NnDspComponentControl {
	private readonly id: number | string;
	private readonly componentType: string;
	private componentId: string | null;
	private webSocket: WebSocketCommunication;
	private loggerConfig: NnLoggerConfig;
	private designUtil: DesignUtil;

	/**
	 * Constructs an instance of the class with the given parameters.
	 *
	 * @param {number|string} id - The unique identifier for the component.
	 * @param {string} componentType - The type of the component.
	 * @param {WebSocketCommunication} webSocket - The instance of WebSocket communication to be used.
	 * @param {DesignUtil} designUtil - Device design util.
	 * @param {NnLoggerConfig} loggerConfig - The configuration for logging.
	 */
	constructor(
		id: number | string,
		componentType: string,
		webSocket: WebSocketCommunication,
		designUtil: DesignUtil,
		loggerConfig: NnLoggerConfig
	) {
		this.id = id;
		this.componentId = designUtil.getComponentId(id);
		this.componentType = componentType;
		this.webSocket = webSocket;
		this.loggerConfig = loggerConfig;
		this.designUtil = designUtil;
	}

	/**
	 * @return gain value of component with current id | name
	 */
	public getGain() {
		if (!this.webSocket.connected()) {
			throw new Error("WebSocket is not connected");
		}
		const npdComponentData = this.designUtil.getComponentMetadata(this.id, this.componentType);
		const gainComponent = npdComponentData.npdComponentConfig as NpdComponentGainConfig;
		return gainComponent.gain;
	}

	/**
	 * The method updates the 'gain' field of the component and sends a runtime update request.
	 * After sending the update, the new design is loaded to compare if the new value has changed.
	 * This operation will retry if the field update is not applied, with a maximum of 5 attempts.
	 * @param value
	 */
	public async setGain(value: number) {
		if (!this.webSocket.connected()) {
			throw new Error("WebSocket is not connected");
		}
		if (typeof value !== "number") {
			this.loggerConfig.isEnabledInternal() && logger.warn("The provided parameter is not a number");
			return;
		}

		return await this.setGainInternal(value, CHECK_DESIGN_UPDATE_ATTEMPT);
	}

	/**
	 * @return mute value of component with current id | name
	 */
	public isMute() {
		if (!this.webSocket.connected()) {
			throw new Error("WebSocket is not connected");
		}
		const npdComponentData = this.designUtil.getComponentMetadata(this.id, this.componentType);
		const muteComponent = npdComponentData.npdComponentConfig as NpdComponentMuteConfig;
		return muteComponent.mute;
	}

	/**
	 * The method updates the 'mute' field of the component and sends a runtime update request.
	 * After sending the update, the new design is loaded to compare if the new value has changed.
	 * This operation will retry if the field update is not applied, with a maximum of 5 attempts.
	 * @param mute
	 */
	public async setMute(mute: boolean) {
		if (!this.webSocket.connected()) {
			throw new Error("WebSocket is not connected");
		}
		if (typeof mute !== "boolean") {
			this.loggerConfig.isEnabledInternal() && logger.warn("The provided parameter is not a boolean");
			return;
		}

		return await this.setMuteInternal(mute, CHECK_DESIGN_UPDATE_ATTEMPT);
	}

	private async setGainInternal(value: number, setAndCheckAttempt: number) {
		if (setAndCheckAttempt === 0) {
			this.loggerConfig.isEnabledInternal() &&
				logger.warn(
					"There is no attempt to check runtime component with ID '{}' of type '{}'",
					this.componentId,
					this.componentType
				);
			return;
		}
		const npdComponentData = this.designUtil.getComponentMetadata(this.id, this.componentType);

		const gainComponent = npdComponentData.npdComponentConfig as NpdComponentGainConfig;
		gainComponent.gain = value;
		await this.sendRuntimeUpdate(npdComponentData, async error => {
			logger.warn(
				"Gain of runtime component with ID '{}' of type '{}' wasn't updated. Reason: '{}', try again",
				this.componentId,
				this.componentType,
				error
			);
			await this.setGainInternal(value, --setAndCheckAttempt);
		});
	}

	private async setMuteInternal(mute: boolean, setAndCheckAttempt: number) {
		if (setAndCheckAttempt === 0) {
			this.loggerConfig.isEnabledInternal() &&
				logger.warn(
					"There is no attempt to check runtime component with ID '{}' of type '{}'",
					this.componentId,
					this.componentType
				);
			return;
		}

		const npdComponentData = this.designUtil.getComponentMetadata(this.id, this.componentType);

		const muteComponent = npdComponentData.npdComponentConfig as NpdComponentMuteConfig;
		muteComponent.mute = mute;
		await this.sendRuntimeUpdate(npdComponentData, async error => {
			logger.warn(
				"Mute of runtime component with ID '{}' of type '{}' wasn't updated. Reason: '{}', try again",
				this.componentId,
				this.componentType,
				error
			);
			await this.setMuteInternal(mute, --setAndCheckAttempt);
		});
	}

	/**
	 * Create update event and check if update was successful
	 * @param npdComponentData
	 * @param notChangedCallback - callback for retry update
	 * * @protected
	 */
	protected async sendRuntimeUpdate(npdComponentData: NpdComponentMetadata, notChangedCallback: Processor<string, Promise<void>>) {
		npdComponentData.designMetadata.last_modified_runtime = new Date().getTime();
		const data: DspDesignRuntime = {
			metadata: npdComponentData.designMetadata,
			runtime: npdComponentData.designRuntime,
		};

		try {
			await this.webSocket.sendEventWithResponse<RuntimeUpdateEvent, INnounceClientResultEvent>(createRuntimeUpdateEvent(data));
			this.loggerConfig.isEnabledInternal() &&
				logger.debug("Runtime component with ID '{}' of type '{}' was successfully updated", this.componentId, this.componentType);
		} catch (e) {
			if (typeof e === "string") {
				await notChangedCallback(e);
			}
			console.warn("Unexpected error occurred: ", e);
			throw e;
		}
	}
}
