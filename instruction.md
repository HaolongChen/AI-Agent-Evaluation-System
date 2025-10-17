## Goal
So we can launch updates quickly when new models come out
So we can incorporate user feedback
So we can know the boundaries of current copilots and release new features when models are ready

## Golden set
For each copilot: Data Model Builder, UI Builder, Actionflow Builder, Log Analyzer, and Agent Builder curate a set of 20 to 50 high-quality examples
Have a mechanism to easily add more examples. 
Must be version controlled

## Runtime
Spawn up a headless zed + ztype with initial schema from the golden set, call copilot with copilot version and number of iterations. Have the ability to switch model. Evaluate using LLMs (quality) / program (validity). Record total latency, roundtrip count, input tokens, output tokens, context as % of max context window. 

## Eval framework
Adaptive rubrics generation using LLM + human review. (Bunch of yes no questions) 
For an Actionflow Builder prompt like, "Build a workflow that sends a reminder email to customers with unpaid invoices older than 30 days," an adaptive rubric would generate questions for the judge like:
1. "Does the generated workflow query the database for invoices? Yes/No."
2. "Does the workflow include a condition to check if an invoice is unpaid? Yes/No."
3. "Does the workflow include a condition to check if the invoice age is greater than 30 days? Yes/No."
4. "Does the workflow include a step to send an email? Yes/No."

| Momen Copilot             | Primary Goal                                              | Key LLM-as-a-Judge Metrics                                                                                                                        |
|----------------------|--------------------------------------------------------|----------------------------------|
| Data Model Builder     | Generate a correct, efficient, and maintainable database schema from a natural language description.     | EntityCoverage, AttributeCompleteness, NamingConventionAdherence, RelationalIntegrity, NormalizationLevel, BusinessLogicAlignment |
| UI Builder              | Generate a functional, aesthetically pleasing, and responsive UI from a description or image. |  ComponentChoiceRelevance, LayoutCoherence, StyleAdherence, ResponsivenessCheck    |
| Actionflow Builder           | Generate a correct, efficient, and logical workflow to automate a business process.  | TaskAdherence,  LogicalCorrectness, Efficiency  |
| Log Analyzer                        |Accurately identify anomalies, summarize patterns, and suggest root causes from log data.                 | Faithfulness (Hallucination Check), RootCauseCorrectness, SummaryCompleteness |
| Agent Builder                |   ...     |     ...   |