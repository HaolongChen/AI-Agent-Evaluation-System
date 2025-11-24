// FetchAppDetailsBySchemaId
import { tool } from "langchain";
import * as z from "zod";
import { TypeSystemStore } from "../../utils/zed/TypeSystemStore.ts";

export const schemaDownloader = tool(
    async ({ projectExId }: { projectExId: string }) => {
        const typeSystemStore = new TypeSystemStore();
        await typeSystemStore.rehydrate(projectExId);
        const schemaGraph = typeSystemStore.schemaGraph;
        if (!schemaGraph) {
            throw new Error("Failed to download schema graph.");
        }
        return JSON.stringify(schemaGraph);
    },
    {
        name: "schema_downloader",
        description: "Download the schema graph for a given projectExId.",
        schema: z.object({
            projectExId: z.string().nonempty().describe("The external ID of the project."),
        }),
    }
)