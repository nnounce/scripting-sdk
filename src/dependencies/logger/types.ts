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

/** A sink is like an output, sometimes known as a handler */
export type SinkFunction = (logEntry: LogEntry) => void;

/** Logging levels */
export enum LogLevel {
	"DEBUG" = 10,
	"INFO" = 20,
	"WARN" = 30,
	"ERROR" = 40,
	"CRITICAL" = 50,
}

/** A parsed log entry */
export interface LogEntry {
	/** The original format string */
	format: string;
	/** THe LogLevel of this entry */
	level: LogLevel;
	/** The parsed log */
	message: string;
	/** The parsed log formatted according to outputFormat */
	formattedMessage: string;
	/** An object of raw variables from the string */
	variables: any;
}
