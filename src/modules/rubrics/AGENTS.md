# Rubrics Module

## OVERVIEW

Evaluation criteria generation via multi-agent orchestration: deep agents analyze CRDT schema + user input to produce weighted criteria rubrics.

## STRUCTURE

```
domain/
  entity/          RubricEntity, EntryEntity, AgentFeedbackEntity
  aggregate/       RubricAggregate (aggregate root), DirectoryAggregate
  interface/       IRubricRepository, IAgentFeedbackRepository
  schema/          rubric.schema.ts, agent-feedback.schema.ts, entry.schema.ts,
                   deep-agents.schema.ts, markdown-reader.schema.ts,
                   read-json-schema.schema.ts
  schema/prompts/  Markdown prompt templates (loaded at runtime):
                   rubricsGeneratorPrompt.md, schemaLookupPrompt.md,
                   documentationsLookupPrompt.md, feedbackPrompt.md
  service/         prompts.service.ts, feedback.service.ts, fs.service.ts
application/
  generate-rubric.ts        GenerateRubricUseCase
  get-by-id.ts              GetRubricByIdUseCase
  get-by-copilot-input.ts   GetRubricByCopilotInputUseCase
  save-feedbacks.ts         SaveFeedbacksUseCase
  rubricsGenerator/
    rubrics-generator.ts    generateRubics() orchestration
    middleware/
      inspect.ts            Inspection middleware
    service/
      environment-setup.ts  Environment setup (binary schema → JSON)
    subagents/
      schema-lookup-agent.ts         Schema lookup sub-agent
      documentations-lookup-agent.ts Documentation lookup sub-agent
    tools/
      schema-reader.ts              jq-based schema reading tool
      documentation-reader.ts        Markdown documentation reader
      markdown-reader.ts             Generic markdown reader
      feedback.ts                    Feedback accumulation middleware
infrastructure/repository/
  rubric.repository.ts         Prisma-backed IRubricRepository
  agent-feedback.repository.ts Prisma-backed IAgentFeedbackRepository
```

## ENTITIES

- **RubricEntity**: Root record tied to goldenSetId + userInputId
- **EntryEntity**: Individual rubric entry with content, weight, expectedAnswer
- **AgentFeedbackEntity**: Tracks agent reasoning/output for audit and iteration

## AGGREGATE

**RubricAggregate** extends AggregateRoot. Manages a collection of EntryEntity (not CriteriaEntity — renamed). Tracks totalWeight across all entries. Enforces weight invariants.

**DirectoryAggregate** — Aggregate for directory-based rubric organization.

## DOMAIN SERVICES

- **prompts.service.ts**: Loads markdown prompt templates at module init. Exports sub-agents (schemaQueryWorker, documentationsExcerptWorker) and prompt text constants (rubricsGeneratorPromptText, schemaLookupPromptText, documentationsLookupPromptText).
- **feedback.service.ts**: Feedback class accumulates sanitized feedback strings per agent. Deduplicates consecutive identical entries.
- **fs.service.ts**: Filesystem operations for prompt template loading and schema file management.

## APPLICATION USE CASES

- **GenerateRubricUseCase**: Fetches copilot input by goldenSetId + userInputId, calls generateRubrics, builds RubricAggregate with entries, persists via repository.
- **GetRubricByIdUseCase**: Retrieves RubricAggregate by ID or throws.
- **GetRubricByCopilotInputUseCase**: Retrieves rubric by golden set + user input pair.
- **SaveFeedbacksUseCase**: Persists agent feedback records.

## DEEP AGENTS INTEGRATION

**generateRubrics** in rubrics-generator.ts orchestrates:

1. Fetches CRDT schema model (binary) and saves as JSON to local_shell/
2. Fetches Momen sidebar documentation
3. Creates rubrics_generator_agent (gemini) with two sub-agents:
   - schemaLookupAgent: jq-based schema lookups via read_json_schema tool
   - documentationsLookupAgent: markdown evidence extraction via read_markdown_documentations tool
4. Agents use Feedback middleware to accumulate agent reasoning
5. Final structured response parsed via responseSchema (entry array with content, expectedAnswer, weight, failureScenario, verificationTarget, verificationRule)

## CONVENTIONS

- Prompt templates loaded via `fs.readFile` at module initialization (not bundled)
- All entities extend base Entity with Zod schema validation
- RubricRepository uses repositoryDateMapper for datetime normalization
- No default exports; named exports only
- `environment-setup.ts` has Promise chaining anti-pattern (line 17) — needs migration to async/await
- `prompts.service.ts` has cross-layer import violation (imports from application/tools)
