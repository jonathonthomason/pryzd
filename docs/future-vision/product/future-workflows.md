# MQI Future Workflows

## Purpose
Preserve the current future-state workflow model and multi-manufacturer user journey assumptions.

## Primary workflow
1. **Capture**
   - upload source material
   - ingest drawings, specs, spreadsheets, and notes
   - draft the request from raw inputs
2. **Confirm**
   - resolve blockers
   - normalize requirements
   - lock the manufacturer-ready request package
3. **Manufacturer Evaluation**
   - compare multiple candidate manufacturers
   - analyze capacity, inventory, lead time, margin, and risk
   - expose reasoning step-by-step
4. **Recommendation Workspace**
   - present the leading manufacturer/path
   - explain why it won
   - show tradeoffs, confidence, and trust signals
5. **Present / Customer Quote**
   - convert approved recommendation into customer-facing quote output

## User journeys
### Sales / operator journey
- receives customer request
- imports source material
- reviews structured requirements
- observes evaluation of candidate manufacturers
- reviews recommended path
- applies human judgment
- sends quote

### Customer journey
- submits request
- receives fast, credible quote
- reviews price, lead time, and delivery terms
- approves and moves forward

### Internal review journey
- ops and internal stakeholders validate exceptions
- human approver checks confidence, risk, and commercial posture
- system supports decision; human retains accountability

## Preserved decision points
- Is the request complete enough to evaluate?
- Are blockers resolved?
- Which manufacturer best fits capacity and inventory constraints?
- Which path best protects lead time credibility?
- Which path best protects margin while containing risk?
- Is the recommendation strong enough for human approval?

## Multi-manufacturer flows
The preserved future-state workflow assumes a candidate set can be evaluated in one workspace.

### Balanced flow
- compare qualified manufacturers
- recommend the best combined delivery, inventory, capacity, and commercial fit

### Margin-prioritized flow
- compare alternatives with stronger margin upside
- expose schedule/logistics tradeoffs

### Logistics-prioritized flow
- emphasize lead-time credibility and delivery stability
- accept moderated commercial tradeoffs when necessary

## Workflow language preserved from current state
- Capture
- Confirm
- Manufacturer Evaluation
- Recommendation Workspace
- Present
- best path selection
- approved recommendation

## Navigation map
- `/` → Prototype home
- `/capture` → Capture
- `/confirm` → Confirm
- `/manufacturer-evaluation` → Manufacturer Evaluation
- `/recommendation-workspace` → Recommendation Workspace
- `/customer-quote` → Present