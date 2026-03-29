import * as jq from "node-jq";
import { logger } from "../src/utils/logger";

const res = await jq.run(
	".properties.server.properties.dataModel.properties.tableMetadata.items.properties | keys",
	"local_shell/schemas/zschema.json",
	{
		input: "file",
		output: "compact",
	},
);

logger.debug("jq result", res);