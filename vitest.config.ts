import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist", "local_shell"],
  },
  resolve: {
    conditions: ["node", "import"],
  },
});
