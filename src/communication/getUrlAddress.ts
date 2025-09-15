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

import { WS_MISSING_HEARTBEAT_TIMEOUT_SEC } from "./constants.ts";

export const HOSTNAME = "HOSTNAME";
export const TOKEN = "TOKEN";
export const API_KEY = "API_KEY";

/**
 * Composes a WebSocket URL using the provided hostname and API key.
 *
 * @param {string} hostname - The hostname to connect to, typically including the domain name.
 * @param {string} apiKey - The API key used for authentication. If not provided, it will be omitted from the URL.
 * @return {string} The complete WebSocket URL string formatted with the provided parameters.
 */
export function getWsUrl(hostname: string, apiKey: string | null): string {
	// @ts-ignore Deno - couldn't generate typings file
	const apiKeyParam = apiKey ? `api-key=${apiKey}&` : "";
	let hostNameAndPort = `${hostname}:443`;
	return `wss://${hostNameAndPort}/api/public/ws/control?${apiKeyParam}label=Script&kill_timeout=${WS_MISSING_HEARTBEAT_TIMEOUT_SEC}`;
}

/**
 * Retrieves a token from the environment.
 *
 * The method attempts to fetch the value of a token stored in the environment
 * variable specified by `TOKEN`. If the token is not found, it defaults to an
 * empty string.
 *
 * @return {string} The token retrieved from the environment or an empty string.
 */
export function getToken(): string {
	// @ts-ignore Deno - couldn't generate typings file
	return Deno.env.get(TOKEN) ?? "";
}

/**
 * Retrieves the host name and port as a string.
 * Combines the host name from the environment variable and a fixed port value.
 *
 * @return {string} A string containing the host name and port in the format "hostname:port".
 */
function getHostNameAndPort(): string {
	// @ts-ignore Deno - couldn't generate typings file
	return Deno.env.get(HOSTNAME) + ":443";
}
