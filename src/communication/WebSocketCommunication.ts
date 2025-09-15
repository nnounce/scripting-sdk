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

import { Consumer } from "../utils/FunctionalInterfaces.ts";
import { IEvent } from "../events/IEvent.ts";
import { getWsUrl } from "./getUrlAddress.ts";
import { logger, NnLoggerConfig } from "../utils/LoggerUtil.ts";
import { INnounceClientResultEvent } from "../events/INnounceClientResultEvent.ts";
import { INnounceClientRequestEvent } from "../events/INnounceClientRequestEvent.ts";
import { ISubscriptionEvent } from "../events/ISubscriptionEvent.ts";
import { IPollSubscriptionEvent } from "../events/IPollSubscriptionEvent.ts";
import { WS_HEARTBEAT_INTERVAL, WS_MISSING_HEARTBEAT_TIMEOUT_MS } from "./constants.ts";

/**
 * Manages WebSocket communication for subscribing to events, sending messages,
 * handling responses, and managing reconnection and heartbeat mechanisms.
 */
export class WebSocketCommunication {
	private hostname: string;
	private apiKey: string | null;
	private loggerConfig: NnLoggerConfig;

	private socket: WebSocket | null = null;
	private reconnectTimeout: number = 0;
	private subscriptionEvents: Array<string> = new Array<string>();
	private disconnectEventBuffer: Array<string> = new Array<string>();
	private eventHandlers: Map<string, Consumer<IEvent>> = new Map<string, Consumer<IEvent>>();

	private eventResultHandlers: Map<string /* requestId */, Consumer<INnounceClientResultEvent>> = new Map<
		string,
		Consumer<INnounceClientResultEvent>
	>();

	private heartbeatSendingInterval: number | null = null;
	private lastIncomeHeartbeat: Date | null = null;

	/**
	 * Creates an instance of the class, initializes with the provided hostname and API key, and establishes a connection.
	 *
	 * @param {string} hostname - The hostname of the server to connect to.
	 * @param {string} apiKey - The API key used for authentication (optional).
	 */
	constructor(hostname: string, apiKey: string | null, loggerConfig: NnLoggerConfig) {
		this.hostname = hostname;
		this.apiKey = apiKey;
		this.loggerConfig = loggerConfig;
		this.connect();
	}

	private connect() {
		clearTimeout(this.reconnectTimeout);
		if (this.socket != null) {
			return;
		}

		const url = getWsUrl(this.hostname, this.apiKey);
		//Connect the socket
		try {
			const ws = new WebSocket(url);
			this.loggerConfig.isEnabledInternal() && logger.info("Connecting to websocket");

			ws.addEventListener("open", () => {
				this.loggerConfig.isEnabledInternal() && logger.info("Websocket connected");
				this.onConnect();
			});

			ws.addEventListener("message", (message: MessageEvent) => this.receiveMessage(message));
			ws.addEventListener("close", () => this.onDisconnect(ws));
			ws.addEventListener("error", (e: Event) => {
				this.loggerConfig.isEnabledInternal() &&
					logger.warn("{} - trying to reconnect.", e instanceof ErrorEvent ? e.message : "WebSocket error");
				this.reconnect();
			});
			this.socket = ws;
		} catch (e) {
			this.loggerConfig.isEnabledInternal() && logger.error("Connecting to websocket failed.");
			console.error(e);
			this.reconnect();
		}
	}

	/**
	 * Sends an event message.
	 * If the socket is disconnected, messages are queued and sent as soon as the websocket connects.
	 *
	 * Subscription events are handled a bit different:
	 * They are added to the list of subscriptions and then sent.
	 * In case the socket reconnects, all subscription events from the list are sent automatically to ensure subscription si renewed.
	 *
	 * @param {object} message - The message object to be sent.
	 * @param {boolean} [isSubscriptionEvent=false] - Indicates if the message is a subscription event. Default is false.
	 * @return {void} This method does not return a value.
	 */
	public sendEvent(message: object, isSubscriptionEvent: boolean = false) {
		const jsonMessage = JSON.stringify(message);
		if (isSubscriptionEvent) {
			this.loggerConfig.isEnabledInternal() && logger.debug("Subscription for event: {}", jsonMessage);
			this.subscriptionEvents.push(jsonMessage);
		}
		this.sendMessageToSocket(jsonMessage, isSubscriptionEvent);
	}

	/**
	 * Sends a request event and waits for a corresponding response event.
	 * The method attempts to resolve or reject the response based on the received event state.
	 *
	 * @param {REQUEST} requestEvent - The request event to be sent, which contains necessary details for processing.
	 * @param {boolean} [isSubscriptionEvent=false] - Indicates whether the event being sent is a subscription-based event.
	 * @return {Promise<RESPONSE>} Returns a Promise that resolves with the response event of type RESPONSE if the operation is successful, or rejects if there's a failure or timeout.
	 */
	public async sendEventWithResponse<REQUEST extends INnounceClientRequestEvent, RESPONSE extends INnounceClientResultEvent>(
		requestEvent: REQUEST,
		isSubscriptionEvent: boolean = false
	): Promise<RESPONSE> {
		let timeout: number = 0;
		const promise: Promise<RESPONSE> = new Promise((resolve, reject) => {
			this.eventResultHandlers.set(requestEvent.requestId, event => {
				const response: RESPONSE = event as RESPONSE;
				if (response.state !== "OK") {
					reject(response.failReason);
				} else {
					resolve(response);
				}
			});
			timeout = setTimeout(() => {
				if (this.eventResultHandlers.delete(requestEvent.requestId)) {
					reject(`Response was not obtained in 60s`);
				}
			}, 60000);
		});
		this.sendEvent(requestEvent, isSubscriptionEvent);
		const r = await promise;
		clearTimeout(timeout);
		return r;
	}

	/**
	 * Adds an event handler for a specified event type.
	 * Registers a callback function to handle events of the given type.
	 *
	 * @param {string} type - The type of the event to add a handler for.
	 * @param {Consumer<IEvent>} onEvent - The callback function to handle the event.
	 * @return {void} This method does not return a value.
	 */
	public addEventHandler(type: string, onEvent: Consumer<IEvent>) {
		this.eventHandlers.set(type, onEvent);
	}

	/**
	 * Subscribes to a specific event by sending a subscription request and registering an event handler.
	 *
	 * @param {string} requestType - The type of the subscription request for subscribing to the event.
	 * @param {string} responseType - The type of the response expected for the event.
	 * @param {number} dataEveryMs - The interval, in milliseconds, at which the subscription notifications are expected.
	 * @param {Consumer<IEvent>} onEvent - The consumer function that handles the received event.
	 * @return {void} Does not return a value.
	 */
	public subscribeToEvent(requestType: string, responseType: string, dataEveryMs: number, onEvent: Consumer<IEvent>) {
		this.eventHandlers.set(responseType, onEvent);
		// keepAliveMs 0 = forever until websocket is disconnected
		const eventSubscription: IPollSubscriptionEvent = {
			type: requestType,
			dataEveryMs,
			keepAliveMs: 0,
			responseTag: "deno-script-api",
		};

		this.sendEvent(eventSubscription, true);
	}

	/**
	 * Subscribes to a live event by specifying the request and response types along with an event handler.
	 *
	 * @param {string} requestType - The type of the request that initiates the subscription to the event.
	 * @param {string} responseType - The type of the response to be handled during the live event subscription.
	 * @param {Consumer<IEvent>} onEvent - A callback function to handle the event when it occurs.
	 * @return {void} This method does not return a value.
	 */
	public subscribeToLiveEvent(requestType: string, responseType: string, onEvent: Consumer<IEvent>) {
		this.eventHandlers.set(responseType, onEvent);
		// keepAliveMs 0 = forever until websocket is disconnected
		const eventSubscription: ISubscriptionEvent = {
			keepAliveMs: 0,
			responseTag: "deno-script-api",
			type: requestType,
		};

		this.sendEvent(eventSubscription, true);
	}

	/**
	 * Checks whether the WebSocket connection is currently open and active.
	 *
	 * @return {boolean} Returns true if the WebSocket connection exists and is in the OPEN state, otherwise returns false.
	 */
	public connected(): boolean {
		return !!this.socket && this.socket.readyState == WebSocket.OPEN;
	}

	private sendMessageToSocket(jsonMessage: string, isSubscriptionEvent: boolean) {
		if (this.connected()) {
			this.loggerConfig.isEnabledInternal() && logger.debug("Sending msg to websocket - message {}", jsonMessage);
			this.socket?.send(jsonMessage);
			return;
		}
		if (isSubscriptionEvent) {
			// e.g. subscription events are sent on websocket connect
			this.loggerConfig.isEnabledInternal() &&
				logger.warn(
					"Websocket is not connected. Subscription event will be sent once websocket connection is established. Event: {}",
					jsonMessage
				);
			return;
		}
		this.disconnectEventBuffer.push(jsonMessage);
		this.loggerConfig.isEnabledInternal() &&
			logger.warn(
				"Websocket is not connected. Event added into disconnected buffer. Disconnected buffer size:{}. Event: {}",
				this.disconnectEventBuffer.length,
				jsonMessage
			);
		return;
	}

	private onDisconnect(socket: WebSocket) {
		if (this.socket != socket) {
			return;
		}
		this.loggerConfig.isEnabledInternal() && logger.info("Websocket disconnected");
		this.reconnect();
	}

	private onConnect() {
		this.subscriptionEvents.forEach(json => this.sendMessageToSocket(json, true));
		const disconnectEventBuffer = this.disconnectEventBuffer;
		this.disconnectEventBuffer = [];
		disconnectEventBuffer.forEach(json => {
			this.sendMessageToSocket(json, false);
		});
		this.startSendHeartBeat();
		this.addEventHandler("heartbeat", () => {
			this.lastIncomeHeartbeat = new Date();
		});
	}

	private receiveMessage(msg: MessageEvent) {
		const msgEvent = JSON.parse(msg.data);
		if (!msgEvent) {
			logger.error("Suspicious state! Cannot parse received event: {}", msg.data);
			return;
		}
		// TODO Ensure that events are triggered only when changes occur or in response to requests.
		// this.loggerConfig.isEnabledInternal() && logger.debug("Received event: " + msgEvent.type)
		if (msgEvent.requestId) {
			this.processResponse(msgEvent as INnounceClientResultEvent);
			return;
		}

		const action = this.eventHandlers.get(msgEvent.type);
		if (action != null) {
			action(msgEvent);
		}
	}

	private processResponse(resultEvent: INnounceClientResultEvent) {
		this.loggerConfig.isEnabledInternal() && logger.debug("Process response with ID {}", resultEvent.requestId);
		const listener = this.eventResultHandlers.get(resultEvent.requestId);
		if (listener) {
			this.eventResultHandlers.delete(resultEvent.requestId);
			listener(resultEvent);
			return;
		}
		this.loggerConfig.isEnabledInternal() && logger.warn("No listener is available for process result event: " + resultEvent);
	}

	private reconnect() {
		this.reconnectTimeout = setTimeout(() => {
			this.disconnect();
			this.connect();
		}, 1000);
	}

	private disconnect() {
		if (this.socket != null) {
			this.stopSentHeartBeat();
			const socket = this.socket;
			this.socket = null;
			if (socket.readyState == WebSocket.OPEN || socket.readyState == WebSocket.CONNECTING) {
				this.loggerConfig.isEnabledInternal() && logger.debug("Closing socket");
				socket.close(1000);
			}
		}
	}

	private startSendHeartBeat() {
		this.stopSentHeartBeat();
		const event: IEvent = {
			type: "heartbeat",
		};
		this.heartbeatSendingInterval = setInterval(() => {
			if (this.connected()) {
				this.sendEvent(event);
			}

			if (this.isHeartbeatTimeout()) {
				this.loggerConfig.isEnabledInternal() && logger.warn("Close socket due to missing heartbeat");
				this.socket?.close(1000, "Missing heartbeat");
			}
		}, WS_HEARTBEAT_INTERVAL);
		this.lastIncomeHeartbeat = new Date();
	}

	private stopSentHeartBeat() {
		if (this.heartbeatSendingInterval) {
			clearInterval(this.heartbeatSendingInterval);
			this.heartbeatSendingInterval = null;
			this.lastIncomeHeartbeat = null;
		}
	}

	private isHeartbeatTimeout() {
		if (!this.lastIncomeHeartbeat) {
			return false;
		}
		return new Date().getTime() - this.lastIncomeHeartbeat.getTime() > WS_MISSING_HEARTBEAT_TIMEOUT_MS;
	}
}
