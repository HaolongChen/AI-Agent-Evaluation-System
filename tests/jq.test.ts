import * as jq from "node-jq";


const res = await jq.run(
	".properties.server.properties.dataModel.properties.tableMetadata.items.properties | keys",
	"local_shell/schemas/zschema.json",
	{
		input: "file",
		output: "compact",
	},
);

console.debug("jq result", res);