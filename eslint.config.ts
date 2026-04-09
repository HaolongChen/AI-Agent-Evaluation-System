import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import codeComplete from "eslint-plugin-code-complete";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig( [
  {
    files: [ "{src,tests,scripts}/**/*.{js,mjs,cjs,ts,mts,cts}" ],
    ignores: [ "node_modules/**", "dist/**", "**/generated/**/*", "local_shell/**", "src/graphql/type/**", "env.d.ts" ],
    plugins: { js, codeComplete },
    extends: [ "js/recommended" ],
    languageOptions: { globals: globals.node },
  },
  {...eslintPluginUnicorn.configs.recommended, ignores: [ "node_modules/**", "dist/**", "**/generated/**/*", "local_shell/**", "scripts/**", "env.d.ts", "**/external/**", "src/graphql/type/**" ]},
  tseslint.configs.recommended
]);
