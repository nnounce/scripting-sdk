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

import * as LoggerFactory from "../dependencies/logger/mod.ts";

/**
 * Log with desired level. Pass format string and arguments separately.
 * @example
 * // log at info level:
 * device.logger.info("Today's weather is {}, number of days since last accident: {}", "sunny", 42);
 */
export interface LoggerInterface {
	/** Log at DEBUG level. */
	debug: (format: string, ...args: unknown[]) => void;
	/** Log at INFO level. */
	info: (format: string, ...args: unknown[]) => void;
	/** Log at WARN level. */
	warn: (format: string, ...args: unknown[]) => void;
	/** Log at ERROR level. */
	error: (format: string, ...args: unknown[]) => void;
	/** Log at CRITICAL level. */
	critical: (format: string, ...args: unknown[]) => void;
}

/**
 * Config for global logger used in nnounce script API for logging.
 * By default, logging with global logger in nnounce script API is disabled.
 */
export class NnLoggerConfig {
	private constructor() {}

	/**
	 * Return singleton instance
	 */
	public static getInstance(): NnLoggerConfig {
		return new NnLoggerConfig();
	}

	private enabledInternal = false;

	/**
	 * Return true, if script API logs are enabled
	 */
	public isEnabledInternal(): boolean {
		return this.enabledInternal;
	}

	/**
	 * Enable/disable script API logs
	 * @param enable
	 */
	public setEnabledInternal(enable: boolean) {
		this.enabledInternal = enable;
	}
}

/**
 * Global logger used in nnounce script API.
 * Default values:
 * 		<ul>
 * 		 <li>minimumLevel: DEBUG</li>
 * 		 <li>outputFormat: textFormat</li>
 * 		</ul>
 */
export const logger: LoggerInterface = LoggerFactory.createLogger().addSink(LoggerFactory.consoleSink());
