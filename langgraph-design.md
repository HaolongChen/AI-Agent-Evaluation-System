```Mermaid
graph TD

  %% Intake and rubric building
  A["Input Collector  
  Gather query, context, candidate output"]
    --> B["Schema Checker  
    Identify needed domain schemas"]

  B --> C["Schema Loader  
    Load or generate schema expressions"]

  C --> D["Rubric Drafter  
    Produce rubric draft  
    Criteria and scoring scales"]

  D -->|Human-in-the-loop| H["Human Reviewer  
    Approve or modify rubric"]

  H --> E["Rubric Interpreter  
    Freeze rubric into evaluation contract"]


  %% Dual evaluation paths
  E --> F1["Agent Evaluator  
    Apply rubric  
    Produce structured agent evaluation"]

  E --> F2["Human Evaluator  
    Human completes rubric  
    Independent human judgment"]


  %% Merge and finalize
  F1 --> M["Merger  
    Combine human and agent evaluations  
    Reconcile differences  
    Produce final combined result"]

  F2 --> M

  M --> G["Report Generator  
    Final verdict  
    Human readable summary  
    Full audit trace"]

```