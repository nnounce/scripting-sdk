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
 * Represents the result of a call preparation in the system.
 * This event extends the base `IEvent` interface and provides additional details
 * regarding the outcome of the call preparation process.
 *
 * The `CallPrepareResultEvent` includes an identifier for the associated action
 * and a reason for failure, if applicable.
 *
 * @interface CallPrepareResultEvent
 * @extends IEvent
 *
 * @property {string} actionId - The unique identifier associated with the action being prepared.
 * @property {string} failReason - A description of the reason for the failure, if the preparation was unsuccessful.
 */
export interface CallPrepareResultEvent extends IEvent {
	actionId: string;
	failReason: string;
}
