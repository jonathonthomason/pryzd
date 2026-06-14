import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowProgress } from '../components/WorkflowProgress'
import { manufacturers, orderSummary, scenarioRecommendations, type DecisionScenario } from '../data/decisionFlow'

type EvaluationStage = {
  label: string
  note: string
  input: string[]
  analysis: string
  outcome: string
}

const evaluationStages: EvaluationStage[] = [
  {
    label: 'Requirements normalization',
    note: 'Core commercial and manufacturing inputs locked for comparison.',
    input: ['Confirmed material', 'Confirmed finish strategy', 'Required volume', 'Lead target'],
    analysis: 'The request is normalized into a manufacturer-ready decision package with material, finish, volume, timing, and alternate strategy aligned.',
    outcome: 'Supplier comparison can proceed without reinterpreting the source package.',
  },
  {
    label: 'Capacity analysis',
    note: 'Production window compared against qualified supplier availability.',
    input: ['Required quantity', 'Required lead time'],
    analysis: 'North Ridge has 31% unused capacity during the requested production window. Monterrey remains viable but with a narrower slot. Pearl River can absorb the volume, but at a slower release cadence.',
    outcome: 'North Ridge shows the highest schedule confidence.',
  },
  {
    label: 'Inventory analysis',
    note: 'Material readiness compared across candidate manufacturers.',
    input: ['Material requirement', 'Allocation status', 'Replenishment exposure'],
    analysis: 'North Ridge already holds usable stock. Monterrey has reserved allocation. Pearl River can source the material, but replenishment timing adds more uncertainty to the promise date.',
    outcome: 'North Ridge and Monterrey stay commercially credible; Pearl River weakens on commitment confidence.',
  },
  {
    label: 'Lead time analysis',
    note: 'Transit and internal production timing consolidated into one decision view.',
    input: ['Lead target', 'Production start window', 'Transit pattern'],
    analysis: 'North Ridge matches the 18-day target cleanly. Monterrey can support a 23-day path. Pearl River falls to 32 days once transit variability is included.',
    outcome: 'North Ridge preserves the requested delivery posture.',
  },
  {
    label: 'Commercial analysis',
    note: 'Margin, risk, and commitment posture weighed together.',
    input: ['Target margin', 'Risk tolerance', 'Delivery confidence'],
    analysis: 'Pearl River produces the highest margin, but it carries the weakest schedule and logistics confidence. Monterrey improves economics with a thinner buffer. North Ridge clears the target while protecting the customer promise.',
    outcome: 'North Ridge is the strongest overall business decision for this order.',
  },
]

function StageRow({ stage, index, activeIndex }: { stage: EvaluationStage; index: number; activeIndex: number }) {
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

function StageWorkspace({ stage, active }: { stage: EvaluationStage; active: boolean }) {
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
  const selectedManufacturer = manufacturers.find((item) => item.id === recommendation.recommendedManufacturerId) ?? manufacturers[0]

  const progress = useMemo(() => Math.min(100, Math.round(((activeIndex + 1) / evaluationStages.length) * 100)), [activeIndex])
  const complete = activeIndex >= evaluationStages.length - 1
  const visibleStages = evaluationStages.slice(0, activeIndex + 1)

  useEffect(() => {
    setActiveIndex(0)
    setShowScoringBreakdown(false)
  }, [scenario])

  useEffect(() => {
    if (complete) return

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => Math.min(current + 1, evaluationStages.length - 1))
    }, 550)

    return () => window.clearTimeout(timer)
  }, [activeIndex, complete])

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Manufacturer Evaluation</strong>
          <span className="badge">Transparent reasoning</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <WorkflowProgress label="Manufacturer Evaluation" />

        <h1>Evaluating Manufacturing Options</h1>
        <div className="intro">Watch the system build a recommendation step by step, expose what it considered, and compare candidate manufacturers in one decision workspace.</div>

        <div className="state-toolbar">
          <span className="toolbar-label">Decision posture</span>
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
              <div className="panel-title">{recommendation.label}</div>
              <div className="sub">{orderSummary.customer} · {orderSummary.part} · {orderSummary.quantity.toLocaleString()} units</div>
            </div>
            <div className="evaluation-meta">
              <strong>{progress}% complete</strong>
              <span>{complete ? 'Comparison complete' : 'Reasoning in progress'}</span>
            </div>
          </div>

          <div className="panel-body evaluation-body">
            <div className="evaluation-progress-rail">
              <div className="evaluation-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="evaluation-layout evaluation-workspace-layout">
              <section className="evaluation-stage-column">
                <div className="evaluation-stage-list">
                  {evaluationStages.map((stage, index) => (
                    <StageRow key={stage.label} stage={stage} index={index} activeIndex={activeIndex} />
                  ))}
                </div>

                <div className="evaluation-scorecard-card">
                  <div className="confirm-section-title">Manufacturer scorecard</div>
                  <div className="scorecard-table-wrap">
                    <table className="scorecard-table">
                      <thead>
                        <tr>
                          <th>Manufacturer</th>
                          <th>Capacity</th>
                          <th>Inventory</th>
                          <th>Lead</th>
                          <th>Margin</th>
                          <th>Risk</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manufacturers.map((manufacturer) => (
                          <tr key={manufacturer.id} className={manufacturer.id === selectedManufacturer.id ? 'is-leading' : ''}>
                            <td>
                              <strong>{manufacturer.name}</strong>
                              <div className="scorecard-sub">{manufacturer.region}</div>
                            </td>
                            <td>{manufacturer.capacity}</td>
                            <td>{manufacturer.inventory}</td>
                            <td>{manufacturer.leadTimeDays} days</td>
                            <td>{manufacturer.marginPct}%</td>
                            <td>{manufacturer.commercialRisk}</td>
                            <td>{manufacturer.confidencePct}</td>
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
                      <span>View Scoring Breakdown</span>
                      <span className={`scorecard-breakdown-chevron${showScoringBreakdown ? ' open' : ''}`}>⌄</span>
                    </button>

                    {showScoringBreakdown ? (
                      <div className="scorecard-breakdown-body">
                        <div className="confirm-section-title">Scoring Breakdown</div>
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
                      <strong>Order under evaluation</strong>
                      {orderSummary.material} · {orderSummary.finish} · deliver to {orderSummary.destination} by {orderSummary.requiredDeliveryDate}
                    </div>

                    <div className={`status-box ${complete ? 'good' : 'warn'}`}>
                      <strong>{complete ? 'Recommendation ready' : 'Analysis building'}</strong>
                      {complete ? recommendation.headline : 'The workspace is comparing qualified manufacturers across capacity, inventory, lead, margin, and risk.'}
                    </div>

                    <div className="evidence-stack">
                      <div className="state good">
                        <strong>Leading candidate</strong>
                        {selectedManufacturer.name} · {selectedManufacturer.leadTimeDays} days · {selectedManufacturer.marginPct}% margin
                      </div>
                      <div className="state good">
                        <strong>Comparison set</strong>
                        {manufacturers.length} candidate manufacturers remain in commercial consideration
                      </div>
                      <div className={`state ${selectedManufacturer.risk === 'Low' ? 'good' : 'warn'}`}>
                        <strong>Current posture</strong>
                        {selectedManufacturer.rationale}
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
                  <Link className="btn primary" style={{ pointerEvents: complete ? 'auto' : 'none', opacity: complete ? '1' : '.45' }} to="/recommendation-workspace">Open recommendation workspace</Link>
                  <button className="btn secondary" type="button" onClick={() => setActiveIndex(0)}>Re-run evaluation</button>
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
