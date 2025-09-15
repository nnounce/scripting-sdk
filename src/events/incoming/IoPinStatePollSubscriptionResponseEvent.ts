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

import { INnounceClientResultEvent } from "../INnounceClientResultEvent.ts";
import { IoControl } from "./IoPinStateSubscriptionNotify.ts";

/**
 * Represents an event response for subscription to state of I/O pins
 * in a subscription-based system.
 *
 * This event extends the base interface `INnounceClientResultEvent`
 * and provides additional information about the states of multiple
 * I/O pins as part of the polling response.
 *
 * @interface IoPinStatePollSubscriptionResponseEvent
 * @extends INnounceClientResultEvent
 *
 * @property {Array<IoControl>} states - An array containing the state information
 * of I/O pins in the form of `IoControl` instances.
 */
export interface IoPinStatePollSubscriptionResponseEvent extends INnounceClientResultEvent {
	states: Array<IoControl>;
}
