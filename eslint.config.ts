import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import codeComplete from "eslint-plugin-code-complete";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import graphqlPlugin from "@graphql-eslint/eslint-plugin";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "**/generated/**/*",
      "local_shell/**",
      ".codegraphy/**",
      "env.d.ts",
      ".dependency-cruiser.cjs",
      "dependency-graph.svg",
      "src/graphql/functorz/**",
      "src/prisma/staging/**",
      "src/graphql/generated/**",
      "src/prisma/build/**",
    ],
  },
  {
    files: ["src/**.ts"],
    processor: graphqlPlugin.processor,
  },
  {
    files: ["src/**/*.{graphql}"],
    languageOptions: {
      parser: graphqlPlugin,
    },
  },
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, codeComplete },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/**/*.ts"],
    ...eslintPluginUnicorn.configs.recommended,
  },
  tseslint.configs.recommended,
]);
