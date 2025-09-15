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
import { createCallPrepareEventLocalFile, createCallPrepareEventRemoteFile } from "./events/outgoing/CallPrepareEvent.ts";
import { CallPrepareResultEvent } from "./events/incoming/CallPrepareResultEvent.ts";
import { createCallStartEvent } from "./events/outgoing/CallStartEvent.ts";
import { CallResultEvent, CallResultStatus } from "./events/incoming/CallResultEvent.ts";
import { logger, NnLoggerConfig } from "./utils/LoggerUtil.ts";
import { createCallCancelEvent } from "./events/outgoing/CallCancelEvent.ts";
import { CallProgressEvent } from "./events/incoming/CallProgressEvent.ts";

/**
 * Defines the parameters required for playing a local file.
 */
export type PlayLocalFileParam = {
	/**
	 * Priority of the call. The lower the number, the higher the priority.
	 */
	priority: number;
	/**
	 * Name of the file saved in the file manager (include folder structure).
	 */
	audioFilePath: string;
	/**
	 * Router output names, where the call should be played.
	 */
	outputs: Array<string>;
	/**
	 * Unique identifier of the call.
	 * If empty, the current timestamp will be used.
	 */
	actionId?: string;
	/**
	 * Whether the call is partial or not.
	 * Partial call means that not all outputs need to be reached for the call to be successful.
	 * Default is false.
	 */
	partial?: boolean;
};

/**
 * Represents the parameters required to play a remote file.
 */
export type PlayRemoteFileParam = {
	/**
	 * Priority of the call. The lower the number, the higher the priority.
	 */
	priority: number;
	/**
	 * Router output names, where the call should be played.
	 */
	outputs: Array<string>;
	/**
	 * Filename used for caching - should be unique for different content, same for same audio files.
	 */
	filename: string;
	/**
	 * Unique identifier of the call.
	 * If empty, the current timestamp will be used
	 */
	actionId?: string;
	/**
	 * Whether the call is partial or not.
	 * Partial call means that not all outputs need to be reached for the call to be successful.
	 * Default is false.
	 */
	partial?: boolean;
	/**
	 * Audio source info.
	 */
	audioSource: RemoteFileAudioSource;
};

/**
 * Represents a source for remote audio file playback, providing support for authentication, headers, and file validation.
 */
export interface RemoteFileAudioSource {
	/**
	 * URL of the audio file to be played.
	 */
	url: string;
	/**
	 * Headers which will be set to HTTP request.
	 */
	headers?: Map<string, string>;
	/**
	 * Basic auth username
	 * If empty or 'Authorization' header is present in headers, this field won't be applied
	 */
	basicAuthUsername?: string;
	/**
	 * Basic auth password
	 * If empty or 'Authorization' header is present in headers, this field won't be applied
	 */
	basicAuthPassword?: string;
	/**
	 * File's checksum for validation that the file is not corrupted during download.
	 * If empty, checksum validation won't be applied.
	 */
	checksum?: string;
	/**
	 * Checksum function used to generate checksum from downloaded file.
	 * If empty, checksum validation won't be applied.
	 * <p>
	 * Supported algorithms:
	 * <ul>
	 *    <li>blake2b</li>
	 *    <li>blake3</li>
	 *    <li>sha2-256</li>
	 *    <li>sha2-512</li>
	 *    <li>sha3-256</li>
	 *    <li>sha3-512</li>
	 * </ul>
	 */
	checksumMethod?: string;
}

/**
 * Provides API for processing calls on a device.
 * Local or remote files can be played. Supported formats are:
 * <ul>
 *     <li>.mp3</li>
 *     <li>.flac</li>
 *     <li>.wav</li>
 * </ul>
 */
export class NnPagingRouterDefinition {
	private callPrepareWaitingMap: Map<string, number> = new Map();
	private callTimeoutMap: Map<string, number> = new Map();
	private webSocket: WebSocketCommunication;
	private loggerConfig: NnLoggerConfig;

	/**
	 * Private constructor for initializing a new instance of the class.
	 * The constructor sets up event handlers for WebSocket communication and assigns the provided logger configuration.
	 *
	 * @param {WebSocketCommunication} webSocket - The WebSocket communication instance used for event handling.
	 * @param {NnLoggerConfig} loggerConfig - The configuration object for logger settings.
	 */
	private constructor(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig) {
		this.loggerConfig = loggerConfig;
		this.webSocket = webSocket;
		this.webSocket.addEventHandler("callPrepareResultEvent", event => this.onCallPrepareResultEvent(event as CallPrepareResultEvent));
		this.webSocket.addEventHandler("callResultEvent", event => this.onCallResultEvent(event as CallResultEvent));
		this.webSocket.addEventHandler("callProgressEvent", event => this.onCallProgressEvent(event as CallProgressEvent));
	}

	/**
	 * Create new instance
	 */
	public static getInstance(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig): NnPagingRouterDefinition {
		return new NnPagingRouterDefinition(webSocket, loggerConfig);
	}

	/**
	 * This method will start call, playing a local file from the File manager.
	 * @return call actionId. It can be used for future actions (e.g. cancel call)
	 * @param spec Local file specification, see {@link PlayLocalFileParam}
	 */
	public playLocalFile(spec: PlayLocalFileParam): string | null {
		if (!this.webSocket.connected()) {
			throw new Error("WebSocket is not connected");
		}

		const callPrepareEvent = createCallPrepareEventLocalFile(spec);

		this.callPrepareWaitingMap.set(
			callPrepareEvent.actionId,
			setTimeout(() => {
				// it's already timed out. Just delete it.
				if (this.callPrepareWaitingMap.delete(callPrepareEvent.actionId)) {
					this.loggerConfig.isEnabledInternal() && logger.warn("Call prepare result wasn't receive in 30 seconds");
				}
			}, 30000 /*30 seconds*/)
		);

		this.loggerConfig.isEnabledInternal() && logger.debug("Preparing call '{}'", callPrepareEvent.actionId);
		this.webSocket.sendEvent(callPrepareEvent);
		return callPrepareEvent.actionId;
	}

	/**
	 * This method will start call, playing a remote file.
	 * @return call actionId. It can be used for future actions (e.g. cancel call)
	 * @param spec Remote file specification, see {@link PlayRemoteFileParam}
	 */
	public playRemoteFile(spec: PlayRemoteFileParam): string | null {
		if (!this.webSocket.connected()) {
			throw new Error("WebSocket is not connected");
		}

		const callPrepareEvent = createCallPrepareEventRemoteFile(spec);

		this.callPrepareWaitingMap.set(
			callPrepareEvent.actionId,
			setTimeout(() => {
				// it's already timed out. Just delete it.
				if (this.callPrepareWaitingMap.delete(callPrepareEvent.actionId)) {
					this.loggerConfig.isEnabledInternal() && logger.warn("Call prepare result wasn't receive in 30 seconds");
				}
			}, 30000 /*30 seconds*/)
		);

		this.loggerConfig.isEnabledInternal() && logger.debug("Preparing call '{}'", callPrepareEvent.actionId);
		this.webSocket.sendEvent(callPrepareEvent);
		return callPrepareEvent.actionId;
	}

	/**
	 * Cancel call with given actionId
	 * @param actionId - unique identifier of the call
	 */
	public cancelCall(actionId: string) {
		if (!this.webSocket.connected()) {
			throw new Error("WebSocket is not connected");
		}

		this.webSocket.sendEvent(createCallCancelEvent(actionId));
	}

	private onCallPrepareResultEvent(event: CallPrepareResultEvent) {
		const activeCallPrepareWaiting = this.callPrepareWaitingMap.get(event.actionId);
		if (!activeCallPrepareWaiting) {
			this.loggerConfig.isEnabledInternal() && logger.warn("Prepare call '{}' was already timed out", event.actionId);
			return;
		}
		this.loggerConfig.isEnabledInternal() && logger.debug("Call '{}' was prepared", event.actionId);
		clearTimeout(activeCallPrepareWaiting);
		this.callPrepareWaitingMap.delete(event.actionId);

		if (event.failReason) {
			this.loggerConfig.isEnabledInternal() && logger.warn("Error during preparing call: {}", event.actionId);
			return;
		}

		this.callTimeoutMap.set(
			event.actionId,
			setTimeout(() => {
				if (this.callTimeoutMap.delete(event.actionId)) {
					this.loggerConfig.isEnabledInternal() && logger.warn("Call wasn't finished in 10 minutes.");
				}
			}, 600000 /*10 minutes*/)
		);

		this.loggerConfig.isEnabledInternal() && logger.debug("Starting call '{}'", event.actionId);
		this.webSocket.sendEvent(createCallStartEvent(event.actionId));
	}

	private onCallResultEvent(event: CallResultEvent) {
		const activeCallWaiting = this.callTimeoutMap.get(event.actionId);
		if (!activeCallWaiting) {
			this.loggerConfig.isEnabledInternal() && logger.warn("Call '{}' was already timed out", event.actionId);
			return;
		}

		if (event.failReason) {
			this.loggerConfig.isEnabledInternal() && logger.warn("Error during call: '{}': {}", event.actionId, event.failReason);
			clearTimeout(activeCallWaiting);
			this.callPrepareWaitingMap.delete(event.actionId);
			return;
		}

		switch (event.state) {
			case CallResultStatus.DONE:
				this.loggerConfig.isEnabledInternal() && logger.debug("Call '{}' finished", event.actionId);
				break;
			case CallResultStatus.BUSY:
				this.loggerConfig.isEnabledInternal() && logger.debug("Some of the output is busy. Try start again in 1 second");
				setTimeout(() => this.webSocket.sendEvent(createCallStartEvent(event.actionId)), 1000);
				return;
			case CallResultStatus.CANCELED:
				this.loggerConfig.isEnabledInternal() && logger.warn("Call '{}' was canceled", event.actionId);
				break;
			case CallResultStatus.TIMED_OUT:
				this.loggerConfig.isEnabledInternal() && logger.warn("Call '{}' timed out", event.actionId);
				break;
			case CallResultStatus.INTERRUPTED:
				this.loggerConfig.isEnabledInternal() && logger.warn("Call '{}' was interrupted", event.actionId);
				break;
			case CallResultStatus.FAILED:
				this.loggerConfig.isEnabledInternal() && logger.warn("Call '{}' failed", event.actionId);
				break;
		}

		clearTimeout(activeCallWaiting);
		this.callPrepareWaitingMap.delete(event.actionId);
		if (event.undeliveredOutputs != null) {
			Object.entries(event.undeliveredOutputs).forEach(([output, failReason]) => {
				this.loggerConfig.isEnabledInternal() && logger.warn("Output '{}' wasn't delivered due to: {}", output, failReason);
			});
		}
	}

	private onCallProgressEvent(event: CallProgressEvent) {
		this.loggerConfig.isEnabledInternal() &&
			logger.debug("Incoming call progress event for call '{}' with state '{}'", event.actionId, event.state);
		if (event.undeliveredOutputs != null) {
			Object.entries(event.undeliveredOutputs).forEach(([output, failReason]) => {
				this.loggerConfig.isEnabledInternal() && logger.warn("Output '{}' wasn't delivered due to: {}", output, failReason);
			});
		}
	}
}
