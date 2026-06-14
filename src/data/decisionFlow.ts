export type DecisionScenario = 'balanced' | 'margin' | 'logistics'

export const orderSummary = {
  orderId: 'RFQ-2026-0614',
  customer: 'Northstar Retail Fixtures',
  part: 'CNC Housing Rev B',
  quantity: 2500,
  destination: 'Atlanta, GA',
  requiredDeliveryDate: '2026-07-08',
  targetMarginPct: 50,
  material: '6061 aluminum',
  finish: 'Black anodize',
  packaging: 'Reseller-label-ready',
}

export const evaluationSteps = [
  {
    label: 'Requirements normalized',
    note: 'Material, finish, tolerance, packaging, and alternates locked for comparison.',
  },
  {
    label: 'Manufacturing capabilities matched',
    note: 'Three manufacturers qualified. One domestic option excluded for finish-slot mismatch.',
  },
  {
    label: 'Material availability analyzed',
    note: 'North Ridge confirmed stock; Monterrey reserved allocation; Pearl River available with replenishment exposure.',
  },
  {
    label: 'Capacity evaluated',
    note: 'North Ridge holds the strongest start window and best schedule buffer.',
  },
  {
    label: 'Lead times evaluated',
    note: '18-day domestic path leads. Mexico remains viable at 23 days. China slips to 32 days.',
  },
  {
    label: 'Shipping constraints evaluated',
    note: 'Domestic route contains logistics volatility better than cross-border and ocean options.',
  },
  {
    label: 'Margin targets evaluated',
    note: 'All three paths can clear 50%, but economics alone do not determine the recommendation.',
  },
  {
    label: 'Quality history evaluated',
    note: 'North Ridge has the strongest quality stability for this part family.',
  },
  {
    label: 'Commercial risk assessed',
    note: 'Mexico carries thinner schedule buffer. China increases commitment risk despite stronger margin.',
  },
  {
    label: 'Recommendation generated',
    note: 'North Ridge selected as the strongest manufacturing decision for this order.',
  },
] as const

export const manufacturers = [
  {
    id: 'MFG-NRM-001',
    name: 'North Ridge Manufacturing',
    region: 'Illinois, USA',
    leadTimeDays: 18,
    marginPct: 52.1,
    risk: 'Low',
    confidencePct: 92,
    inventory: 'Confirmed',
    capacity: 'Available',
    quality: 'Strong',
    logisticsRisk: 'Contained',
    commercialRisk: 'Low',
    rationale: 'Best combined delivery, quality, and commercial posture.',
  },
  {
    id: 'MFG-MEX-014',
    name: 'Monterrey Precision Works',
    region: 'Nuevo León, Mexico',
    leadTimeDays: 23,
    marginPct: 54.4,
    risk: 'Moderate',
    confidencePct: 85,
    inventory: 'Reserved',
    capacity: 'Tight',
    quality: 'Acceptable',
    logisticsRisk: 'Moderate',
    commercialRisk: 'Moderate',
    rationale: 'Higher margin with weaker schedule buffer and more coordination risk.',
  },
  {
    id: 'MFG-CHN-032',
    name: 'Pearl River Components',
    region: 'Shenzhen, China',
    leadTimeDays: 32,
    marginPct: 58.8,
    risk: 'High',
    confidencePct: 78,
    inventory: 'Available',
    capacity: 'Available',
    quality: 'Acceptable',
    logisticsRisk: 'High',
    commercialRisk: 'High',
    rationale: 'Highest margin, but long transit and logistics variability weaken commitment confidence.',
  },
] as const

export const scenarioRecommendations: Record<DecisionScenario, {
  label: string
  badge: string
  recommendedManufacturerId: string
  headline: string
  why: string[]
  businessImpact: string[]
  tradeoffs: string[]
  risks: string[]
  humanDecision: string
  signalChips: Array<{ label: string; tone: 'good' | 'warn' }>
  trustSignalOverrides?: Partial<Record<'Inventory' | 'Capacity' | 'Lead time' | 'Quality history' | 'Margin' | 'Commercial risk' | 'Logistics risk', { value: string; tone: 'good' | 'warn' }>>
}> = {
  balanced: {
    label: 'Balanced recommendation',
    badge: 'High confidence',
    recommendedManufacturerId: 'MFG-NRM-001',
    headline: 'Best overall manufacturing path for delivery confidence and commercial fit.',
    why: ['Inventory confirmed', 'Capacity available', 'Meets delivery target', 'Maintains target margin', 'Strong quality history', 'Lowest commercial risk'],
    businessImpact: ['Protects delivery commitment', 'Preserves target margin', 'Minimizes escalation risk'],
    tradeoffs: ['Not the highest-margin path available', 'Uses the current domestic slot', 'Leaves less upside than a slower offshore option'],
    risks: ['Domestic slot should be approved in the current cycle to protect timing.', 'Expedite remains available but would compress margin if the schedule slips.'],
    humanDecision: 'Approve the recommendation if delivery confidence matters more than incremental margin expansion.',
    signalChips: [
      { label: 'High confidence', tone: 'good' },
      { label: 'Margin above target', tone: 'good' },
      { label: 'Strong quality history', tone: 'good' },
      { label: 'Low commercial risk', tone: 'good' },
    ],
  },
  margin: {
    label: 'Margin-weighted recommendation',
    badge: 'Tradeoff visible',
    recommendedManufacturerId: 'MFG-MEX-014',
    headline: 'Margin-leading option is viable, but it introduces a thinner schedule buffer.',
    why: ['Maintains margin above target', 'Inventory allocation is held', 'Commercial upside exceeds domestic path', 'Quality record remains acceptable'],
    businessImpact: ['Improves gross margin buffer', 'Retains a viable delivery plan', 'Introduces tighter schedule management'],
    tradeoffs: ['Weaker schedule buffer than North Ridge', 'More coordination required to stay on commitment', 'Slightly higher escalation exposure'],
    risks: ['The recommendation is viable, but the schedule buffer is thinner.', 'Late supplier confirmation would force a re-check of the delivery promise.'],
    humanDecision: 'Approve if margin expansion is the priority and the team accepts a thinner timing buffer.',
    signalChips: [
      { label: 'High margin', tone: 'good' },
      { label: 'Thin schedule buffer', tone: 'warn' },
      { label: 'Moderate logistics risk', tone: 'warn' },
      { label: 'Viable alternate path', tone: 'good' },
    ],
    trustSignalOverrides: {
      Inventory: { value: 'Reserved', tone: 'good' },
      Capacity: { value: 'Available with narrower window', tone: 'warn' },
      'Lead time': { value: '23-day fit', tone: 'warn' },
      Margin: { value: '54.4%', tone: 'good' },
      'Commercial risk': { value: 'Moderate', tone: 'warn' },
      'Logistics risk': { value: 'Moderate', tone: 'warn' },
    },
  },
  logistics: {
    label: 'Logistics-sensitive recommendation',
    badge: 'Risk contained',
    recommendedManufacturerId: 'MFG-NRM-001',
    headline: 'Recommendation favors delivery reliability under logistics sensitivity.',
    why: ['Reduces logistics uncertainty', 'Protects delivery commitment', 'Keeps margin above threshold', 'Avoids commercial exposure from transit variability'],
    businessImpact: ['Stabilizes customer promise', 'Limits exception handling', 'Preserves approval confidence'],
    tradeoffs: ['Slightly lower margin than offshore alternatives', 'Less optionality if capacity tightens later'],
    risks: ['If domestic capacity shifts, the recommendation should be rerun immediately.'],
    humanDecision: 'Approve if schedule confidence and low logistics volatility matter most for this order.',
    signalChips: [
      { label: 'Low logistics risk', tone: 'good' },
      { label: 'Schedule protected', tone: 'good' },
      { label: 'Margin still on target', tone: 'good' },
      { label: 'Less optionality later', tone: 'warn' },
    ],
    trustSignalOverrides: {
      'Lead time': { value: '19-day fit', tone: 'good' },
      Margin: { value: '51.3%', tone: 'good' },
      'Logistics risk': { value: 'Low', tone: 'good' },
    },
  },
}
