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
 * Nnounce useful utils
 */
export class NnUtilDefinition {
	private static INSTANCE: NnUtilDefinition;

	private constructor() {
		// no code
	}

	/**
	 * Return singleton instance
	 */
	public static getInstance(): NnUtilDefinition {
		if (!this.INSTANCE) {
			this.INSTANCE = new NnUtilDefinition();
		}
		return this.INSTANCE;
	}

	/**
	 * Try to convert string value to number.
	 * If value is not a number, then the returned result is 'undefined'
	 * @param stringValue
	 */
	public toNumber(stringValue: string): number | undefined {
		if (!stringValue) {
			return undefined;
		}
		const numberValue = Number(stringValue);
		if (isNaN(numberValue)) {
			console.warn(`Value is not a number`);
			return undefined;
		}
		return numberValue;
	}

	/**
	 * Try to convert string value to boolean.
	 * If value is not 'true' or 'false', then the returned result is 'undefined'
	 * @param stringValue
	 */
	public toBoolean(stringValue: string): boolean | undefined {
		if (!stringValue) {
			return undefined;
		}

		if (stringValue.toLowerCase() === "false") {
			return false;
		}
		if (stringValue?.toLowerCase() === "true") {
			return true;
		}
		console.warn(`Value is not a boolean`);
		return undefined;
	}

	/**
	 * The sleep method pauses execution for a specified duration.
	 * @param durationMs
	 */
	public sleep(durationMs: number): Promise<undefined> {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(void 0);
			}, durationMs);
		});
	}
}
