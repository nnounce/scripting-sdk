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

import { RuntimeUpdateComponentData } from "../dto/DspDesign.ts";
import { IEvent } from "../IEvent.ts";

/**
 * Represents an event notification for a change in the design runtime.
 * It carries the updated data and relevant response tags.
 *
 * @interface DesignRuntimeChangedSubscriptionNotifyEvent
 * @extends IEvent
 *
 * @property {Array<RuntimeUpdateComponentData>} data - An array containing updated runtime component data.
 * @property {Array<string>} responseTags - An array of response tags associated with the event notification.
 */
export interface DesignRuntimeChangedSubscriptionNotifyEvent extends IEvent {
	data: Array<RuntimeUpdateComponentData>;
	responseTags: Array<string>;
}
