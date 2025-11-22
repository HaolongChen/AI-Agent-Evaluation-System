```Mermaid
graph TD
    %% Nodes
    START((Start)) --> A
    
    subgraph "Phase 1: Analysis"
        A[<b>Node: Requirement Analyzer</b><br/><i>Splits constraints into:<br/>1. Hard Rules Schema/Syntax<br/>2. Soft Rules Tone/Logic</i>]
    end

    subgraph "Phase 2: Generation"
        B[<b>Node: Rubric Drafter</b><br/><i>Generates initial scoring criteria<br/>and assigns weights</i>]
    end

    subgraph "Phase 3: Evaluation Loop"
        C[<b>Node: The Critic</b><br/><i>Checks for ambiguity.<br/>'Is this rule specific enough?'</i>]
        D[<b>Node: Refiner</b><br/><i>Updates rubric based<br/>on Critic's feedback</i>]
    end

    subgraph "Phase 4: Finalization"
        E[<b>Node: JSON Formatter</b><br/><i>Ensures output matches<br/>Eval System API</i>]
    end

    END((End))

    %% Edges
    A --> B
    B --> C
    
    %% Conditional Edge
    C -- "Critique: Vague/Subjective" --> D
    D --> C
    
    C -- "Critique: Approved" --> E
    E --> END

    %% Styling
    style C fill:#ffcccc,stroke:#333,stroke-width:2px
    style D fill:#fff2cc,stroke:#333,stroke-width:2px
    style E fill:#ccffcc,stroke:#333,stroke-width:2px
```