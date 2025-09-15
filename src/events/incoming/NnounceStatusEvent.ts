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

/**
 * Represents the status of a Nnounce system, including temperature, firmware version, network status, hardware information, and hostname.
 *
 * This event interface extends the `INnounceClientResultEvent` interface, providing additional details about the system's current state.
 *
 * @interface NnounceStatusEvent
 *
 * @extends INnounceClientResultEvent
 *
 * @property {Array<number>} temperature - A list of temperature readings from the system.
 * @property {string} firmwareVersion - The version of the firmware currently running on the system.
 * @property {Array<NetworkStatusDto>} network - An array of objects representing the status of network interfaces.
 * @property {HwInfoDto} hwInfo - Detailed information about the hardware associated with the system.
 * @property {string} hostname - The hostname assigned to the device within the network.
 */
export interface NnounceStatusEvent extends INnounceClientResultEvent {
	temperature: Array<number>;
	firmwareVersion: string;
	network: Array<NetworkStatusDto>;
	hwInfo: HwInfoDto;
	hostname: string;
}

/**
 * Represents the network status and configuration for a specific network interface.
 *
 * This interface includes details such as the interface's name, MAC address, and associated
 * IPv4 and IPv6 addresses.
 */
export interface NetworkStatusDto {
	name: string;
	mac: string;
	inet4: Array<string>;
	inet6: Array<string>;
}

/**
 * Represents hardware information data transfer object.
 * Used to encapsulate details about a specific hardware unit.
 *
 * Properties:
 * - modelType: Specifies the type of the hardware model.
 * - model: The model name or identifier of the hardware.
 * - version: The version or revision of the hardware.
 * - serialNumber: A unique identifier tied to the hardware instance.
 */
export interface HwInfoDto {
	modelType: string;
	model: string;
	version: string;
	serialNumber: string;
}
