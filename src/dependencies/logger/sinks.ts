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

// Copyright 2020 Yamboy1. All rights reserved. MIT license.

import { yellow, gray, red, bold, blue } from "./colors.ts";
import { LogEntry, LogLevel, SinkFunction } from "./types.ts";

/** A function that changes the color of a string in the terminal, generally from std/fmt/colors.ts */
export type ColorFunction = (str: string) => string;

/** Options for the console sink */
export interface ConsoleOptions {
	/** Whether colors should be enabled*/
	enableColors: boolean;
	/** Color overrides for the sink */
	colorOptions: Partial<ColorOptions>;
}

/** Color overrides for the console sink */
export interface ColorOptions {
	debug: ColorFunction;
	info: ColorFunction;
	warn: ColorFunction;
	error: ColorFunction;
	critical: ColorFunction;
}

/** A console sink (with colors) */
export function consoleSink({
	enableColors = true,
	colorOptions: { debug = gray, info = blue, warn = yellow, error = red, critical = (str: string) => bold(red(str)) } = {},
}: Partial<ConsoleOptions> = {}): SinkFunction {
	return ({ level, formattedMessage }: LogEntry) => {
		let color;
		if (enableColors) {
			color =
				{
					[LogLevel.DEBUG]: debug,
					[LogLevel.INFO]: info,
					[LogLevel.WARN]: warn,
					[LogLevel.ERROR]: error,
					[LogLevel.CRITICAL]: critical,
				}[level] ?? ((x: string) => x);
		} else {
			color = (x: string) => x;
		}

		console.log(color(formattedMessage));
	};
}

/** A basic sink to write to a file */
export function fileSink(filename: string): SinkFunction {
	const encoder = new TextEncoder();

	return ({ formattedMessage }: LogEntry) => {
		// @ts-ignore Deno - couldn't generate typings file
		Deno.writeFileSync(filename, encoder.encode(formattedMessage + "\n"), { create: true, append: true });
	};
}
