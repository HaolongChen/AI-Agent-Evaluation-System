import { projectService } from "../services/ProjectService.ts";
import { TypeSystemStore } from "./zed/TypeSystemStore.ts";
import { FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD } from '../config/env.ts';
import { authState } from "./graphql-client.ts";
import { login } from "./login.ts";
import { logger } from "./logger.ts";

try {
  if (!FUNCTORZ_PHONE_NUMBER || !FUNCTORZ_PASSWORD) {
    throw new Error('FUNCTORZ_PHONE_NUMBER and FUNCTORZ_PASSWORD are required for initial login');
  }
  const token = await login(FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD);
  logger.info('Initial login successful, token obtained');
  authState.setToken(token);
} catch (err) {
  logger.error('Initial login failed — server will continue, TypeSystemStore will re-auth on demand', err);
}
const projectName = `EvaluationJobRunner-${Date.now()}`;
const projectExId = await projectService.createProject(projectName);
const typeSystemStore = new TypeSystemStore();
const schema = await typeSystemStore.fetchAppDetailByExId(projectExId);
if(schema){
  logger.info("Fetched schema:", schema);
}
await projectService.deleteProject(projectExId);