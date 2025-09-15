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

import { ISubscriptionEvent } from "../ISubscriptionEvent.ts";

/**
 * Represents an event for a subscription to runtime design changes.
 * This interface extends both INnounceClientRequestEvent and ISubscriptionEvent, encapsulating
 * the properties and behaviors of these base types related to a design runtime change.
 *
 * @interface DesignRuntimeChangedSubscriptionRequestEvent
 * @extends ISubscriptionEvent
 *
 * @property {Array<string>} componentNames - A list of component names for which we want to be notified about runtime changes.
 */
export interface DesignRuntimeChangedSubscriptionRequestEvent extends ISubscriptionEvent {
	componentNames: Array<string>; // set
}
