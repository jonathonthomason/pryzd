# MQI Future-State Architecture

## Purpose
Preserve the complete future-state architecture behind MQI before any production MVP simplification.

## System architecture
MQI is structured as a workflow-first product surface backed by modular orchestration.

### Preserved system layers
1. **User layer**
   - customer
   - sales rep
   - ops team
   - leadership/stakeholder consumers
2. **Workflow layer**
   - capture
   - confirm
   - manufacturer evaluation
   - recommendation workspace
   - customer quote output
3. **Orchestration layer**
   - intake agent
   - manufacturer quote/pricing agents
   - cost inputs agent
   - margin optimization logic
   - decision layer
4. **Data/platform layer**
   - manufacturer APIs and inputs
   - internal cost and constraint data
   - memory/state
   - design tokens and UI system foundations
5. **Roadmap layer**
   - expansion from quote workflow to manufacturing intelligence platform

## Agent architecture
The preserved deck explicitly uses a specialized-agent model behind a simpler user workflow.

### Preserved agent responsibilities
- **Intake Agent**: extracts requirements from source files
- **Manufacturer Quote Agent**: pulls supplier/manufacturer pricing inputs
- **Cost Inputs Agent**: adds logistics, lead time, and internal cost assumptions
- **Margin Optimization Agent**: applies pricing and commercial guardrails
- **Decision Layer**: assembles recommendation, rationale, and confidence posture
- **Human Approver**: retains final judgment and send authority

## Workflow architecture
The preserved workflow architecture is:
1. order submitted / capture
2. requirements evaluated / confirm
3. manufacturers assessed
4. recommendation generated
5. human review
6. quote sent

This architecture preserves a future-state assumption that multiple manufacturers may be evaluated and ranked before a recommendation is surfaced.

## Decision architecture
MQI’s decision model combines operational feasibility and commercial safety.

### Decision signals preserved in current artifacts
- requirements completeness
- capacity confidence
- inventory readiness
- lead time fit
- margin achievement
- quality stability
- commercial risk
- logistics risk
- confidence score
- rationale and tradeoffs

### Decision outputs
- recommended manufacturer/path
- confidence score
- human decision prompt
- tradeoffs and business impact
- risks and next action

## Data architecture
### Core preserved entities
- customer
- RFQ / order request
- part / part revision
- quantity
- requirements package
- constraints
- manufacturer
- manufacturer capacity
- manufacturer inventory posture
- lead-time estimate
- pricing/cost inputs
- margin target
- logistics profile
- recommendation
- confidence score
- risk posture

### Preserved data relationships
- one inbound request can be evaluated against multiple manufacturers
- each manufacturer contributes different cost, timing, inventory, and risk signals
- the recommendation layer compares candidates across shared evaluation criteria
- the quote output is generated only after recommendation and human approval

## Architecture diagrams
### High-level diagram source
- `docs/future-vision/architecture/architecture.png`

### Narrative diagram summary
```text
Customer / Sales / Ops
        ↓
Workflow surface
(Capture → Confirm → Manufacturer Evaluation → Recommendation → Present)
        ↓
Orchestration + agent layer
(Intake → Manufacturer pricing → Cost inputs → Margin optimization → Decision)
        ↓
Data + platform layer
(Manufacturer APIs, internal costs, constraints, memory, UI tokens)
        ↓
Platform roadmap
(Quoting → manufacturer intelligence → network intelligence → fulfillment optimization)
```

## Preservation constraints
- do not simplify this architecture to match the current MVP business reality
- do not remove multi-manufacturer assumptions from this document
- do not rewrite this as a single-manufacturer implementation spec
- preserve it as strategic architecture truth