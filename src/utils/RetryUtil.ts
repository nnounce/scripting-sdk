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

import { Supplier } from "./FunctionalInterfaces.ts";

/**
 * Utility class providing methods for executing processes with retry logic.
 */
export class RetryUtil {
	/**
	 * Asynchronously runs a process with retry logic which return T.
	 * @param processInfo - Error message
	 * @param process - A function that returns a Promise of generic type T representing the process to be executed.
	 * @param retryCount - The maximum number of retry attempts. Default is -1 -> infinite
	 * @param  retryDelayMs - The delay in milliseconds between retry attempts. Default is 1000
	 * @returns {Promise<T>} A Promise that resolves with the generic <T> result of the process.
	 * @throws {Error} If the process fails after all retry attempts.
	 */
	public static async runAsync<T>(
		processInfo: string,
		process: Supplier<Promise<T>>,
		retryCount: number = -1,
		retryDelayMs = 1000
	): Promise<T> {
		while (true) {
			try {
				return await process();
			} catch (e) {
				if (retryCount > 0) {
					retryCount--;
				}
				if (retryCount == 0) {
					throw e;
				}
				console.error(
					`Error during run process: '${processInfo}'. Next attempt in ${retryDelayMs}ms. ${retryCount > 0 ? "Remain " + retryCount + " attempt(s) " : ""}. Error: `,
					e
				);
				await new Promise<void>(resolve => setTimeout(() => resolve(), retryDelayMs));
			}
		}
	}
}
