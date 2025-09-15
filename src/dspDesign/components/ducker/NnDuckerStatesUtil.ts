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

import { Consumer } from "../../../utils/FunctionalInterfaces.ts";
import { WebSocketCommunication } from "../../../communication/WebSocketCommunication.ts";
import { logger, NnLoggerConfig } from "../../../utils/LoggerUtil.ts";
import { DuckerPriorityActiveChangeNotify } from "../../../events/incoming/DuckerPriorityActiveChangeNotify.ts";

/**
 * Utility class for managing and notifying state changes related to Ducker priority activation.
 */
export class NnDuckerStatesUtil {
	private activeChangeListeners: Map<string, Array<Consumer<boolean /*priorityActive*/>>> = new Map();
	private webSocket: WebSocketCommunication;
	private loggerConfig: NnLoggerConfig;

	/**
	 * Constructs an instance of the class.
	 *
	 * @param {WebSocketCommunication} webSocket - The WebSocket communication instance used for subscribing to and handling live events.
	 * @param {NnLoggerConfig} loggerConfig - Configuration for logging.
	 */
	constructor(webSocket: WebSocketCommunication, loggerConfig: NnLoggerConfig) {
		this.loggerConfig = loggerConfig;
		this.webSocket = webSocket;
		this.webSocket.subscribeToLiveEvent("duckerPriorityActiveChangeSubscriptionRequest", "duckerPriorityActiveChangeNotify", event =>
			this.onPrimaryActiveChangeEvent(event as DuckerPriorityActiveChangeNotify)
		);
	}

	/**
	 * Registers a listener for changes in active state for a given component.
	 *
	 * @param {string} componentId - The unique identifier of the component to track.
	 * @param {Consumer<boolean>} listener - A callback function to execute when the active state of the component changes.
	 * @return {Object} An object with a `removeListener` method that allows the listener to be unregistered.
	 */
	public onActiveChange(componentId: string, listener: Consumer<boolean>) {
		const changeCbs = this.activeChangeListeners.get(componentId) ?? [];
		changeCbs.push(listener);
		this.activeChangeListeners.set(componentId, changeCbs);
		return {
			removeListener: () => {
				const inputChangeCbs = this.activeChangeListeners.get(componentId) ?? [];
				const index = inputChangeCbs.indexOf(listener);
				inputChangeCbs.splice(index, 1);
				this.activeChangeListeners.set(componentId, inputChangeCbs);
			},
		};
	}

	private onPrimaryActiveChangeEvent(event: DuckerPriorityActiveChangeNotify) {
		this.loggerConfig.isEnabledInternal() && logger.debug("Ducker priority active changed to '{}'", event.priorityActive);
		const onChangeCallbacks = this.activeChangeListeners.get(event.componentId.toString());
		onChangeCallbacks?.forEach(cb => cb(event.priorityActive));
	}
}
