# MQI Decision Architecture

## Purpose
Preserve how MQI is intended to reason through manufacturing quote decisions in the future-state platform model.

## Decision objective
Produce a recommendation that is:
- commercially safe
- operationally feasible
- margin-aware
- transparent enough for human approval

## Decision sequence
1. normalize requirements
2. validate constraints and blockers
3. compare candidate manufacturers
4. weigh readiness, cost, timing, and risk
5. generate recommendation with rationale
6. route to human review
7. issue quote after approval

## Preserved decision stages
### 1. Requirements normalization
Inputs:
- customer materials
- part details
- quantity
- finish requirements
- lead targets
- source files and notes

Output:
- manufacturer-ready decision package

### 2. Capacity analysis
Inputs:
- requested quantity
- production window
- available headroom

Output:
- schedule confidence assessment per manufacturer

### 3. Inventory analysis
Inputs:
- material requirement
- usable stock or reserved allocation
- replenishment exposure

Output:
- material readiness posture per manufacturer

### 4. Lead-time analysis
Inputs:
- required delivery target
- production start window
- transit pattern

Output:
- lead-time fit and commitment confidence

### 5. Commercial analysis
Inputs:
- target margin
- risk tolerance
- commitment strength
- cost posture

Output:
- best overall business recommendation

## Preserved comparison model
The current preserved prototype uses side-by-side manufacturer comparison on:
- delivery reliability
- margin achievement
- inventory confidence
- capacity confidence
- quality stability
- commercial risk
- logistics risk

## Preserved output model
The future-state system surfaces:
- recommendation headline
- confidence score
- leading candidate
- business impact
- tradeoffs
- risks
- trust signals
- human decision prompt

## Human-in-the-loop rule
The system narrows uncertainty. The human retains:
- judgment over exceptions and tradeoffs
- approval authority
- commercial accountability
- final send decision

## Future-state implication
This decision architecture is intentionally broader than a single-manufacturer MVP. It preserves the logic required for:
- manufacturer comparison
- sourcing intelligence
- predictive recommendations
- future manufacturing network intelligence