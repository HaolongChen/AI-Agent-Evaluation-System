# Rubrics Module

## OVERVIEW

Multi-agent rubric generation: deep agents analyze CRDT schema + user input to produce weighted criteria.

## STRUCTURE

```
domain/
  entity/          rubric.entity.ts (RubricEntity + CriteriaEntity),
                   entry.entity.ts, agent-feedback.entity.ts
  aggregate/       RubricAggregate (aggregate root), DirectoryAggregate
  interface/       IRubricRepository (custom), feedback.interface.ts
  schema/          5+ Zod schemas (rubric, agent-feedback, entry,
                   deep-agents, markdown-reader, read-json-schema)
  schema/prompts/  4 markdown prompt templates (loaded at runtime)
  service/         prompts.service.ts, feedback.service.ts, fs.service.ts
application/
  generate-rubric.ts        GenerateRubricUseCase
  get-by-id.ts              GetRubricByIdUseCase
  get-by-copilot-input.ts   GetRubricByCopilotInputUseCase
  save-feedbacks.ts         SaveFeedbacksUseCase
  rubricsGenerator/
    rubrics-generator.ts    generateRubrics() orchestration
    middleware/inspect.ts    Inspection middleware
    service/environment-setup.ts  Binary schema → JSON
    subagents/              schema-lookup-agent.ts,
                            documentations-lookup-agent.ts
    tools/                  schema-reader.ts, documentation-reader.ts,
                            markdown-reader.ts, feedback.ts
infrastructure/repository/
  rubric.repository.ts         Prisma-backed IRubricRepository
  agent-feedback.repository.ts Prisma-backed IRepository<AgentFeedbackEntity>
```

## ENTITIES

- **RubricEntity**: Root record tied to goldenSetId + userInputId
- **CriteriaEntity**: Criterion with content, weight (0-1), expectedAnswer, reasoning. Co-located in `rubric.entity.ts`.
- **EntryEntity**: Directory/file structure (name, extension, folder). Used by DirectoryAggregate.
- **AgentFeedbackEntity**: Tracks agent reasoning/output for audit and iteration

## AGGREGATES

- **RubricAggregate** extends AggregateRoot. Manages CriteriaEntity collection. Tracks `_criterion` array and `_totalWeight`. Enforces weight invariants. Method: `addCriteria(criteriaEntity)`.
- **DirectoryAggregate** — Directory-based rubric organization via EntryEntity.

## DOMAIN SERVICES

- **prompts.service.ts**: Loads markdown prompt templates at module init. Exports sub-agent configs and prompt text constants.
- **feedback.service.ts**: Feedback class accumulates sanitized agent feedback. Deduplicates consecutive identical entries.
- **fs.service.ts**: Filesystem ops for prompt loading and schema file management.

## APPLICATION USE CASES

- **GenerateRubricUseCase**: Fetches copilot input, calls generateRubrics, builds RubricAggregate, persists.
- **GetRubricByIdUseCase**: Retrieves RubricAggregate by ID or throws.
- **GetRubricByCopilotInputUseCase**: Retrieves rubric by goldenSetId + userInputId pair.
- **SaveFeedbacksUseCase**: Persists agent feedback via `IRepository<AgentFeedbackEntity>`.

## DEEP AGENTS INTEGRATION

**generateRubrics** in rubrics-generator.ts:

1. Fetches CRDT schema model (binary), writes JSON to local_shell/
2. Fetches Momen sidebar documentation
3. Creates gemini agent with two sub-agents:
   - schemaLookupAgent: jq-based schema lookups (read_json_schema tool)
   - documentationsLookupAgent: markdown evidence extraction (read_markdown_documentations tool)
4. Agents use Feedback middleware for accumulated reasoning
5. Final response parsed via responseSchema (criteria: content, expectedAnswer, weight, failureScenario, verificationTarget, verificationRule)

## CONVENTIONS

- Prompt templates loaded via fs.readFile at init (not bundled)
- Entities extend base Entity with Zod schema validation
- RubricRepository implements `IRubricRepository` (extends `IRepository<RubricEntity>`); AgentFeedbackRepository implements plain `IRepository<AgentFeedbackEntity>` (no separate interface file)
- RubricRepository uses repositoryDateMapper for datetime normalization
- Named exports only. No default exports.

## ANTI-PATTERNS

- `environment-setup.ts` line 17: Promise chaining (`.then()`) — needs async/await migration
- `prompts.service.ts` (domain): imports from `application/rubricsGenerator/tools` — cross-layer violation
- `feedback.service.ts` (domain): imports logger from `shared/infrastructure` — cross-layer violation
- `rubrics-generator.ts`: direct LLM calls without `invokeWithRetry` (not yet implemented) — no retry protection
