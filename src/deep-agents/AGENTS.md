# AGENTS.md - Deep Agents

> **Generated:** 2026-04-02 | **Status:** Active | **Type:** Deep Agent Architecture

Guidelines for specialized deep agents and rubric generation logic.

## Overview

Deep agents are autonomous sub-systems using the `createDeepAgent` factory. They handle complex, multi-step reasoning tasks that require specific domain knowledge, tool usage, and feedback loops.

**Location**: `src/deep-agents/`

## Structure

```
src/deep-agents/
├── rubricsGenerator/         # Rubric generation deep agent
│   ├── rubricsGenerator.ts   # Entry point, orchestrator
│   ├── prompts/              # System prompts and templates
│   └── tools/                # Specialized agent tools (Docs, Schema, Feedback)
└── llm/                      # LLM provider configurations (Gemini)
```

## Rubric Generation Agent

Orchestrates multiple sub-agents to generate evaluation rubrics based on user input, CRDT schemas, and official documentation.

| Component | Responsibility |
|-----------|----------------|
| `rubrics_generator_agent` | Main orchestrator; manages state, tools, and sub-agents. |
| `docs-lookup-agent` | Sub-agent; parses and explains Momen official documentation. |
| `schema-lookup-agent` | Sub-agent; inspects CRDT schema models via jq queries. |
| `Feedback` | Collects and persists agent performance logs to PostgreSQL. |

## Core Patterns

### Deep Agent Factory
Uses `@HaolongChen/deepagents` to create stateful agents with virtual filesystem backends.

### Backend Strategy
- **FilesystemBackend**: Provides virtual file access to `momen_docs`, `zion_schema`, and `schemas`.
- **CompositeBackend**: Merges multiple backends into a single agent workspace.

### Tooling
- **DocumentationReader**: Scrapes and converts HTML docs to markdown for agent consumption.
- **SchemaReader**: Handles CRDT schema binary initialization and JSON viewing.
- **Feedback Tool**: Captures execution traces and saves them via `RubricService`.

## Usage

```typescript
import { generateRubrics } from './rubricsGenerator/rubricsGenerator.ts';

const { rubrics, feedbacks } = await generateRubrics(schemaId, query);
```

## Important Notes

1. **State Persistence**: Uses `MemorySaver` for thread-level checkpointing.
2. **Prompts**: Managed as markdown files in `prompts/` directory; loaded at runtime.
3. **Environment**: Requires `GEMINI_API_KEY` and `MOMEN_DOCS_URL`.
4. **Local Shell**: Uses `local_shell/` directory for temporary workspace files.
