import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import codeComplete from "eslint-plugin-code-complete";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig([
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: [
      "node_modules/**",
      "dist/**",
      "**/generated/**/*",
      "local_shell/**",
      "src/graphql/type/**",
      "env.d.ts",
      ".dependency-cruiser.cjs",
      "dependency-graph.svg",
      "momen_doc/**",
      "src/graphql/generated/resolvers-types.ts",
      "src/prisma/staging/**",
    ],
    plugins: { js, codeComplete },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/**/*.ts"],
    ...eslintPluginUnicorn.configs.recommended,
    ignores: [
      "node_modules/**",
      "dist/**",
      "**/generated/**/*",
      "local_shell/**",
      "scripts/**",
      "env.d.ts",
      "**/external/**",
      "src/graphql/type/**",
      ".dependency-cruiser.cjs",
      "dependency-graph.svg",
      "momen_doc/**",
      "src/graphql/generated/resolvers-types.ts",
      "src/prisma/staging/**",
    ],
  },
  tseslint.configs.recommended.map((config) => {
    return {
      ...config,
      ignores: [
        "src/graphql/generated/resolvers-types.ts",
        "node_modules/**",
        "dist/**",
        "**/generated/**/*",
        "local_shell/**",
        "scripts/**",
        "env.d.ts",
        "**/external/**",
        "src/graphql/type/**",
        ".dependency-cruiser.cjs",
        "dependency-graph.svg",
        "momen_doc/**",
        "src/prisma/staging/**",
      ],
    };
  }),
]);
