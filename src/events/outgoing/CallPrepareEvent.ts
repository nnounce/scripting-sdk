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

import { IEvent } from "../IEvent.ts";
import { PlayLocalFileParam, PlayRemoteFileParam } from "../../nnPagingRouter.ts";

/**
 * The CallPrepareEvent interface defines the structure for an event that
 * is sent to prepare a call. This event provides details
 * about the call, such as the call's action id, priority,
 * and relevant audio settings.
 *
 * It extends the base IEvent interface to inherit common event properties and behavior.
 *
 * Properties:
 * - actionId: A unique identifier associated with the call being prepared.
 * - priority: A numerical value representing the call's priority (the lower the number, the higher the priority).
 * - partial: A boolean flag indicating whether the call is partial or complete.
 * - audioSource: Details about the audio source of the call, represented by an AudioSourceDto object.
 * - outputs: An array of strings specifying the outputs or target destinations for the prepared call.
 */
export interface CallPrepareEvent extends IEvent {
	actionId: string;
	priority: number;
	partial: boolean;
	audioSource: AudioSourceDto;
	outputs: Array<string>;
}

/**
 * Represents a data transfer object for an audio source.
 * This interface defines the structure for various types of audio sources
 * and their associated metadata needed for processing or playback.
 *
 * The audio source can be of different types, determined by the `sourceType` property,
 * with additional properties becoming relevant based on the specific type of source.
 *
 * Properties:
 * - sourceType: Specifies the type of the audio source. This determines which additional
 *   properties are required or applicable.
 *
 * Optional Properties:
 * - path: The file system path to the local audio file. Relevant when the source type
 *   is `LOCAL_FILE`.
 * - input: The identifier or input stream for live audio. Relevant when the source type
 *   is `LIVE`.
 * - url: The URL of the audio file. Relevant when the source type is `FILE`.
 * - filename: A unique identifier for the audio file. Used for caching purposes.
 * - checksum: A checksum value for verifying the integrity of the audio file.
 * - checksumFunction: Specifies the algorithm used for generating the checksum.
 * - headers: A set of HTTP headers to include when accessing the audio file from
 *   a remote source.
 * - basicAuthUsername: The username for basic authentication when accessing a secure
 *   audio source.
 * - basicAuthPassword: The password for basic authentication when accessing a secure
 *   audio source.
 */
interface AudioSourceDto {
	sourceType: AudioSourceType;

	// LOCAL_FILE
	path?: string;
	// LIVE
	input?: string;

	// FILE
	url?: string;

	/**
	 * Should be unique for different content, same for same audio files - it's used for caching
	 */
	filename?: string;
	checksum?: string;
	checksumFunction?: string;
	headers?: { [p: string]: string };
	basicAuthUsername?: string;
	basicAuthPassword?: string;
}

/**
 * Creates a `CallPrepareEvent` object for playing a local file.
 *
 * @param {PlayLocalFileParam} spec - The parameters for creating the event, including actionId, priority, file path, etc.
 * @return {CallPrepareEvent} The constructed `CallPrepareEvent` object.
 */
export function createCallPrepareEventLocalFile(spec: PlayLocalFileParam): CallPrepareEvent {
	return {
		actionId: "nnScriptApi__" + (spec.actionId ?? Date.now().toString()),
		priority: spec.priority,
		partial: spec.partial ?? true,
		audioSource: {
			sourceType: AudioSourceType.LOCAL_FILE,
			path: spec.audioFilePath,
		},
		outputs: spec.outputs,
		type: "callPrepareEvent",
	};
}

/**
 * Creates a `CallPrepareEvent` object for preparing a remote file playback event.
 *
 * @param {PlayRemoteFileParam} spec - The specification for the remote file playback event. Includes information such as audio source details, priority, and outputs.
 * @return {CallPrepareEvent} Returns an object representing the created `CallPrepareEvent` including metadata, priority, and audio source details.
 */
export function createCallPrepareEventRemoteFile(spec: PlayRemoteFileParam): CallPrepareEvent {
	const actionId = spec.actionId ?? Date.now().toString();

	const headers: { [p: string]: string } = {};
	spec.audioSource.headers?.forEach((value, key) => {
		headers[key] = value;
	});

	return {
		actionId: "nnScriptApi__" + (actionId ?? Date.now().toString()),
		priority: spec.priority,
		partial: spec.partial ?? true,
		audioSource: {
			sourceType: AudioSourceType.FILE,
			filename: spec.filename,
			url: spec.audioSource.url,
			checksum: spec.audioSource.checksum,
			checksumFunction: spec.audioSource.checksumMethod,
			headers,
			basicAuthUsername: spec.audioSource.basicAuthUsername,
			basicAuthPassword: spec.audioSource.basicAuthPassword,
		},
		outputs: spec.outputs,
		type: "callPrepareEvent",
	};
}

/**
 * Enumeration representing different types of audio sources.
 *
 * This enum can be used to specify the type of audio source being handled.
 *
 * Enum members:
 * - `LIVE`: Represents a live audio source, such as a microphone or live stream.
 * - `FILE`: Represents an audio source retrieved from a stored file that is not local to the system.
 * - `LOCAL_FILE`: Represents an audio source retrieved from a file stored locally on the system.
 */
enum AudioSourceType {
	LIVE = "LIVE",
	FILE = "FILE",
	LOCAL_FILE = "LOCAL_FILE",
}
