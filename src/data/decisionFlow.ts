export type DecisionScenario = 'balanced' | 'margin' | 'schedule'

export const orderSummary = {
  orderId: 'RFQ-2026-0614',
  customer: 'Northstar Retail Fixtures',
  manufacturer: 'North Ridge Manufacturing',
  part: 'CNC Housing Rev B',
  quantity: 2500,
  destination: 'Atlanta, GA',
  requiredDeliveryDate: '2026-07-08',
  targetMarginPct: 50,
  material: '6061 aluminum',
  finish: 'Black anodize',
  packaging: 'Reseller-label-ready',
}

export const readinessDimensions = [
  {
    label: 'Material readiness',
    note: 'Usable stock is already allocated for this quote window.',
  },
  {
    label: 'Capacity readiness',
    note: 'The production slot can support the requested quantity without escalation.',
  },
  {
    label: 'Lead-time readiness',
    note: 'The current plan can meet or closely protect the requested delivery target.',
  },
  {
    label: 'Quality readiness',
    note: 'Known process controls and part-family history support a stable run.',
  },
  {
    label: 'Commercial readiness',
    note: 'Margin, assumptions, and exception posture are visible before quoting.',
  },
] as const

export const scenarioRecommendations: Record<DecisionScenario, {
  label: string
  badge: string
  posture: string
  headline: string
  quoteConfidencePct: number
  fulfillmentReadinessPct: number
  pricePerUnitUsd: number
  quoteTotalUsd: number
  leadTimeDays: number
  why: string[]
  businessImpact: string[]
  tradeoffs: string[]
  risks: string[]
  assumptions: string[]
  humanDecision: string
  signalChips: Array<{ label: string; tone: 'good' | 'warn' }>
  trustSignalOverrides?: Partial<Record<'Inventory' | 'Capacity' | 'Lead time' | 'Quality history' | 'Margin' | 'Commercial risk' | 'Fulfillment readiness', { value: string; tone: 'good' | 'warn' }>>
}> = {
  balanced: {
    label: 'Confidence-first recommendation',
    badge: 'High confidence',
    posture: 'Confidence-first quote posture',
    headline: 'Recommend quoting now: the order is production-ready, commercially sound, and supported by clear evidence.',
    quoteConfidencePct: 94,
    fulfillmentReadinessPct: 93,
    pricePerUnitUsd: 74.56,
    quoteTotalUsd: 186400,
    leadTimeDays: 18,
    why: ['Material allocation confirmed', 'Capacity slot available', 'Requested delivery target is supportable', 'Margin remains above target', 'Quality history is stable', 'Commercial assumptions are explicit'],
    businessImpact: ['Lets sales respond quickly without overstating certainty', 'Protects delivery credibility while staying above margin target', 'Reduces avoidable exception handling before send'],
    tradeoffs: ['Leaves less upside than a more aggressive price posture', 'Assumes the current slot is held in this quote cycle'],
    risks: ['If the customer delays approval, lead time should be revalidated before send.'],
    assumptions: ['Approved alternate finish path is allowed if capacity tightens.', 'No packaging changes beyond reseller-label-ready handling.'],
    humanDecision: 'Approve if the goal is a fast quote with strong production and commercial confidence.',
    signalChips: [
      { label: 'Quote confidence high', tone: 'good' },
      { label: 'Margin above target', tone: 'good' },
      { label: 'Fulfillment readiness strong', tone: 'good' },
      { label: 'Assumptions visible', tone: 'good' },
    ],
  },
  margin: {
    label: 'Margin-protect recommendation',
    badge: 'Tradeoff visible',
    posture: 'Margin-protect quote posture',
    headline: 'Quote with a stronger price buffer when margin protection matters more than maximizing close probability.',
    quoteConfidencePct: 88,
    fulfillmentReadinessPct: 90,
    pricePerUnitUsd: 76.18,
    quoteTotalUsd: 190450,
    leadTimeDays: 18,
    why: ['Keeps the same production plan intact', 'Builds more margin headroom into the quote', 'Still preserves a credible delivery commitment'],
    businessImpact: ['Improves gross margin protection', 'Keeps fulfillment posture stable', 'Gives sales a safer floor under input volatility'],
    tradeoffs: ['Higher price may reduce competitiveness', 'Commercial risk shifts from fulfillment to acceptance sensitivity'],
    risks: ['Customer price pushback is more likely if competitive pressure is high.'],
    assumptions: ['The account can tolerate a firmer commercial posture.', 'No special concession is required to win the order.'],
    humanDecision: 'Approve if protecting margin matters more than offering the most competitive price.',
    signalChips: [
      { label: 'Margin buffer stronger', tone: 'good' },
      { label: 'Acceptance sensitivity higher', tone: 'warn' },
      { label: 'Production plan unchanged', tone: 'good' },
      { label: 'Commercial tradeoff explicit', tone: 'warn' },
    ],
    trustSignalOverrides: {
      Margin: { value: '52.8%', tone: 'good' },
      'Commercial risk': { value: 'Moderate', tone: 'warn' },
    },
  },
  schedule: {
    label: 'Commitment-safe recommendation',
    badge: 'Fulfillment safe',
    posture: 'Commitment-safe quote posture',
    headline: 'Quote with a slightly more conservative promise date to preserve delivery confidence under volatility.',
    quoteConfidencePct: 92,
    fulfillmentReadinessPct: 96,
    pricePerUnitUsd: 75.22,
    quoteTotalUsd: 188050,
    leadTimeDays: 19,
    why: ['Adds schedule protection while staying commercially viable', 'Reduces fulfillment risk if upstream timing moves', 'Keeps assumptions and promise date aligned'],
    businessImpact: ['Improves promise reliability', 'Reduces late-stage firefighting', 'Supports a more defensible customer commitment'],
    tradeoffs: ['Slightly slower lead time than the confidence-first posture', 'May be less attractive if the customer is schedule-sensitive'],
    risks: ['The customer may challenge the extra day if the request is highly time-sensitive.'],
    assumptions: ['A one-day buffer is acceptable to the customer if explained upfront.', 'Production slot remains held through quote review.'],
    humanDecision: 'Approve if delivery credibility matters more than quoting the most aggressive timeline.',
    signalChips: [
      { label: 'Fulfillment readiness strongest', tone: 'good' },
      { label: 'Promise date more conservative', tone: 'warn' },
      { label: 'Quote confidence high', tone: 'good' },
      { label: 'Volatility-aware', tone: 'good' },
    ],
    trustSignalOverrides: {
      'Lead time': { value: '19-day protected fit', tone: 'good' },
      'Fulfillment readiness': { value: '96%', tone: 'good' },
    },
  },
}
