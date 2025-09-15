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

/**
 * Represents the different types of I/O pins that can be configured in a hardware interface.
 *
 * Enum IoPinType provides a set of predefined constants to define the type of the pin.
 *
 * Types include:
 * - CONTROL: Represents a pin configured for control operations with set direction (input or output).
 * - GPIO: Represents a pin configured as a General Purpose Input/Output (GPIO) which can be dynamically switched between input and output.
 */
export enum IoPinType {
	CONTROL = "control",
	GPIO = "gpio",
}
