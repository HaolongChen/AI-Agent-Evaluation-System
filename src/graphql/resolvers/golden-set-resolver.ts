import { Client } from "pg";
import { repository } from "../../DI/repository.ts";
import { TypeSystemStore } from "../../external/zed/TypeSystemStore.ts";
import { CreateGoldenSetUseCase } from "../../modules/copilot-input/application/create-golden-set.ts";
import { CreateUserInputUseCase } from "../../modules/copilot-input/application/create-user-input.ts";
import { FormCopilotInputUseCase } from "../../modules/copilot-input/application/form-copilot-input.ts";
import {
  GetGoldenSetByIdUseCase,
  GetGoldenSetsByFilterUseCase,
} from "../../modules/copilot-input/application/get-golden-set.ts";
import { projectService } from "../../modules/copilot-input/application/project-service.ts";
import {
  CopilotType,
  type GoldenSet,
  type MutationCreateUserInputArgs as MutationCreateUserInputArguments,
  type MutationInitializeGoldenSetArgs as MutationInitializeGoldenSetArguments,
  type MutationLinkGoldenSetToUserInputArgs as MutationLinkGoldenSetToUserInputArguments,
  type QueryGetGoldenSetByIdArgs as QueryGetGoldenSetByIdArguments,
  type QueryGetGoldenSetsArgs as QueryGetGoldenSetsArguments,
  type UserInput,
} from "../generated/resolvers-types.ts";
import { GraphQLError } from "graphql";
import { prisma } from "../../config/prisma.ts";

const copilotTypeMapper = {
  dataModelBuilder: CopilotType.DataModelBuilder,
  uiBuilder: CopilotType.UiBuilder,
  actionFlowBuilder: CopilotType.ActionFlowBuilder,
  logAnalyzer: CopilotType.LogAnalyzer,
  agentBuilder: CopilotType.AgentBuilder,
};

export const goldenSetResolver = {
  Query: {
    getGoldenSetById: async (
      _: unknown,
      arguments_: QueryGetGoldenSetByIdArguments,
    ): Promise<GoldenSet> => {
      const getGoldenSetByIdUseCase = new GetGoldenSetByIdUseCase(
        repository.goldenSetRepository,
      );
      const goldenSet = await getGoldenSetByIdUseCase.execute(arguments_.id);
      if (!goldenSet) {
        throw new GraphQLError(`GoldenSet with id ${arguments_.id} not found`);
      }
      return {
        ...goldenSet,
        copilotType: copilotTypeMapper[goldenSet.copilotType],
      };
    },
    getGoldenSets: async (
      _: unknown,
      arguments_: QueryGetGoldenSetsArguments,
    ): Promise<GoldenSet[]> => {
      const getGoldenSetsByFilterUseCase = new GetGoldenSetsByFilterUseCase(
        repository.goldenSetRepository,
      );
      const goldenSets = await getGoldenSetsByFilterUseCase.execute(
        arguments_.filters ?? {},
      );
      return goldenSets.map((goldenSet) => ({
        ...goldenSet,
        copilotType: copilotTypeMapper[goldenSet.copilotType],
      }));
    },
  },

  Mutation: {
    initializeGoldenSet: async (
      _: unknown,
      arguments_: MutationInitializeGoldenSetArguments,
    ): Promise<GoldenSet> => {
      const createGoldenSetUseCase = new CreateGoldenSetUseCase(
        repository.goldenSetRepository,
      );
      const goldenSet = await createGoldenSetUseCase.execute(
        arguments_.input.schemaId,
        arguments_.input.copilotType,
        arguments_.input.modelName,
      );
      return {
        ...goldenSet,
        copilotType: copilotTypeMapper[goldenSet.copilotType],
      };
    },
    createUserInput: async (
      _: unknown,
      arguments_: MutationCreateUserInputArguments,
    ): Promise<UserInput> => {
      const createUserInputUseCase = new CreateUserInputUseCase(
        repository.userInputRepository,
      );
      const userInput = await createUserInputUseCase.execute(
        arguments_.input.content,
        arguments_.input.createdBy,
      );
      return { ...userInput, createdAt: userInput.createdAt!.toISOString() };
    },
    linkGoldenSetToUserInput: async (
      _: unknown,
      arguments_: MutationLinkGoldenSetToUserInputArguments,
    ): Promise<boolean> => {
      const formCopilotInputUseCase = new FormCopilotInputUseCase({
        goldenSetRepository: repository.goldenSetRepository,
        userInputRepository: repository.userInputRepository,
      });
      await formCopilotInputUseCase.execute(
        arguments_.context.goldenSetId,
        arguments_.context.userInputId,
      );
      return true;
    },

    createProject: async (
      _: unknown,
      arguments_: { number: number },
    ): Promise<string> => {
      let results: string = "";
      const projectNames: string[] = [];
      for (let index = 0; index < arguments_.number; index++) {
        projectNames.push("CRDT-Evaluation-" + Date.now());
      }
      const typeSystemStore = new TypeSystemStore();
      await Promise.all(
        projectNames.map(async (projectName) => {
          const projectExId = await projectService.createProject(projectName);
          const schema =
            await typeSystemStore.fetchAppDetailByExId(projectExId);
          if (!schema?.crdtModelUrl) {
            throw new GraphQLError(
              `Failed to create project with name ${projectName}`,
            );
          }
          const path = new URL(schema.crdtModelUrl).pathname.split("/");
          results += await prisma.goldenSet.create({
            data: { schemaId: path[2], projectExId: projectExId },
          });
        }),
      );
      return JSON.stringify(results);
    },
    deleteProject: async (
      _: unknown,
      arguments_: { projectExId: string },
    ): Promise<boolean> => {
      const projects = await prisma.goldenSet.findMany({
        where: { projectExId: arguments_.projectExId },
      });
      await Promise.all(
        projects.map(async (project) => {
          await projectService.deleteProject(project.projectExId!);
        }),
      );
      await prisma.goldenSet.deleteMany({
        where: { projectExId: arguments_.projectExId },
      });
      return true;
    },
    runCrdtTest: async (
      _: unknown,
      arguments_: { number: number },
    ): Promise<string> => {
      try {
        const zionDatabase = new Client({
          connectionString: process.env.DATABASE_URL_PRODUCTION,
        });
        await zionDatabase.connect();
        const query = `
        mutation FixAliPayDataBinding($projectId: Long!) {
          fixAliPayDataBinding(projectId: $projectId)
        }
      `;
        const bodies: string[] = [];
        const fetchProjectId = {
          name: "fetch-project-ids",
          text: `SELECT project_id FROM project_schema GROUP BY project_id LIMIT ${arguments_.number}`,
        };
        const result = await zionDatabase.query(fetchProjectId);
        for (const { project_id } of result.rows) {
          const variables = { projectId: project_id };
          bodies.push(JSON.stringify({ query, variables }));
        }
        console.log("Generated GraphQL request bodies:", bodies);
        const results = await Promise.all(
          bodies.map(async (body) => {
            const response = await fetch(process.env.BACKEND_GRAPHQL_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DANGEROUS_TOKEN}`,
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "user-locale": "ZH",
                "x-react-app-version": "app_version_2019/12/01",
                "x-session-id": "2b481af5-b506-4976-9b65-777b8c57e0fa",
                "x-zed-version": "2.0.7",
                Referer: "https://zion.functorz.work/",
              },
              body: body,
            });
            const responseData = await response.json();
            if (!response.ok) {
              console.log(
                "GraphQL request failed with response:",
                responseData,
              );
              console.log(body);
              throw new Error(`Network response was not ok: ${response}`);
            }

            return JSON.stringify(responseData);
          }),
        );

        await zionDatabase.end();
        return results.join("\n");
        // const values = [ schemaIds.map( ( item ) => item.schemaId ) ];
      } catch (error) {
        console.error("Error in runCrdtTest:", error);
        throw new GraphQLError(`Error in runCrdtTest: ${error}`);
      }
    },
  },
};
