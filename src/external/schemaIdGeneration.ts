import { projectService } from "../modules/copilot-input/application/project-service.ts";
import { TypeSystemStore } from "./zed/TypeSystemStore.ts";
import { authState } from "./graphql-client.ts";
import { login } from "./login.ts";

try {
  if (!process.env.FUNCTORZ_PHONE_NUMBER || !process.env.FUNCTORZ_PASSWORD) {
    throw new Error(
      "FUNCTORZ_PHONE_NUMBER and FUNCTORZ_PASSWORD are required for initial login",
    );
  }
  const token = await login(
    process.env.FUNCTORZ_PHONE_NUMBER,
    process.env.FUNCTORZ_PASSWORD,
  );
  console.info("Initial login successful, token obtained");
  authState.setToken(token);
} catch (err) {
  console.error(
    "Initial login failed — server will continue, TypeSystemStore will re-auth on demand",
    err,
  );
}
const projectName = `EvaluationJobRunner-${Date.now()}`;
const projectExId = await projectService.createProject(projectName);
const typeSystemStore = new TypeSystemStore();
const schema = await typeSystemStore.fetchAppDetailByExId(projectExId);
if (schema) {
  console.info("Fetched schema:", schema);
}
await projectService.deleteProject(projectExId);
