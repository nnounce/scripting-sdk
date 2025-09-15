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
 * Represents a notification for an SNMP Trap subscription event.
 * This interface extends the base event structure provided by `IEvent`.
 */
export interface SnmpTrapSubscriptionNotify extends IEvent {
	/**
	 * Represents the name or identifier of a trap.
	 */
	trap: string;
	/**
	 * Array of recipient tags.
	 * Subscribers can specify tags when subscribing to later know which notifications are intended for them.
	 */
	responseTags: Array<string>;
}
