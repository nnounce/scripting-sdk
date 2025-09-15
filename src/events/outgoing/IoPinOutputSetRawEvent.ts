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

/**
 * Represents an event for setting the raw output value of an I/O pin.
 *
 * This event is used to configure or alter the state of a specific I/O pin,
 * allowing for direct manipulation of the pin's output.
 *
 * The `IoPinOutputSetRawEvent` contains the following properties:
 * - `pinType`: Specifies the type of the I/O pin.
 * - `pin`: Indicates the pin number being targeted by this event, numbered from 1.
 * - `value`: Represents the raw value to set for the specified pin (e.g., HIGH or LOW state).
 *
 * This interface extends the `IEvent` base interface, inheriting the general structure for event objects.
 */
export interface IoPinOutputSetRawEvent extends IEvent {
	pinType: IoPinType;
	pin: number;
	value: number;
}
