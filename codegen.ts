import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	// This assumes that all your source files are in a top-level `src/` directory - you might need to adjust this to your file structure

	// Don't exit with non-zero status when there are no documents
	ignoreNoDocuments: true,
	generates: {
		// Use a path that works the best for the structure of your application
		"./src/graphql/generated/resolvers-types.ts": {
			plugins: ["typescript", "typescript-resolvers"],
			config: {
				nonOptionalTypename: true,
				skipTypeNameForRoot: true,
				avoidOptionals: true,
				useIndexSignature: true,
				enumAsTypes: true,
				useTypeImports: true,
				contextType: "undefined",
				nonOptionals: true,
				maybeValue: "T | undefined",
				maybeType: "T | undefined",
			},
			schema: "./src/graphql/type/schema.graphql",
		},
		"./src/graphql/generated/types.ts": {
			plugins: ["typescript-operations"],
			config: {
				nonOptionalTypename: true,
				useTypeImports: true,
				inputMaybeValue: "T | undefined",
				dedupeOperationSuffix: true,
				exportFragmentSpreadSubTypes: true,
				experimentalFragmentVariables: true,
				mergeFragmentTypes: true,
				extractAllFieldsToTypesCompact: true,
				includeExternalFragments: true,
			},
			schema: "https://zionbackend.functorz.work/api/graphql",
			documents: [
				"src/**/*.{ts,tsx}",
				"!src/graphql/generated/**/*",
				"!src/prisma/**/*",
			],
		},
		"./src/graphql/generated/merged-schema.graphql": {
			plugins: ["schema-ast"],
			schema: [
				"./src/graphql/type/schema.graphql",
				"https://zionbackend.functorz.work/api/graphql",
			],
			documents: [
				"src/**/*.{ts,tsx}",
				"!src/graphql/generated/**/*",
				"!src/prisma/**/*",
			],
		},
	},
	hooks: {
		afterAllFileWrite: ["prettier --write"],
	},
};

export default config;
