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

import { INnounceClientRequestEvent } from "../INnounceClientRequestEvent.ts";
import { IPollSubscriptionEvent } from "../IPollSubscriptionEvent.ts";

/**
 * Represents an event that subscribes for IO pin state changes.
 *
 * The `IoPinStatePollSubscriptionRequestEvent` interface extends the functionality of
 * `INnounceClientRequestEvent` and `IPollSubscriptionEvent`, inheriting the basic structure
 * and behavior required for client request events and polling subscriptions.
 *
 * This interface does not include additional properties beyond those inherited.
 */
export interface IoPinStatePollSubscriptionRequestEvent extends INnounceClientRequestEvent, IPollSubscriptionEvent {}
