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
import { NetworkStatusDto } from "./NnounceStatusEvent.ts";

/**
 * Represents an event triggered when there is a change in network configuration.
 * This event provides updated network status information and associated response tags.
 *
 * @interface NetworkChangeSubscriptionNotifyEvent
 * @extends IEvent
 *
 * @property {Array<NetworkStatusDto>} network - An array containing information about the current network status or changes.
 * @property {Array<string>} responseTags - An array of response tags that are associated with the event notification.
 */
export interface NetworkChangeSubscriptionNotifyEvent extends IEvent {
	network: Array<NetworkStatusDto>;
	responseTags: Array<string>;
}
