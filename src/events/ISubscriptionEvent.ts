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

import { IEvent } from "./IEvent.ts";

/**
 * Represents a subscription event in the system.
 */
export interface ISubscriptionEvent extends IEvent {
	/**
	 * If the value is 0, the subscription will remain active until the websocket is disconnected.
	 * Otherwise, the subscription will be removed if another subscription request is not sent before this value timeout.
	 */
	keepAliveMs: number;
	/**
	 * Subscription tag to indicate the intended recipient.
	 */
	responseTag: string;
}
