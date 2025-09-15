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

import { BiConsumer } from "./utils/FunctionalInterfaces.ts";
import { InputControl, IOControlStates } from "./ioControl/IOControlStates.ts";

/**
 * Represents a control interface for input pin in digital mode, capable of reading the pin state and monitoring changes in its state.
 * Pins are numbered from 1.
 *
 * Digital mode returns true or false based on voltage on pin compared to rail voltage.
 * - \>=0.6 - pin is high (has rail voltage) - true
 * - 0.0 - pin is low (has 0 voltage) - false
 */
export type DigitalInputPinControl = {
	/**
	 * Returns the state of the input pin based on detected voltage.
	 *
	 * If the voltage at the pin is at least 60% of the reference voltage, this method returns ```true```;
	 * otherwise, it returns ```false```.
	 */
	getValue: () => boolean;
	/**
	 * Registers a callback to listen for changes in the pin's voltage state.
	 *
	 * The change is evaluated as a boolean transition: when the voltage crosses the threshold of 60%
	 * of the reference voltage. This means the voltage either rises from below 60% to above 60%, or
	 * falls from above 60% to below 60%. The callback is invoked with the new boolean value representing
	 * the pin's digital state.
	 *
	 * @param changeCb the callback function that receives the new pin state as a boolean value
	 */
	onChange: { (changeCb: { (value: boolean): void }): void };
};

/**
 * Represents a control interface for input pin in analog mode.
 * Pins are numbered from 1.
 *
 * Analog mode returns ratio between voltage on pin and rail voltage:
 * - 1.0 - pin is high (has rail voltage)
 * - 0.5 - pin has half of the rail voltage
 * - 0.0 - pin is low (has 0 voltage)
 */
export type AnalogInputPinControl = {
	/**
	 * Returns the current voltage on the pin.
	 */
	getValue: () => number;
	/**
	 * Registers a callback to be invoked when the voltage on the pin changes.
	 *
	 * The callback is triggered whenever there is a change in the pin's voltage. It provides
	 * the new voltage and the previous voltage as parameters.
	 *
	 * @param changeCb the callback function that receives two parameters:
	 *                 the new voltage (```value```) and the previous voltage (```oldValue```).
	 */

	onChange: { (changeCb: { (value: number, oldValue: number): void }): void };
};

/**
 * Fixed pins - hardcoded in hardware and cannot be changed
 *
 * inputs:
 * - digital | analog
 */
export class NnControlInputsDefinition {
	private ioControlStates: IOControlStates;

	/**
	 * Constructor for initializing an instance of the class with the given IO control states.
	 * @param {IOControlStates} ioControlStates - The initial IO control states to be set for the instance.
	 */
	private constructor(ioControlStates: IOControlStates) {
		this.ioControlStates = ioControlStates;
	}

	/**
	 * Creates new instance
	 */
	public static getInstance(ioControlStates: IOControlStates): NnControlInputsDefinition {
		return new NnControlInputsDefinition(ioControlStates);
	}

	/**
	 * Get pin control in digital mode. Method param indicates which pin is controlled.
	 * Pins are numbered from 1.
	 *
	 * Digital mode returns true or false based on voltage on pin compared to rail voltage.
	 * - \>=0.6 - pin is high (has rail voltage) - true
	 * - 0.0 - pin is low (has 0 voltage) - false
	 * @param pin numbered from 1
	 */
	public digital(pin: number): DigitalInputPinControl {
		return {
			getValue: () => this.getInputValue(pin) >= 0.6,
			onChange: onChangeAction => {
				this.reactOnInputChange(pin, (value, oldValue) => {
					const boolValue = value >= 0.6;
					const oldBoolValue = oldValue >= 0.6;
					if (boolValue !== oldBoolValue) {
						onChangeAction(boolValue);
					}
				});
			},
		};
	}

	/**
	 * Get pin control in analog mode. Method param indicates which pin is controlled.
	 * Pins are numbered from 1.
	 *
	 * Analog mode returns ratio between voltage on pin and rail voltage:
	 * - 1.0 - pin is high (has rail voltage)
	 * - 0.5 - pin has half of the rail voltage
	 * - 0.0 - pin is low (has 0 voltage)
	 * @param pin numbered from 1
	 */
	public analog(pin: number): AnalogInputPinControl {
		return {
			getValue: () => this.getInputValue(pin),
			onChange: onChangeAction => this.reactOnInputChange(pin, onChangeAction),
		};
	}

	private reactOnInputChange(pin: number, changeCallback: BiConsumer<number, number>): InputControl | null {
		return this.ioControlStates.onInputChange(pin, changeCallback);
	}

	private getInputValue(pin: number): number {
		return this.ioControlStates.getInputValue(pin);
	}
}
