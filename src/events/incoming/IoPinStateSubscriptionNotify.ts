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
import { IoPinType } from "../../ioControl/IoPinType.ts";
import { IoPinMode } from "../../ioControl/IoPinMode.ts";

/**
 * Interface representing a notification for the state subscription of I/O pins.
 * This notifies the current states of I/O controls and any associated response tags.
 *
 * It extends the `IEvent` interface, indicating its association with an event-driven architecture.
 *
 * Properties:
 * - `states`: An array containing the current states of I/O controls represented by `IoControl` objects.
 * - `responseTags`: An array of strings used as tags for identifying or correlating responses.
 *
 * This interface is useful in systems where monitoring and reacting to state changes
 * of I/O pins are crucial. Implementations can use this to receive and handle subscription events.
 */
export interface IoPinStateSubscriptionNotify extends IEvent {
	states: Array<IoControl>;
	responseTags: Array<string>;
}

/**
 * Represents the configuration and control of an I/O pin.
 *
 * This interface defines a structure for managing I/O pins, including their type, mode, pin number, and value.
 *
 * Properties:
 * - pinType: Specifies the type of I/O pin.
 * - pinMode: Defines the mode of the pin, such as input or output.
 * - pin: The number of the pin.
 * - value: The current state or value of the pin (e.g., HIGH/LOW or analog value).
 */
export interface IoControl {
	pinType: IoPinType;
	pinMode: IoPinMode;
	pin: number;
	value: number;
}
