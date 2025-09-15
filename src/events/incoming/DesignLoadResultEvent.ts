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

import { INnounceClientResultEvent } from "../INnounceClientResultEvent.ts";
import { DspDesign } from "../dto/DspDesign.ts";

/**
 * Represents the response event for a design load request.
 *
 * Extends the INnounceClientResultEvent interface to include the loaded design data.
 * Provides access to the resulting design object upon a successful load operation.
 *
 * @property {DspDesign} data Contains the DSP design details.
 */
export interface DesignLoadResultEvent extends INnounceClientResultEvent {
	data: DspDesign;
}
