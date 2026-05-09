import z from "zod";

export const readJsonSchemaToolField = {
  name: "read_json_schema",
  description:
    "Using external jq tool to read (lazy load) the JSON schema you own",
  schema: z.object({
    query: z
      .string()
      .describe(
        "The jq query used to search against the target JSON schema. It must be a valid jq query string without any decorators. For example, if you want to extract the 'name' field from a JSON object, your query should be '.name'.(without quotes) If you want to filter an array of objects where the 'age' field is greater than 30, your query should be '.[] | select(.age > 30)'.(without quotes) The query should be designed according to the structure of the JSON schema you are targeting. IMPORTANT: your query would be sent as a string, so make sure to escape any special characters properly. For example, if your query includes double quotes, you should escape them like this: '.[] | select(.name == \"John\")'.(without single quotes) Always test your jq queries independently to ensure they return the expected results before using them in this tool.",
      ),
  }),
};
