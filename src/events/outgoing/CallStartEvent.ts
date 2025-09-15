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

import { IEvent } from "../IEvent.ts";

/**
 * Represents an event sent to start a call. A unique identifier for the call's action id to
 * start the call is provided.
 *
 * @interface CallStartEvent
 * @extends IEvent
 *
 * @property {string} actionId - A unique identifier representing the call.
 */
export interface CallStartEvent extends IEvent {
	actionId: string;
}

/**
 * Creates a CallStartEvent object with the specified action ID.
 *
 * @param {string} actionId - The unique identifier associated with the call.
 * @return {CallStartEvent} An object representing the call start event, including the action ID and event type.
 */
export function createCallStartEvent(actionId: string): CallStartEvent {
	return {
		actionId: actionId,
		type: "callStartEvent",
	};
}
