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
 * Represents an event sent when cancelling a call.
 *
 * This interface extends the base IEvent interface and includes
 * an actionId property used to identify the specific action to cancel.
 */
export interface CallCancelEvent extends IEvent {
	actionId: string;
}

/**
 * Creates a CallCancelEvent object with the given action ID.
 *
 * @param {string} actionId - The unique identifier for the action associated with the call cancel event.
 * @return {CallCancelEvent} The created CallCancelEvent object containing the action ID and event type.
 */
export function createCallCancelEvent(actionId: string): CallCancelEvent {
	return {
		actionId: actionId,
		type: "callCancelEvent",
	};
}
