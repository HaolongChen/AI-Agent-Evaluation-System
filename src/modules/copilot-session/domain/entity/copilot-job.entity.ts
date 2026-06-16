import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import {
	type CopilotInputMessage,
	type CopilotMessageContentMap,
	type TypeNameList,
} from "../schema/copilot.schema.ts";
import { Event } from "ts-event-target";
export class CopilotEvent<T extends keyof TypeNameList> extends Event<T> {
	constructor(
		type: T,
		readonly data: CopilotMessageContentMap[ T ],
		readonly projectNetwork: NetworkClient,
	) {
		super(type);
	}
}

export type CopilotEventsList = { [K in keyof TypeNameList]: CopilotEvent<K> };

export type CopilotEventType = [CopilotEventsList[keyof CopilotEventsList]];

export class CopilotInputEvent<
	T extends keyof CopilotInputMessage = keyof CopilotInputMessage,
> extends Event<T> {
	constructor(
		type: T,
		readonly data: CopilotInputMessage[T],
	) {
		super(type);
	}
}
export type CopilotInputEventsList = {
	[K in keyof CopilotInputMessage]: CopilotInputEvent<K>;
};
