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
 * Represents the notification event triggered when there is an update regarding the priority input active status
 * for a specific component in the Ducker system.
 *
 * This interface extends IEvent and provides additional information about the affected component,
 * its priority input status, and any related response tags.
 *
 * Members:
 * @property {number} componentId - A unique identifier for the component associated with the notification.
 * @property {boolean} priorityActive - Indicates whether the priority input for the specified component is active (true) or inactive (false).
 * @property {Array<string>} responseTags - An array of response tags associated with the notification, providing additional context or metadata.
 */
export interface DuckerPriorityActiveChangeNotify extends IEvent {
	componentId: number;
	priorityActive: boolean;
	responseTags: Array<string>;
}
