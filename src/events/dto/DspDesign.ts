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
 * Represents a DSP design, managing multiple modules, associated metadata, and runtime configurations.
 */
export interface DspDesign {
	drawflow: {
		Home: DrawflowModuleData; // always present
		[customModuleName: string]: DrawflowModuleData;
	};
	metadata: DesignMetadata;
	runtime: { [key: string]: ANpdConfig };
}

/**
 * Represents the runtime update data for a specific component. This interface
 * is used to define the structural data required during the runtime of a
 * component update process.
 *
 * Properties:
 * - `index` (number): The unique identifier or positional index for the component.
 * - `cmpType` (string): Specifies the type of the component being updated.
 * - `data` (object): A key-value pair object containing configuration properties
 *   associated with the component, where each key corresponds to a property name
 *   and the value is of type `ANpdConfig`.
 */
export interface RuntimeUpdateComponentData {
	index: number;
	cmpType: string;
	data: { [key: string]: ANpdConfig };
}

/**
 * Represents the runtime configuration and metadata for a DSP (Digital Signal Processing) design.
 *
 * This interface defines the structure for DSP runtime information,
 * which includes metadata describing the design and a runtime configuration map.
 *
 * @interface DspDesignRuntime
 *
 * @property metadata
 * The metadata for the DSP design. Provides descriptive and structural information about the design.
 *
 * @property runtime
 * A key-value mapping where the keys are strings representing configuration identifiers
 * and the values are ANpdConfig objects that define the actual runtime configurations.
 */
export interface DspDesignRuntime {
	metadata: DesignMetadata;
	runtime: { [key: string]: ANpdConfig };
}

/**
 * Represents the structure of Drawflow module data in a DSP design.
 *
 * This interface is used to define the expected format for module data,
 * where each module contains a collection of nodes. Each node is identified
 * by a unique key and is represented by a {@link DrawflowNode} object.
 *
 * Properties:
 * @property data An object containing the nodes within the module, with each node's
 *   unique key mapping to an associated {@link DrawflowNode}.
 */
export interface DrawflowModuleData {
	data: {
		[nodeKey: string]: DrawflowNode;
	};
}

/**
 * Represents the metadata associated with a DSP design.
 *
 * This interface defines the expected format for design metadata,
 * where each property is optional and may contain a string value.
 *
 * Properties:
 * @property {string} name - The name of the design.
 * @property {number} api_version - The version of the API used to create the design.
 * @property {number} last_modified_runtime - The timestamp of the last modification to the runtime configuration.
 * @property {number} last_modified_design - The timestamp of the last modification to the design.
 * @property {string} device_type - The target type of device.
 */
export interface DesignMetadata {
	name?: string;
	api_version?: number;
	last_modified_runtime?: number;
	last_modified_design?: number;
	device_type?: string;
}

/**
 * Represents the configuration of a component node in a DSP design.
 *
 * @property {string} type - The type of the component.
 */
export interface ANpdConfig {
	type: string;
}

/**
 * Represents the configuration of a component node with gain in a DSP design.
 *
 * @property {number} gain - The gain value for the component.
 */
export interface NpdComponentGainConfig extends ANpdConfig {
	gain: number;
}

/**
 * Represents the configuration of a component node with mute state in a DSP design.
 *
 * @property {boolean} mute - The mute state for the component.
 */
export interface NpdComponentMuteConfig extends ANpdConfig {
	mute: boolean;
}

/**
 * Represents the details of a connection in a drawflow system.
 *
 * Properties:
 * - `input`: A string identifier for the input port of the connection.
 * - `node`: A string identifier for the connected node.
 */
export interface DrawflowConnectionDetail {
	input: string;
	node: string;
}

/**
 * Represents a Drawflow connection that consists of an array of connection details.
 *
 * This interface models the structure of a connection within a Drawflow system,
 * where each connection is defined by a detailed specification.
 *
 * @interface
 * @property {DrawflowConnectionDetail[]} connections - An array containing details of individual connections.
 */
export interface DrawflowConnection {
	connections: DrawflowConnectionDetail[];
}

/**
 *
 * Represents a node within the Drawflow framework, containing all necessary properties for its configuration and connections.
 *
 * @interface DrawflowNode
 *
 * @property {string} class - A string that defines the CSS class or identifier for the node.
 * @property {string} type - A string describing the type of node.
 * @property {any} data - An object or any type of data associated with the node.
 * @property {string} html - The HTML content or structure for rendering the node.
 * @property {number} id - A unique identifier for the node.
 * @property {Record<string, DrawflowConnection>} inputs - A mapping of input connection points where the key is the connection identifier and the value is the associated DrawflowConnection object.
 * @property {string} name - The name or label of the node.
 * @property {Record<string, DrawflowConnection>} outputs - A mapping of output connection points where the key is the connection identifier and the value is the associated DrawflowConnection object.
 * @property {number} pos_x - The x-coordinate of the position of the node on the canvas.
 * @property {number} pos_y - The y-coordinate of the position of the node on the canvas.
 * @property {boolean} typenode - A flag indicating whether the node is a specific type or custom node.
 */
export interface DrawflowNode {
	class: string;
	type: string;
	data: any;
	html: string;
	id: number;
	inputs: Record<string, DrawflowConnection>;
	name: string;
	outputs: Record<string, DrawflowConnection>;
	pos_x: number;
	pos_y: number;
	typenode: boolean;
}
