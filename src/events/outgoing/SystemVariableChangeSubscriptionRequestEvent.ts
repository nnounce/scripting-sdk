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
 * Represents an event for subscribing to system variable change notifications.
 * This event requires the specification of a response tag to indicate the subscription's context.
 *
 * It extends the `INnounceClientRequestEvent` interface, which provides the base structure for client request events.
 *
 * The primary purpose of this event is to allow clients to subscribe to system variable changes.
 */
export interface SystemVariableChangeSubscriptionRequestEvent extends ISubscriptionEvent {}
