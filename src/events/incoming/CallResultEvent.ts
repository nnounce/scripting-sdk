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
 * Represents the event object for a call result.
 *
 * This interface extends the base `IEvent` interface, adding specific properties for call results,
 * including information about the action, its state, reasons for failure, and any undelivered outputs.
 *
 * Properties:
 * @property {string} actionId A unique identifier for the action related to this call result event.
 * @property {CallResultStatus} state The state indicating the overall status of the call result (e.g., success, failure).
 * @property {string} failReason A descriptive string explaining the reason for the failure, if the state indicates a failure.
 * @property {Map<string, string>} undeliveredOutputs A map containing undelivered output details, where the key is the undelivered output ID,
 *   and the value is the respective undelivered reason.
 */
export interface CallResultEvent extends IEvent {
	actionId: string;
	state: CallResultStatus;
	failReason: string;
	undeliveredOutputs: Map<string /*outputId*/, string /*undeliveredReason*/>;
}

/**
 * Enum representing the various statuses for the result of a call or operation.
 *
 * - DONE: Indicates the call was successfully completed.
 * - BUSY: Indicates the call could not proceed because the output zones were occupied.
 * - CANCELED: Indicates the call was canceled before completion.
 * - TIMED_OUT: Indicates the call exceeded the time limit before completing.
 * - INTERRUPTED: Indicates the call was interrupted unexpectedly.
 * - FAILED: Indicates the call was unsuccessful due to an error or issue.
 */
export enum CallResultStatus {
	DONE = "DONE",
	BUSY = "BUSY",
	CANCELED = "CANCELED",
	TIMED_OUT = "TIMED_OUT",
	INTERRUPTED = "INTERRUPTED",
	FAILED = "FAILED",
}
