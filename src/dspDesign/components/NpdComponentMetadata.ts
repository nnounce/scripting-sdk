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

import { ANpdConfig, DesignMetadata } from "../../events/dto/DspDesign.ts";

/**
 * Class representing the runtime metadata of a design component.
 * Used for managing runtime and design-time configurations and metadata information.
 */
export class NpdComponentMetadata {
	/**
	 * Runtime component
	 *
	 */
	public readonly npdComponentConfig: ANpdConfig;

	/**
	 * Design runtime part for update
	 * @protected
	 */
	public readonly designRuntime: { [p: string]: ANpdConfig };

	/**
	 * Design metadata part for update
	 * @protected
	 */
	public readonly designMetadata: DesignMetadata;

	/**
	 * Creates an instance of the class with the specified configuration, runtime data, and metadata.
	 *
	 * @param {ANpdConfig} npdComponentConfig - The configuration object for the NPD component.
	 * @param {{ [p: string]: ANpdConfig }} designRuntime - An object containing runtime configuration data for the design.
	 * @param {DesignMetadata} designMetadata - The metadata associated with the design.
	 */
	constructor(npdComponentConfig: ANpdConfig, designRuntime: { [p: string]: ANpdConfig }, designMetadata: DesignMetadata) {
		this.npdComponentConfig = npdComponentConfig;
		this.designRuntime = designRuntime;
		this.designMetadata = designMetadata;
	}
}
