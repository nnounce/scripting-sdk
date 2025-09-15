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
 * Enumeration representing the available modes for an I/O pin.
 *
 * This enum is used to define whether an I/O pin is set up for
 * receiving input signals or sending output signals.
 *
 * Members:
 * - INPUT: Indicates that the pin is configured for receiving input.
 * - OUTPUT: Indicates that the pin is configured for sending output.
 */
export enum IoPinMode {
	INPUT = "input",
	OUTPUT = "output",
}
