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
 * Interface to control component gain value and output mute state.
 */
export interface NnDspComponentControl {
	/**
	 * Set gain of component.
	 * @param value - gain value in dB.
	 */
	setGain: { (value: number): Promise<void> };
	/**
	 * Get gain of component.
	 * @return gain value in dB.
	 */
	getGain: { (): number | undefined };
	/**
	 * Un/mute component output.
	 * @param mute - true to mute component output, false to unmute
	 */
	setMute: { (mute: boolean): Promise<void> };
	/**
	 * Get mute state of component output.
	 * @return true if component output is muted, false otherwise.
	 */
	isMute: { (): boolean | undefined };
}
