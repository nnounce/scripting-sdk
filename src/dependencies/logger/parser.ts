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

import { LogLevel, LogEntry } from "./types.ts";

export function parseLogEntry(level: LogLevel, format: string, outputFormat: string, ...args: unknown[]): LogEntry {
	const variables: any = {};

	const message = format.replace(/\{([^{]*?)\}/g, (_, p1: string) => {
		const arg = args.shift();
		variables[p1] = arg;
		return `${arg}` || "";
	});

	const formattedMessage = outputFormat.replace(/\{([^{]*?)\}/g, (_, p1: string) => {
		if (p1 === "timestamp") return new Date().toISOString();
		if (p1 === "level") return LogLevel[level];
		if (p1 === "message") return message;
		if (p1 === "params") return JSON.stringify(variables);
		return `{${p1}}`;
	});

	return {
		level,
		format,
		message,
		formattedMessage,
		variables,
	};
}
