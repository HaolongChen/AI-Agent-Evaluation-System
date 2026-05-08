# Rubrics Module

## OVERVIEW

Evaluation criteria generation via multi-agent orchestration: deep agents analyze CRDT schema + user input to produce weighted criteria rubrics.

## STRUCTURE

```
domain/
  entity/          RubricEntity, CriteriaEntity, AgentFeedbackEntity
  aggregate/      RubricAggregate (aggregate root)
  interface/      IRubricRepository, IAgentFeedbackRepository
  schema/         rubric.schema.ts, agent-feedback.schema.ts, deep-agents.schema.ts
  schema/prompts/ Markdown prompt templates (loaded at runtime)
  service/        prompts.service.ts, feedback.service.ts
application/      GenerateRubricUseCase, GetRubricByIdUseCase, rubrics-generator.ts
infrastructure/repository/ RubricRepository, AgentFeedbackRepository
```

## ENTITIES

- **RubricEntity**: Root record tied to goldenSetId + userInputId
- **CriteriaEntity**: Individual evaluation criterion with weight, expectedAnswer, content
- **AgentFeedbackEntity**: Tracks agent reasoning/output for audit and iteration

## AGGREGATE

**RubricAggregate** extends AggregateRoot. Manages a collection of CriteriaEntity. Tracks totalWeight across all criteria. Enforces weight invariants.

## DOMAIN SERVICES

- **prompts.service.ts**: Loads markdown prompt templates at module init. Exports sub-agents (schemaQueryWorker, documentationsExcerptWorker) and prompt text constants (rubricsGeneratorPromptText, schemaLookupPromptText, documentationsLookupPromptText).
- **feedback.service.ts**: Feedback class accumulates sanitized feedback strings per agent. Deduplicates consecutive identical entries.

## APPLICATION USE CASES

- **GenerateRubricUseCase**: Fetches copilot input by goldenSetId + userInputId, calls generateRubrics, builds RubricAggregate with criteria, persists via repository.
- **GetRubricByIdUseCase**: Retrieves RubricAggregate by ID or throws.

## DEEP AGENTS INTEGRATION

**generateRubrics** in rubrics-generator.ts orchestrates:

1. Fetches CRDT schema model (binary) and saves as JSON to local_shell/
2. Fetches Momen sidebar documentation
3. Creates rubrics_generator_agent (gemini) with two sub-agents:
   - schemaLookupAgent: jq-based schema lookups via read_json_schema tool
   - documentationsLookupAgent: markdown evidence extraction via read_markdown_documentations tool
4. Agents use Feedback middleware to accumulate agent reasoning
5. Final structured response parsed via responseSchema (criterion array with content, expectedAnswer, weight, failureScenario, verificationTarget, verificationRule)

## CONVENTIONS

- Prompt templates loaded via `fs.readFile` at module initialization (not bundled)
- All entities extend base Entity with Zod schema validation
- RubricRepository uses repositoryDateMapper for datetime normalization
- No default exports; named exports only
