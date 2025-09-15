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
import { NnLoggerConfig } from "./utils/LoggerUtil.ts";
import { Consumer } from "./utils/FunctionalInterfaces.ts";
import { IEvent } from "./events/IEvent.ts";
import { INnounceClientRequestEvent } from "./events/INnounceClientRequestEvent.ts";
import { INnounceClientResultEvent } from "./events/INnounceClientResultEvent.ts";
import { ConnectionOptions } from "./nnounceScriptingApi.ts";
import { API_KEY, HOSTNAME } from "./communication/getUrlAddress.ts";

export class RawSocket {
	private webSocket: WebSocketCommunication;

	private constructor(webSocket: WebSocketCommunication) {
		this.webSocket = webSocket;
	}

	public static connectLocal(connectionOptions?: ConnectionOptions): RawSocket {
		// @ts-ignore Deno - couldn't generate typings file
		const hostname: string = Deno.env.has(HOSTNAME) ? Deno.env.get(HOSTNAME) : "localhost";
		// @ts-ignore Deno - couldn't generate typings file
		const apiKey: string | null = Deno.env.has(API_KEY) ? Deno.env.get(API_KEY) : null;

		return RawSocket.connectRemote(hostname, apiKey, connectionOptions);
	}

	public static connectRemote(hostname: string, apiKey: string | null, connectionOptions?: ConnectionOptions): RawSocket {
		const loggerConfig = NnLoggerConfig.getInstance();
		loggerConfig.setEnabledInternal(connectionOptions?.enableInternalLogging ?? false);

		const webSocket = new WebSocketCommunication(hostname, apiKey, loggerConfig);
		return new RawSocket(webSocket);
	}

	public registerEventHandler(eventType: string, eventHandler: Consumer<IEvent>) {
		this.webSocket.addEventHandler(eventType, eventHandler);
	}

	public sendEvent(event: IEvent) {
		this.webSocket.sendEvent(event);
	}

	public async sendEventWithResponse<REQUEST extends INnounceClientRequestEvent, RESPONSE extends INnounceClientResultEvent>(
		request: REQUEST
	): Promise<RESPONSE> {
		return this.webSocket.sendEventWithResponse(request, false);
	}
}
