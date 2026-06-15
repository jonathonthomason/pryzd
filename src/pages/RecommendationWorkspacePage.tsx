import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowProgress } from '../components/WorkflowProgress'
import { orderSummary, scenarioRecommendations, type DecisionScenario } from '../data/decisionFlow'

type DecisionFactor = {
  label: string
  score: number
}

type RationaleBar = {
  label: string
  score: number
}

type TrustSignal = {
  label: string
  value: string
  tone: 'good' | 'warn'
  tooltip: string
}

function SignalCard({ data }: { data: readonly [string, string, string] }) {
  return (
    <div className={`state ${data[2]}`}>
      <strong>{data[0]}</strong>
      {data[1]}
    </div>
  )
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="info-tooltip">
      <button className="info-tooltip-trigger" type="button" aria-label={text}>
        i
      </button>
      <span className="info-tooltip-bubble" role="tooltip">{text}</span>
    </span>
  )
}

function scoreBar(score: number) {
  const filled = Math.max(0, Math.min(10, Math.round(score)))
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`
}

function getDecisionFactors(view: DecisionScenario): DecisionFactor[] {
  if (view === 'margin') {
    return [
      { label: 'Quote Confidence', score: 8.8 },
      { label: 'Margin Protection', score: 9.5 },
      { label: 'Fulfillment Readiness', score: 9.0 },
      { label: 'Commercial Competitiveness', score: 7.4 },
      { label: 'Volatility Awareness', score: 8.7 },
      { label: 'Decision Transparency', score: 9.1 },
    ]
  }

  if (view === 'schedule') {
    return [
      { label: 'Quote Confidence', score: 9.2 },
      { label: 'Margin Protection', score: 8.7 },
      { label: 'Fulfillment Readiness', score: 9.7 },
      { label: 'Commercial Competitiveness', score: 8.0 },
      { label: 'Volatility Awareness', score: 9.6 },
      { label: 'Decision Transparency', score: 9.2 },
    ]
  }

  return [
    { label: 'Quote Confidence', score: 9.4 },
    { label: 'Margin Protection', score: 8.9 },
    { label: 'Fulfillment Readiness', score: 9.3 },
    { label: 'Commercial Competitiveness', score: 8.5 },
    { label: 'Volatility Awareness', score: 9.0 },
    { label: 'Decision Transparency', score: 9.4 },
  ]
}

function getRationaleBars(view: DecisionScenario): RationaleBar[] {
  if (view === 'margin') {
    return [
      { label: 'Quote confidence', score: 9 },
      { label: 'Margin protection', score: 10 },
      { label: 'Customer competitiveness', score: 7 },
    ]
  }

  if (view === 'schedule') {
    return [
      { label: 'Quote confidence', score: 9 },
      { label: 'Fulfillment readiness', score: 10 },
      { label: 'Promise aggressiveness', score: 7 },
    ]
  }

  return [
    { label: 'Quote confidence', score: 9 },
    { label: 'Fulfillment readiness', score: 9 },
    { label: 'Commercial balance', score: 8 },
  ]
}

function compareLabel(selectedValue: number, altValue: number, higherIsBetter = true) {
  const diff = higherIsBetter ? selectedValue - altValue : altValue - selectedValue
  if (Math.abs(diff) < 0.2) return 'Near parity'
  return diff > 0 ? 'Recommended posture leads' : 'Alternate posture leads'
}

export function RecommendationWorkspacePage() {
  const [view, setView] = useState<DecisionScenario>('balanced')

  const recommendation = scenarioRecommendations[view]
  const alternatives = (Object.entries(scenarioRecommendations) as [DecisionScenario, typeof recommendation][]).filter(([name]) => name !== view)
  const decisionFactors = useMemo(() => getDecisionFactors(view), [view])
  const rationaleBars = useMemo(() => getRationaleBars(view), [view])

  const trustSignals = useMemo<TrustSignal[]>(() => {
    const signalTooltips: Record<string, string> = {
      Inventory: 'Shows whether material allocation is already in place for this quote window.',
      Capacity: 'Shows whether the current production slot can support the order without escalation.',
      'Lead time': 'Shows how well the current quote posture matches the requested commitment date.',
      'Quality history': 'Shows whether this part family has stable process history and low exception risk.',
      Margin: 'Shows margin performance relative to the target threshold.',
      'Commercial risk': 'Shows exposure to acceptance, exception, or repricing risk.',
      'Fulfillment readiness': 'Shows how ready the manufacturer is to fulfill this quote as presented.',
    }

    const base = [
      { label: 'Inventory', value: 'Allocated', tone: 'good' as const, tooltip: signalTooltips.Inventory },
      { label: 'Capacity', value: 'Slot available', tone: 'good' as const, tooltip: signalTooltips.Capacity },
      { label: 'Lead time', value: `${recommendation.leadTimeDays}-day fit`, tone: recommendation.leadTimeDays <= 19 ? 'good' as const : 'warn' as const, tooltip: signalTooltips['Lead time'] },
      { label: 'Quality history', value: 'Stable', tone: 'good' as const, tooltip: signalTooltips['Quality history'] },
      { label: 'Margin', value: view === 'margin' ? '52.8%' : view === 'schedule' ? '51.1%' : '51.4%', tone: 'good' as const, tooltip: signalTooltips.Margin },
      { label: 'Commercial risk', value: view === 'margin' ? 'Moderate' : 'Low', tone: view === 'margin' ? 'warn' as const : 'good' as const, tooltip: signalTooltips['Commercial risk'] },
      { label: 'Fulfillment readiness', value: `${recommendation.fulfillmentReadinessPct}%`, tone: recommendation.fulfillmentReadinessPct >= 92 ? 'good' as const : 'warn' as const, tooltip: signalTooltips['Fulfillment readiness'] },
    ]

    return base.map((item) => {
      const override = recommendation.trustSignalOverrides?.[item.label as keyof typeof recommendation.trustSignalOverrides]
      return override ? { ...item, ...override } : item
    })
  }, [recommendation, view])

  const recommendationSignal: readonly [string, string, string] = ['Recommended posture', recommendation.posture, recommendation.quoteConfidencePct >= 90 ? 'good' : 'warn']
  const decisionSignal: readonly [string, string, string] = ['Human decision', recommendation.humanDecision, recommendation.quoteConfidencePct >= 90 ? 'good' : 'warn']

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Quote Recommendation</strong>
          <span className="badge">{recommendation.badge}</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <WorkflowProgress label="5–7. Commercial Analysis + Recommendation + Review" />

        <h1>Commercial analysis + quote recommendation</h1>
        <div className="intro">Turn production readiness into a quote recommendation with findings, evidence, confidence, assumptions, risks, and a clear human approval step.</div>

        <div className="state-toolbar">
          <span className="toolbar-label">Quote posture</span>
          {(Object.entries(scenarioRecommendations) as [DecisionScenario, typeof recommendation][]).map(([name, config]) => (
            <button
              key={name}
              className={`state-chip${view === name ? ' active' : ''}`}
              onClick={() => setView(name)}
              type="button"
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="layout workspace-layout recommendation-layout">
          <section className="panel">
            <div className="panel-header"><div className="panel-title">Why this quote posture is recommended</div></div>
            <div className="panel-body recommendation-panel-body">
              <div className="workspace-stats recommendation-snapshot-card">
                <div className="recommendation-snapshot-metric recommendation-snapshot-primary">
                  <span className="k">Recommended posture</span>
                  <div className="v workspace-path">{recommendation.posture}</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Quote confidence</span>
                  <div className="v">{recommendation.quoteConfidencePct}%</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Fulfillment readiness</span>
                  <div className="v">{recommendation.fulfillmentReadinessPct}%</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Lead</span>
                  <div className="v">{recommendation.leadTimeDays} days</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Price</span>
                  <div className="v">${recommendation.pricePerUnitUsd.toFixed(2)}</div>
                </div>
              </div>

              <div className="recommendation-hero-grid">
                <div className="recommendation-hero-card">
                  <div className="confirm-section-title">Recommendation rationale</div>
                  <div className="recommendation-headline">{recommendation.headline}</div>
                  <div className="recommendation-rationale-bars">
                    {rationaleBars.map((item) => (
                      <div key={item.label} className="rationale-bar-row">
                        <div className="rationale-bar-head">
                          <span>{item.label}</span>
                          <strong>{scoreBar(item.score)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recommendation-hero-card">
                  <div className="confirm-section-title">Decision factors</div>
                  <div className="decision-factor-list">
                    {decisionFactors.map((factor) => (
                      <div key={factor.label} className="decision-factor-row">
                        <span>{factor.label}</span>
                        <strong>{factor.score.toFixed(1)} / 10</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="workspace-section-grid recommendation-section-grid">
                <div className="workspace-section">
                  <h3>Findings</h3>
                  <ul>
                    {recommendation.why.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="workspace-section">
                  <h3>Business impact</h3>
                  <ul>
                    {recommendation.businessImpact.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="workspace-section">
                  <h3>Assumptions</h3>
                  <ul>
                    {recommendation.assumptions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="workspace-section">
                  <h3>Risks + tradeoffs</h3>
                  <ul>
                    {[...recommendation.tradeoffs, ...recommendation.risks].map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="recommendation-comparison-card">
                <div className="confirm-section-title">Alternate quote postures</div>
                <div className="winner-callout">
                  <strong>Why this posture won</strong>
                  <span>It best balances quote confidence, fulfillment readiness, and commercial support for this exact order.</span>
                </div>
                <div className="comparison-grid">
                  <div className="comparison-column winner">
                    <div className="comparison-column-head">
                      <strong>{recommendation.posture}</strong>
                      <span>{recommendation.badge}</span>
                    </div>
                    <div className="comparison-row"><span>Lead</span><strong>{recommendation.leadTimeDays} days</strong></div>
                    <div className="comparison-row"><span>Unit price</span><strong>${recommendation.pricePerUnitUsd.toFixed(2)}</strong></div>
                    <div className="comparison-row"><span>Quote confidence</span><strong>{recommendation.quoteConfidencePct}%</strong></div>
                    <div className="comparison-row"><span>Fulfillment readiness</span><strong>{recommendation.fulfillmentReadinessPct}%</strong></div>
                    <div className="comparison-row"><span>Commercial posture</span><strong>{view === 'margin' ? 'Margin-forward' : view === 'schedule' ? 'Volatility-aware' : 'Balanced'}</strong></div>
                    <div className="comparison-row"><span>Risk</span><strong>{view === 'margin' ? 'Acceptance sensitivity' : view === 'schedule' ? 'Longer promise' : 'Low'}</strong></div>
                  </div>

                  {alternatives.map(([name, alt]) => (
                    <div key={name} className="comparison-column">
                      <div className="comparison-column-head">
                        <strong>{alt.posture}</strong>
                        <span>{alt.badge}</span>
                      </div>
                      <div className="comparison-row"><span>Lead</span><strong>{alt.leadTimeDays} days</strong><em>{compareLabel(recommendation.leadTimeDays, alt.leadTimeDays, false)}</em></div>
                      <div className="comparison-row"><span>Unit price</span><strong>${alt.pricePerUnitUsd.toFixed(2)}</strong><em>{compareLabel(recommendation.pricePerUnitUsd, alt.pricePerUnitUsd, false)}</em></div>
                      <div className="comparison-row"><span>Quote confidence</span><strong>{alt.quoteConfidencePct}%</strong><em>{compareLabel(recommendation.quoteConfidencePct, alt.quoteConfidencePct, true)}</em></div>
                      <div className="comparison-row"><span>Fulfillment readiness</span><strong>{alt.fulfillmentReadinessPct}%</strong><em>{compareLabel(recommendation.fulfillmentReadinessPct, alt.fulfillmentReadinessPct, true)}</em></div>
                      <div className="comparison-row"><span>Commercial posture</span><strong>{name === 'margin' ? 'Margin-forward' : name === 'schedule' ? 'Volatility-aware' : 'Balanced'}</strong></div>
                      <div className="comparison-row"><span>Tradeoff</span><strong>{alt.tradeoffs[0]}</strong></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="decision-box recommendation-decision-box">
                <strong>Human review</strong>
                <div className="decision-copy">{recommendation.humanDecision}</div>
                <div className="decision-actions">
                  <button className="btn primary" type="button">Approve recommendation</button>
                  <button className="btn secondary" type="button">Revise assumptions</button>
                  <button className="btn secondary" type="button">Reframe quote posture</button>
                </div>
              </div>

              <div className="actions">
                <Link className="btn primary" to="/quote-delivery">Generate customer quote</Link>
                <Link className="btn secondary" to="/production-readiness-analysis">Back to readiness analysis</Link>
              </div>
            </div>
          </section>

          <aside className="panel">
            <div className="panel-header"><div className="panel-title">Trust signals</div></div>
            <div className="panel-body">
              <div className="signal-chip-grid">
                {trustSignals.map((signal) => (
                  <div key={signal.label} className={`signal-chip ${signal.tone}`}>
                    <div className="signal-chip-head">
                      <span>{signal.label}</span>
                      <InfoTooltip text={signal.tooltip} />
                    </div>
                    <strong>{signal.value}</strong>
                  </div>
                ))}
              </div>

              <div className="signal-callout-chips">
                {recommendation.signalChips.map((chip) => (
                  <span key={chip.label} className={`signal-callout-chip ${chip.tone}`}>{chip.label}</span>
                ))}
              </div>

              <div className="list workspace-signal-list">
                <SignalCard data={recommendationSignal} />
                <SignalCard data={decisionSignal} />
                <div className="state good">
                  <strong>Order context</strong>
                  {orderSummary.customer} · {orderSummary.manufacturer} · {orderSummary.quantity.toLocaleString()} units · target margin {orderSummary.targetMarginPct}%+
                </div>
                <details className="trace">
                  <summary>System details</summary>
                  <div className="trace-copy">Requirements confirmed → production readiness analyzed → commercial tradeoffs scored → recommendation prepared for human approval.</div>
                </details>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
