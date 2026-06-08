import { EventTarget } from "ts-event-target";
import type { ProjectWithCopilotSession } from "../aggregate/project.aggregate.ts";
import type {
	CopilotEventsList,
	CopilotEventType,
} from "../entity/copilot-job.entity.ts";
import type { TypeNameList } from "../schema/copilot.schema.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CrdtSchemaAggregate } from "../aggregate/crdt-schema.aggregate.ts";
import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../../account/domain/interface/websocket-client.interface.ts";

export class CopilotExecutionService {
	private copilotEvent: EventTarget<CopilotEventType> = new EventTarget();

	constructor(private project: ProjectWithCopilotSession) {
		this.copilotEvent.addEventListener("CopilotAiResponseMessage", (event) => {
			project.setAiResponse(event.data.content);
		});
		this.copilotEvent.addEventListener(
			"CopilotEditableTextMessage",
			(event) => {
				project.setEditableText(event.data.content);
			},
		);
		this.copilotEvent.addEventListener("CopilotTaskMessage", (event) => {
			project.pushTask(event.data);
		});
	}

	register<T extends keyof TypeNameList>(
		type: T,
		callback: (event: Extract<CopilotEventType[number], { type: T }>) => void,
		once: boolean = false,
	) {
		this.copilotEvent.addEventListener(
			type,
			(event) => {
				callback(event);
			},
			{ once },
		);
	}

	get publisher(): (event: CopilotEventsList[keyof CopilotEventsList]) => void {
		return this.copilotEvent.dispatchEvent.bind(this.copilotEvent);
	}
}

export class CopilotExecutionService {
	private contextGetter = (copilotInput: CopilotInputAggregate): string => {
		return copilotInput.getEntity("userInput").getData("content");
	};
	constructor(private readonly copilotNetwork: ICopilotNetworkService) {}

  async execute ( copilotInput: CopilotInputAggregate, projectCrdtSchema: CrdtSchemaAggregate, gqlClient: IGQLClient, wsClient: IWebSocketClient )
  {
    const context = this.contextGetter( copilotInput );
    this.copilotNetwork.createCopilotSession(projectCrdtSchema.getData(""))
  }
}
