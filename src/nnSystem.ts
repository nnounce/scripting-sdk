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

import { SystemVariablesControlDefinition } from "./nnSystem/SystemVariablesControlDefinition.ts";
import { SystemDefinition } from "./nnSystem/SystemDefinition.ts";

/**
 * Represents a utility for retrieving network-related information such as
 * available interfaces and corresponding IP addresses, MAC addresses,
 * and system hostname.
 */
export type NetworkStatus = {
	/**
	 * Returns an array of available network interface IDs.
	 *
	 * @return a ```String[]``` of network interface IDs.
	 */

	getInterfaces: () => string[];
	/**
	 * First IPv4 routing address for given interface
	 * @param interfaceName
	 */
	getIp4Address: (interfaceName: string) => string | null;
	/**
	 * First IPv6 routing address for given interface
	 * @param interfaceName
	 */
	getIp6Address: (interfaceName: string) => string | null;
	/**
	 * MAC address for given interface
	 * @param interfaceName
	 */
	getMacAddress: (interfaceName: string) => string | null;
	/**
	 * Configured hostname of device
	 * @param interfaceName
	 */
	getHostname: () => string | null;
};

/**
 * Represents an object with all info about hardware.
 */
export type HwInfo = {
	/**
	 * Device installed firmware version
	 * E.g. 1.4.0-1111
	 */
	getFirmwareVersion: () => string | null;
	/**
	 * Device model
	 * E.g. ionode4
	 */
	getModel: () => string | null;
	/**
	 * Device model
	 * E.g. IO4
	 */
	getModelType: () => string | null;
	/**
	 * Device system version
	 * E.g. 1.0
	 */
	getVersion: () => string | null;
	/**
	 * Device serial number
	 * E.g. IO40001
	 */
	getSerialNumber: () => string | null;
};

/**
 * Represents an interface for accessing system variables.
 */
export type SystemVariables = {
	/**
	 * Retrieves the value of a system variable by its name.
	 *
	 * @param variableName The name of the variable to retrieve
	 * @return The value of the variable as a string, or undefined if the variable doesn't exist
	 */
	get: (variableName: string) => string | undefined;
};

/**
 * Provides access to Nnounce device system information
 */
export class NnSystemDefinition {
	/**
	 * Control interface for system variables
	 */
	private systemVariablesControl: SystemVariablesControlDefinition;

	/**
	 * Definition for device network config
	 */
	private systemNetwork: SystemDefinition;

	/**
	 * Private constructor to enforce singleton pattern
	 *
	 * @param systemVariablesControl The system variables control definition
	 * @param systemNetwork The system network definition
	 */
	private constructor(systemVariablesControl: SystemVariablesControlDefinition, systemNetwork: SystemDefinition) {
		this.systemVariablesControl = systemVariablesControl;
		this.systemNetwork = systemNetwork;
	}

	/**
	 * Create new instance
	 */
	public static getInstance(
		systemVariablesControl: SystemVariablesControlDefinition,
		systemNetwork: SystemDefinition
	): NnSystemDefinition {
		return new NnSystemDefinition(systemVariablesControl, systemNetwork);
	}

	/**
	 * Returns network status of the device:
	 *  - interfaces
	 *  - IP4 address (first routing address)
	 *  - IP6 address (first routing address)
	 *  - mac address
	 *  - hostname
	 *  @return {@link NetworkStatus} object
	 */
	public network: NetworkStatus = {
		getInterfaces: () => this.systemNetwork.getInterfaces(),
		getIp4Address: (interfaceName: string) => this.systemNetwork.getIp4Address(interfaceName),
		getIp6Address: (interfaceName: string) => this.systemNetwork.getIp6Address(interfaceName),
		getMacAddress: (interfaceName: string) => this.systemNetwork.getMacAddress(interfaceName),
		getHostname: () => this.systemNetwork.getHostname(),
	};

	/**
	 * Returns hardware info of the device:
	 * - firmware version
	 * - model
	 * - model type
	 * - serial number
	 * - version
	 * @return {@link HwInfo} object
	 */
	public hw: HwInfo = {
		getFirmwareVersion: () => this.systemNetwork.getFirmwareVersion(),
		getModel: () => this.systemNetwork.getModel(),
		getModelType: () => this.systemNetwork.getModelType(),
		getVersion: () => this.systemNetwork.getVersion(),
		getSerialNumber: () => this.systemNetwork.getSerialNumber(),
	};

	/**
	 * Returns configured system variables:
	 * - get - if present, return variable as string
	 * @return {@link SystemVariables} object
	 */
	public variables: SystemVariables = {
		get: (variableName: string) => this.systemVariablesControl.get(variableName),
	};
}
