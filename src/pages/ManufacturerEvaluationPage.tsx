import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowProgress } from '../components/WorkflowProgress'
import { orderSummary, readinessDimensions, scenarioRecommendations, type DecisionScenario } from '../data/decisionFlow'

type AnalysisStage = {
  label: string
  note: string
  input: string[]
  analysis: string
  outcome: string
}

const analysisStages: AnalysisStage[] = [
  {
    label: 'Production package aligned',
    note: 'Requirements, assumptions, and evidence are packaged into one manufacturer-specific view.',
    input: ['Confirmed material + finish strategy', 'Required quantity', 'Requested delivery target', 'Approved assumptions'],
    analysis: 'The RFQ is normalized so the manufacturer is not reinterpreting scattered notes, files, and exceptions during quoting.',
    outcome: 'The order is ready for production-readiness checks.',
  },
  {
    label: 'Material readiness checked',
    note: 'Material allocation and replenishment exposure are reviewed for this order window.',
    input: ['Material requirement', 'Current allocation status', 'Replenishment risk'],
    analysis: 'Usable stock is already allocated for this quote window, which removes the biggest near-term fulfillment unknown.',
    outcome: 'Material readiness is strong.',
  },
  {
    label: 'Capacity readiness checked',
    note: 'The requested quantity is tested against current slot availability and line headroom.',
    input: ['Required quantity', 'Current slot plan', 'Line utilization'],
    analysis: 'The line can absorb this volume without pushing another committed order out of sequence.',
    outcome: 'Capacity supports quoting now.',
  },
  {
    label: 'Lead-time readiness checked',
    note: 'Internal production timing and promise risk are combined into one fulfillment view.',
    input: ['Requested delivery date', 'Current slot plan', 'Transit posture'],
    analysis: 'The current plan can support an 18-day quote, with an optional 19-day protected posture if the team wants more schedule buffer.',
    outcome: 'The requested commitment is supportable.',
  },
  {
    label: 'Commercial readiness checked',
    note: 'Margin, assumptions, and volatility exposure are reviewed before recommendation.',
    input: ['Target margin', 'Approved assumptions', 'Price sensitivity', 'Volatility posture'],
    analysis: 'The order is production-ready, the margin target is achievable, and the remaining decision is how aggressively to quote.',
    outcome: 'The workspace can recommend a quote posture with evidence and risk visible.',
  },
]

function StageRow({ stage, index, activeIndex }: { stage: AnalysisStage; index: number; activeIndex: number }) {
  const status = index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'pending'

  return (
    <div className={`evaluation-step ${status}`}>
      <span className="evaluation-step-icon">{status === 'complete' ? '✓' : status === 'active' ? '…' : index + 1}</span>
      <div>
        <strong>{stage.label}</strong>
        <div className="sub evaluation-step-note">{stage.note}</div>
      </div>
    </div>
  )
}

function StageWorkspace({ stage, active }: { stage: AnalysisStage; active: boolean }) {
  return (
    <div className={`analysis-stage-card${active ? ' active' : ''}`}>
      <div className="analysis-stage-head">
        <div>
          <strong>{stage.label}</strong>
          <div className="sub">{stage.note}</div>
        </div>
        <span className={`analysis-stage-status${active ? ' active' : ''}`}>{active ? 'Active analysis' : 'Completed'}</span>
      </div>

      <div className="analysis-stage-grid">
        <div className="analysis-block">
          <span className="analysis-block-label">Input</span>
          <ul>
            {stage.input.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="analysis-block">
          <span className="analysis-block-label">Analysis</span>
          <p>{stage.analysis}</p>
        </div>

        <div className="analysis-block">
          <span className="analysis-block-label">Outcome</span>
          <p>{stage.outcome}</p>
        </div>
      </div>
    </div>
  )
}

function SidepanelSkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="evaluation-skeleton-card" aria-hidden="true">
      <div className="evaluation-skeleton-line title"></div>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={`evaluation-skeleton-line${index === lines - 1 ? ' short' : ''}`}></div>
      ))}
    </div>
  )
}

export function ManufacturerEvaluationPage() {
  const [scenario, setScenario] = useState<DecisionScenario>('balanced')
  const [activeIndex, setActiveIndex] = useState(0)
  const [showScoringBreakdown, setShowScoringBreakdown] = useState(false)

  const recommendation = scenarioRecommendations[scenario]
  const progress = useMemo(() => Math.min(100, Math.round(((activeIndex + 1) / analysisStages.length) * 100)), [activeIndex])
  const complete = activeIndex >= analysisStages.length - 1
  const visibleStages = analysisStages.slice(0, activeIndex + 1)

  useEffect(() => {
    setActiveIndex(0)
    setShowScoringBreakdown(false)
  }, [scenario])

  useEffect(() => {
    if (complete) return
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => Math.min(current + 1, analysisStages.length - 1))
    }, 550)
    return () => window.clearTimeout(timer)
  }, [activeIndex, complete])

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Production Readiness Analysis</strong>
          <span className="badge">Transparent reasoning</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <WorkflowProgress label="4. Production Readiness Analysis" />

        <h1>Analyze production readiness</h1>
        <div className="intro">Assess whether this single manufacturer can confidently produce, fulfill, and support the quote before commercial recommendations are made.</div>

        <div className="state-toolbar">
          <span className="toolbar-label">Quote posture</span>
          {(Object.entries(scenarioRecommendations) as [DecisionScenario, typeof recommendation][]).map(([name, item]) => (
            <button
              key={name}
              className={`state-chip${scenario === name ? ' active' : ''}`}
              onClick={() => setScenario(name)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="evaluation-overlay panel">
          <div className="panel-header evaluation-header">
            <div>
              <div className="panel-title">{recommendation.posture}</div>
              <div className="sub">{orderSummary.customer} · {orderSummary.part} · {orderSummary.quantity.toLocaleString()} units · {orderSummary.manufacturer}</div>
            </div>
            <div className="evaluation-meta">
              <strong>{progress}% complete</strong>
              <span>{complete ? 'Readiness analysis complete' : 'Analysis in progress'}</span>
            </div>
          </div>

          <div className="panel-body evaluation-body">
            <div className="evaluation-progress-rail">
              <div className="evaluation-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="evaluation-layout evaluation-workspace-layout">
              <section className="evaluation-stage-column">
                <div className="evaluation-stage-list">
                  {analysisStages.map((stage, index) => (
                    <StageRow key={stage.label} stage={stage} index={index} activeIndex={activeIndex} />
                  ))}
                </div>

                <div className="evaluation-scorecard-card">
                  <div className="confirm-section-title">Readiness scorecard</div>
                  <div className="scorecard-table-wrap">
                    <table className="scorecard-table">
                      <thead>
                        <tr>
                          <th>Readiness dimension</th>
                          <th>Status</th>
                          <th>Evidence</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readinessDimensions.map((dimension) => (
                          <tr key={dimension.label}>
                            <td>
                              <strong>{dimension.label}</strong>
                              <div className="scorecard-sub">{dimension.note}</div>
                            </td>
                            <td>{dimension.label === 'Commercial readiness' ? recommendation.badge : 'Ready'}</td>
                            <td>{dimension.label === 'Lead-time readiness' ? `${recommendation.leadTimeDays}-day quote plan` : 'Source + operator-confirmed'}</td>
                            <td>{dimension.label === 'Commercial readiness' ? `${recommendation.quoteConfidencePct}%` : `${Math.max(88, recommendation.fulfillmentReadinessPct - 2)}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="scorecard-breakdown">
                    <button
                      className="scorecard-breakdown-toggle"
                      type="button"
                      onClick={() => setShowScoringBreakdown((current) => !current)}
                      aria-expanded={showScoringBreakdown}
                    >
                      <span>View analysis breakdown</span>
                      <span className={`scorecard-breakdown-chevron${showScoringBreakdown ? ' open' : ''}`}>⌄</span>
                    </button>

                    {showScoringBreakdown ? (
                      <div className="scorecard-breakdown-body">
                        <div className="confirm-section-title">Analysis breakdown</div>
                        <div className="analysis-stage-stack">
                          {visibleStages.map((stage, index) => (
                            <StageWorkspace
                              key={stage.label}
                              stage={stage}
                              active={index === visibleStages.length - 1 && !complete}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <aside className="evaluation-sidepanel">
                {complete ? (
                  <>
                    <div className="status-box good">
                      <strong>Order under analysis</strong>
                      {orderSummary.material} · {orderSummary.finish} · deliver to {orderSummary.destination} by {orderSummary.requiredDeliveryDate}
                    </div>

                    <div className="status-box good">
                      <strong>Production readiness result</strong>
                      {recommendation.headline}
                    </div>

                    <div className="evidence-stack">
                      <div className="state good">
                        <strong>Manufacturer in scope</strong>
                        {orderSummary.manufacturer} only — no vendor selection or routing is exposed in the product story.
                      </div>
                      <div className="state good">
                        <strong>Fulfillment readiness</strong>
                        {recommendation.fulfillmentReadinessPct}% · slot, material, and timing support the quote posture.
                      </div>
                      <div className={`state ${recommendation.quoteConfidencePct >= 90 ? 'good' : 'warn'}`}>
                        <strong>Quote confidence</strong>
                        {recommendation.quoteConfidencePct}% · assumptions and volatility tradeoffs are visible before recommendation.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <SidepanelSkeletonCard lines={2} />
                    <SidepanelSkeletonCard lines={3} />
                    <div className="evidence-stack">
                      <SidepanelSkeletonCard lines={2} />
                      <SidepanelSkeletonCard lines={2} />
                      <SidepanelSkeletonCard lines={3} />
                    </div>
                  </>
                )}

                <div className="actions evaluation-sticky-cta">
                  <Link className="btn primary" style={{ pointerEvents: complete ? 'auto' : 'none', opacity: complete ? '1' : '.45' }} to="/quote-recommendation">Open quote recommendation</Link>
                  <button className="btn secondary" type="button" onClick={() => setActiveIndex(0)}>Re-run analysis</button>
                  <Link className="btn ghost" to="/confirm">Back</Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
