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
import { ButtonState, ButtonStatesSubscriptionNotify } from "../events/incoming/ButtonStatesSubscriptionNotify.ts";
import { logger } from "../utils/LoggerUtil.ts";
import { Consumer } from "../utils/FunctionalInterfaces.ts";

export class ButtonStates {
	private buttonStates: Map<string /*pin*/, boolean /* active*/> = new Map();

	private buttonChangeListeners: Map<string, Array<Consumer<boolean /*value*/>>> = new Map();
	private webSocket: WebSocketCommunication;
	private initialized: boolean = false;

	constructor(webSocket: WebSocketCommunication) {
		this.webSocket = webSocket;
	}

	public async init() {
		if (this.initialized) {
			return;
		}

		try {
			const subscriptionPromise = new Promise<void>(resolve => {
				let resolved = false;

				this.webSocket.subscribeToLiveEvent("buttonStatesSubscriptionRequest", "buttonStatesSubscriptionNotify", event => {
					this.onButtonStateEvent((event as ButtonStatesSubscriptionNotify).data);
					if (!resolved) {
						resolved = true;
						resolve();
					}
				});
			});
			await subscriptionPromise;
			this.initialized = true;
		} catch (e) {
			logger.error("Error during init button states. Error: ", String(e));
			throw e;
		}
	}

	/**
	 * Return singleton instance
	 */
	public static getInstance(webSocket: WebSocketCommunication): ButtonStates {
		return new ButtonStates(webSocket);
	}

	public getButtonNames(): string[] {
		return Array.from(this.buttonStates.keys());
	}

	public getButtonActive(buttonName: string): boolean {
		return this.buttonStates.get(buttonName) ?? false;
	}

	public addButtonListener(buttonName: string, listener: Consumer<boolean>) {
		const changeCbs = this.buttonChangeListeners.get(buttonName) ?? [];
		changeCbs.push(listener);
		this.buttonChangeListeners.set(buttonName, changeCbs);
		if (this.buttonStates.has(buttonName)) {
			listener(this.buttonStates.get(buttonName) as boolean);
		}
	}

	private onButtonStateEvent(states: Array<ButtonState>) {
		states.forEach(buttonState => {
			this.buttonStates.set(buttonState.name, buttonState.active);
			this.buttonChangeListeners.get(buttonState.name)?.forEach(cb => cb(buttonState.active));
		});
	}
}
