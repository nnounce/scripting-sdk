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

import { ConnectionOptions, NnounceDevice, NnounceScriptingApi } from "./nnounceScriptingApi.ts";

/**
 * Tries to connect to the nnounce device. If successful, an instance of {@link NnounceScriptingApi} is returned.
 *
 * @param hostname Hostname or IP address of the device.
 * @param apiKey API key to be used for authentication (can be null).
 * @param connectionOptions Connection options object
 */
export function connectDevice(hostname: string, apiKey: string | null, connectionOptions?: ConnectionOptions): NnounceScriptingApi {
	return new NnounceDevice(hostname, apiKey, connectionOptions);
}
