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

import { ConnectionOptions, NnounceScriptingApi } from "./nnounceScriptingApi.ts";
import { API_KEY, HOSTNAME } from "./communication/getUrlAddress.ts";
import { connectDevice } from "./nnounceConnector.ts";

/**
 * Tries to connect to the nnounce device. If successful, an instance of {@link NnounceScriptingApi} is returned.
 *
 * Hostname and api-key are searched for environment variables as {@link HOSTNAME} and {@link API_KEY} respectively:
 * If no hostname is provided, "localhost" is used.
 * If no api-key is provided, null is used.
 *
 * @param connectionOptions Connection options object
 */
export function nnounceDevice(connectionOptions?: ConnectionOptions): NnounceScriptingApi {
	// @ts-ignore Deno - couldn't generate typings file
	const hostname: string = Deno.env.has(HOSTNAME) ? Deno.env.get(HOSTNAME) : "localhost";
	// @ts-ignore Deno - couldn't generate typings file
	const apiKey: string | null = Deno.env.has(API_KEY) ? Deno.env.get(API_KEY) : null;
	return connectDevice(hostname, apiKey, connectionOptions);
}
