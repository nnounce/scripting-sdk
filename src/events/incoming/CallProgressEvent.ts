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
 * Interface representing a call progress event.
 * This event contains information about the current progress of a call.
 *
 * @interface CallProgressEvent
 * @extends IEvent
 *
 * @property {string} actionId - The unique identifier associated with the call being processed.
 * @property {CallProgressStatus} state - A state of the call.
 * @property {Map<string, string>} undeliveredOutputs - A map of output IDs and reasons why the call was not played in them.
 */
export interface CallProgressEvent extends IEvent {
	actionId: string;
	state: CallProgressStatus;
	undeliveredOutputs: Map<string /*outputId*/, string /*undeliveredReason*/>;
}

/**
 * Enum representing the different statuses for call progress.
 *
 * This enum is used to define constants that represent the progress status of a call.
 *
 * Enum members:
 * - PARTIAL: Indicates that the call is playing, but was not delivered to all outputs.
 * - PLAYING: Indicates that the call is playing to all outputs.
 *
 */
export enum CallProgressStatus {
	PARTIAL = "PARTIAL",
	PLAYING = "PLAYING",
}
