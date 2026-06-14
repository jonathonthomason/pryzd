import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowProgress } from '../components/WorkflowProgress'
import { manufacturers, orderSummary, scenarioRecommendations, type DecisionScenario } from '../data/decisionFlow'

type QuoteState = 'ready' | 'clarification' | 'alternate' | 'expired'

type QuoteConfig = {
  label: string
  badge: string
  title: string
  meta: string
  status: readonly [string, string, string]
  recommendation: string
  note: string
  primary: string
  canApprove: boolean
}

const states: Record<QuoteState, QuoteConfig> = {
  ready: {
    label: 'Ready to send',
    badge: 'Generated from recommendation',
    title: 'Customer quote',
    meta: 'Recommendation approved and converted into customer-facing output',
    status: ['Ready', 'Recommendation approved. Quote is ready to present.', 'good'],
    recommendation: 'Generated from the approved recommendation path',
    note: 'Pricing assumes the approved tolerance profile and committed production slot.',
    primary: 'Send quote',
    canApprove: true,
  },
  clarification: {
    label: 'Clarification requested',
    badge: 'Clarification open',
    title: 'Customer quote',
    meta: 'Customer asked for more context before approval',
    status: ['Clarification requested', 'Customer asked for more context before approval.', 'warn'],
    recommendation: 'Approved recommendation remains intact while clarification is answered',
    note: 'Clarification requested on pricing sensitivity and delivery assumptions.',
    primary: 'Respond with clarification',
    canApprove: false,
  },
  alternate: {
    label: 'Alternate quote option',
    badge: 'Alternate available',
    title: 'Alternate customer quote',
    meta: 'Generated from an alternate recommendation path',
    status: ['Alternate quote', 'Customer can review a lower-price option with different delivery tradeoffs.', 'warn'],
    recommendation: 'Generated from an alternate recommendation after comparison review',
    note: 'Primary recommendation remains available at higher confidence.',
    primary: 'Share alternate quote',
    canApprove: true,
  },
  expired: {
    label: 'Expired / refreshed',
    badge: 'Refresh required',
    title: 'Customer quote',
    meta: 'Quote validity expired',
    status: ['Expired', 'Quote validity window has passed. Refresh the recommendation before sending.', 'blocker'],
    recommendation: 'Previous recommendation should be rerun before the quote is reused',
    note: 'Lead time and price should be revalidated.',
    primary: 'Refresh recommendation',
    canApprove: false,
  },
}

export function CustomerQuotePage() {
  const [quoteState, setQuoteState] = useState<QuoteState>('ready')
  const [scenario, setScenario] = useState<DecisionScenario>('balanced')

  const quoteConfig = states[quoteState]
  const recommendation = scenarioRecommendations[scenario]
  const selected = manufacturers.find((item) => item.id === recommendation.recommendedManufacturerId) ?? manufacturers[0]
  const alternate = useMemo(() => manufacturers.find((item) => item.id !== selected.id) ?? manufacturers[1], [selected])

  const priceTotal = scenario === 'margin' ? 179200 : 186400
  const unitPrice = scenario === 'margin' ? 71.68 : scenario === 'logistics' ? 73.12 : 74.56
  const leadTimeDays = scenario === 'margin' ? 23 : scenario === 'logistics' ? 19 : 18

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Present</strong>
          <span className="badge badge-success">{quoteConfig.badge}</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <WorkflowProgress label="Present" />

        <h1>Customer quote</h1>
        <div className="intro">Customer-facing output generated from the approved recommendation.</div>

        <div className="state-toolbar">
          <span className="toolbar-label">Quote state</span>
          {(Object.entries(states) as [QuoteState, QuoteConfig][]).map(([name, config]) => (
            <button
              key={name}
              className={`state-chip${quoteState === name ? ' active' : ''}`}
              onClick={() => setQuoteState(name)}
              type="button"
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="state-toolbar">
          <span className="toolbar-label">Source recommendation</span>
          {(Object.entries(scenarioRecommendations) as [DecisionScenario, typeof recommendation][]).map(([name, config]) => (
            <button
              key={name}
              className={`state-chip${scenario === name ? ' active' : ''}`}
              onClick={() => setScenario(name)}
              type="button"
            >
              {config.label}
            </button>
          ))}
        </div>

        <section className="panel">
          <div className="panel-header"><div className="panel-title">{quoteConfig.title}</div></div>
          <div className="panel-body">
            <div className="quote-head">
              <div>
                <h2 className="quote-title">{orderSummary.part}</h2>
                <div className="sub">{selected.name} · {orderSummary.quantity.toLocaleString()} units · Valid 14 days</div>
                <div className="sub">{quoteConfig.meta}</div>
              </div>
              <div>
                <div className="quote-price">${priceTotal.toLocaleString()}</div>
                <div className="sub">Unit price: ${unitPrice.toFixed(2)} · Lead time: {leadTimeDays} days</div>
              </div>
            </div>

            <div className={`status-box ${quoteConfig.status[2]}`}>
              <strong>{quoteConfig.status[0]}</strong>
              {quoteConfig.status[1]}
            </div>

            <div className="grid quote-grid">
              <div className="card"><span className="k">Scope</span><span>{orderSummary.material} · {orderSummary.finish} · {orderSummary.packaging}</span></div>
              <div className="card"><span className="k">Recommended path</span><span>{quoteConfig.recommendation}: {selected.name}</span></div>
              <div className="card"><span className="k">Commercial note</span><span>{quoteConfig.note}</span></div>
              <div className="card"><span className="k">Alternate</span><span>{alternate.name} remains available with {alternate.marginPct}% margin and {alternate.leadTimeDays}-day lead time.</span></div>
            </div>

            <div className="actions">
              <a className="btn primary" href="#" style={{ pointerEvents: quoteConfig.canApprove ? 'auto' : 'none', opacity: quoteConfig.canApprove ? '1' : '.45' }}>{quoteConfig.primary}</a>
              <Link className="btn secondary" to="/recommendation-workspace">Back to recommendation</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
