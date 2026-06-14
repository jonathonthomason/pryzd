import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowProgress } from '../components/WorkflowProgress'
import { manufacturers, orderSummary, scenarioRecommendations, type DecisionScenario } from '../data/decisionFlow'

type DecisionFactor = {
  label: string
  score: number
}

type RationaleBar = {
  label: string
  score: number
  tone: 'good' | 'warn'
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
      { label: 'Delivery Reliability', score: 8.1 },
      { label: 'Margin Achievement', score: 9.4 },
      { label: 'Inventory Confidence', score: 8.9 },
      { label: 'Capacity Confidence', score: 8.2 },
      { label: 'Quality Stability', score: 8.4 },
      { label: 'Commercial Risk', score: 7.9 },
    ]
  }

  if (view === 'logistics') {
    return [
      { label: 'Delivery Reliability', score: 9.5 },
      { label: 'Margin Achievement', score: 8.5 },
      { label: 'Inventory Confidence', score: 9.6 },
      { label: 'Capacity Confidence', score: 9.0 },
      { label: 'Quality Stability', score: 9.4 },
      { label: 'Commercial Risk', score: 9.1 },
    ]
  }

  return [
    { label: 'Delivery Reliability', score: 9.4 },
    { label: 'Margin Achievement', score: 8.8 },
    { label: 'Inventory Confidence', score: 9.7 },
    { label: 'Capacity Confidence', score: 9.1 },
    { label: 'Quality Stability', score: 9.5 },
    { label: 'Commercial Risk', score: 8.9 },
  ]
}

function getRationaleBars(view: DecisionScenario): RationaleBar[] {
  if (view === 'margin') {
    return [
      { label: 'Delivery Confidence', score: 8, tone: 'warn' },
      { label: 'Margin Performance', score: 9, tone: 'good' },
      { label: 'Risk Exposure', score: 4, tone: 'warn' },
    ]
  }

  if (view === 'logistics') {
    return [
      { label: 'Delivery Confidence', score: 10, tone: 'good' },
      { label: 'Margin Performance', score: 8, tone: 'good' },
      { label: 'Risk Exposure', score: 2, tone: 'good' },
    ]
  }

  return [
    { label: 'Delivery Confidence', score: 9, tone: 'good' },
    { label: 'Margin Performance', score: 8, tone: 'good' },
    { label: 'Risk Exposure', score: 2, tone: 'good' },
  ]
}

function compareLabel(selectedValue: string | number, altValue: string | number, preferHigher = true) {
  if (typeof selectedValue === 'number' && typeof altValue === 'number') {
    const diff = preferHigher ? selectedValue - altValue : altValue - selectedValue
    if (Math.abs(diff) < 0.2) return 'Near parity'
    return diff > 0 ? 'North Ridge leads' : 'Alternative leads'
  }

  return selectedValue === altValue ? 'Comparable' : 'North Ridge stronger'
}

export function RecommendationWorkspacePage() {
  const [view, setView] = useState<DecisionScenario>('balanced')

  const recommendation = scenarioRecommendations[view]
  const selected = manufacturers.find((item) => item.id === recommendation.recommendedManufacturerId) ?? manufacturers[0]
  const alternatives = manufacturers.filter((item) => item.id !== selected.id)
  const decisionFactors = useMemo(() => getDecisionFactors(view), [view])
  const rationaleBars = useMemo(() => getRationaleBars(view), [view])

  const trustSignals = useMemo<TrustSignal[]>(() => {
    const signalTooltips: Record<string, string> = {
      Inventory: 'Scores usable on-hand or reserved material higher, with penalties for replenishment timing uncertainty.',
      Capacity: 'Scores available production headroom higher based on fit within the required manufacturing window.',
      'Lead time': 'Scores against the requested delivery target, with shorter and more reliable paths receiving higher marks.',
      'Quality history': 'Scores historical quality consistency and repeatability higher when defect and escalation risk are lower.',
      Margin: 'Scores margin performance against the target threshold, with stronger buffer above target increasing the score.',
      'Commercial risk': 'Scores lower exposure higher by weighing pricing stability, commitment confidence, and exception risk.',
      'Logistics risk': 'Scores lower shipping and transit volatility higher, with stable lanes and fewer handoff risks favored.',
    }

    const base = [
      { label: 'Inventory', value: selected.inventory, tone: selected.inventory === 'Confirmed' ? 'good' as const : 'warn' as const, tooltip: signalTooltips.Inventory },
      { label: 'Capacity', value: selected.capacity, tone: selected.capacity === 'Available' ? 'good' as const : 'warn' as const, tooltip: signalTooltips.Capacity },
      { label: 'Lead time', value: `${selected.leadTimeDays}-day fit`, tone: selected.leadTimeDays <= 19 ? 'good' as const : 'warn' as const, tooltip: signalTooltips['Lead time'] },
      { label: 'Quality history', value: selected.quality, tone: selected.quality === 'Strong' ? 'good' as const : 'warn' as const, tooltip: signalTooltips['Quality history'] },
      { label: 'Margin', value: `${selected.marginPct}%`, tone: selected.marginPct >= orderSummary.targetMarginPct ? 'good' as const : 'warn' as const, tooltip: signalTooltips.Margin },
      { label: 'Commercial risk', value: selected.commercialRisk, tone: selected.commercialRisk.toLowerCase() === 'low' ? 'good' as const : 'warn' as const, tooltip: signalTooltips['Commercial risk'] },
      { label: 'Logistics risk', value: selected.logisticsRisk, tone: ['contained', 'low'].includes(selected.logisticsRisk.toLowerCase()) ? 'good' as const : 'warn' as const, tooltip: signalTooltips['Logistics risk'] },
    ]

    return base.map((item) => {
      const override = recommendation.trustSignalOverrides?.[item.label as keyof typeof recommendation.trustSignalOverrides]
      return override ? { ...item, ...override } : item
    })
  }, [recommendation, selected])

  const isLowRisk = selected.risk.toLowerCase() === 'low'
  const recommendationSignal: readonly [string, string, string] = ['Recommended path', `${selected.name} selected`, isLowRisk ? 'good' : 'warn']
  const decisionSignal: readonly [string, string, string] = ['Human decision', recommendation.humanDecision, isLowRisk ? 'good' : 'warn']

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Recommendation Workspace</strong>
          <span className="badge">{recommendation.badge}</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <WorkflowProgress label="Recommendation Workspace" />

        <h1>Decision Workspace</h1>
        <div className="intro">Understand why the leading manufacturer won, where the recommendation is strongest, and how the alternatives fall short against the same commercial criteria.</div>

        <div className="state-toolbar">
          <span className="toolbar-label">Decision posture</span>
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
            <div className="panel-header"><div className="panel-title">Why {selected.name} won</div></div>
            <div className="panel-body recommendation-panel-body">
              <div className="workspace-stats recommendation-snapshot-card">
                <div className="recommendation-snapshot-metric recommendation-snapshot-primary">
                  <span className="k">Recommended manufacturer</span>
                  <div className="v workspace-path">{selected.name}</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Confidence score</span>
                  <div className="v">{selected.confidencePct}%</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Lead</span>
                  <div className="v">{selected.leadTimeDays} days</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Margin</span>
                  <div className="v">{selected.marginPct}%</div>
                </div>
                <div className="recommendation-snapshot-metric">
                  <span className="k">Risk</span>
                  <div className="v">{selected.risk}</div>
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
                  <h3>Why recommended</h3>
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
                  <h3>Tradeoffs</h3>
                  <ul>
                    {recommendation.tradeoffs.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="workspace-section">
                  <h3>Risks</h3>
                  <ul>
                    {recommendation.risks.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="recommendation-comparison-card">
                <div className="confirm-section-title">Side-by-side alternatives</div>
                <div className="winner-callout">
                  <strong>Why {selected.name} won</strong>
                  <span>It offers the best combined delivery reliability, inventory certainty, capacity confidence, and commercial stability for this order.</span>
                </div>
                <div className="comparison-grid">
                  <div className="comparison-column winner">
                    <div className="comparison-column-head">
                      <strong>{selected.name}</strong>
                      <span>{selected.region}</span>
                    </div>
                    <div className="comparison-row"><span>Delivery</span><strong>{selected.leadTimeDays} days</strong></div>
                    <div className="comparison-row"><span>Margin</span><strong>{selected.marginPct}%</strong></div>
                    <div className="comparison-row"><span>Inventory</span><strong>{selected.inventory}</strong></div>
                    <div className="comparison-row"><span>Capacity</span><strong>{selected.capacity}</strong></div>
                    <div className="comparison-row"><span>Quality</span><strong>{selected.quality}</strong></div>
                    <div className="comparison-row"><span>Commercial risk</span><strong>{selected.commercialRisk}</strong></div>
                  </div>

                  {alternatives.map((alt) => (
                    <div key={alt.id} className="comparison-column">
                      <div className="comparison-column-head">
                        <strong>{alt.name}</strong>
                        <span>{alt.region}</span>
                      </div>
                      <div className="comparison-row"><span>Delivery</span><strong>{alt.leadTimeDays} days</strong><em>{compareLabel(selected.leadTimeDays, alt.leadTimeDays, false)}</em></div>
                      <div className="comparison-row"><span>Margin</span><strong>{alt.marginPct}%</strong><em>{compareLabel(selected.marginPct, alt.marginPct, true)}</em></div>
                      <div className="comparison-row"><span>Inventory</span><strong>{alt.inventory}</strong><em>{selected.inventory === 'Confirmed' && alt.inventory !== 'Confirmed' ? 'North Ridge stronger' : 'Comparable'}</em></div>
                      <div className="comparison-row"><span>Capacity</span><strong>{alt.capacity}</strong><em>{selected.capacity === 'Available' && alt.capacity !== 'Available' ? 'North Ridge stronger' : 'Comparable'}</em></div>
                      <div className="comparison-row"><span>Quality</span><strong>{alt.quality}</strong><em>{selected.quality === 'Strong' && alt.quality !== 'Strong' ? 'North Ridge stronger' : 'Comparable'}</em></div>
                      <div className="comparison-row"><span>Commercial risk</span><strong>{alt.commercialRisk}</strong><em>{selected.commercialRisk === 'Low' && alt.commercialRisk !== 'Low' ? 'North Ridge safer' : 'Comparable'}</em></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="decision-box recommendation-decision-box">
                <strong>Human decision</strong>
                <div className="decision-copy">{recommendation.humanDecision}</div>
                <div className="decision-actions">
                  <button className="btn primary" type="button">Approve recommendation</button>
                  <button className="btn secondary" type="button">Revise assumptions</button>
                  <button className="btn secondary" type="button">Compare alternatives</button>
                </div>
              </div>

              <div className="actions">
                <Link className="btn primary" to="/customer-quote">Generate customer quote</Link>
                <Link className="btn secondary" to="/manufacturer-evaluation">Back to evaluation</Link>
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
                  {orderSummary.customer} · {orderSummary.quantity.toLocaleString()} units · target margin {orderSummary.targetMarginPct}%+
                </div>
                <details className="trace">
                  <summary>System details</summary>
                  <div className="trace-copy">Requirements confirmed → manufacturers evaluated → evidence ranked → recommendation prepared for human approval.</div>
                </details>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
