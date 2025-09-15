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

import { IEvent } from "./IEvent.ts";

/**
 * Interface for outgoing request events, which expects response with result.
 */
export interface INnounceClientRequestEvent extends IEvent {
	/**
	 * Unique request identifier, which is sent back in the response event to pair request and response.
	 */
	requestId: string;
}

/**
 * Generates a unique request identifier string.
 *
 * Combines a fixed prefix, the current timestamp, and a randomly generated string segment
 * to produce a unique ID suitable for tracking requests or transactions.
 *
 * @return {string} A unique request ID string.
 */
export function createRequestId(): string {
	return `nnScriptApi__${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
