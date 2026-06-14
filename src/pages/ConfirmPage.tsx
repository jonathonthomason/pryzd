import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowProgress } from '../components/WorkflowProgress'

type ConfirmState = 'alternate' | 'lead' | 'capacity' | 'source' | 'ready'

type ConfirmedInput = {
  label: string
  value: string
  source?: string
}

type AssumptionOption = {
  label: string
  value: string
}

type Assumption = {
  title: string
  reason: string
  options: AssumptionOption[]
  selected: string
}

type ReadinessItem = {
  label: string
  done: boolean
}

type ConfirmConfig = {
  label: string
  readinessLabel: string
  readinessScore: string
  readinessSummary: string
  confirmedInputs: ConfirmedInput[]
  assumption: Assumption
  readinessItems: ReadinessItem[]
  signal: readonly [string, string, string]
  trace: string
  evaluationEnabled: boolean
}

const states: Record<ConfirmState, ConfirmConfig> = {
  alternate: {
    label: 'Alternate strategy',
    readinessLabel: 'Commercial review needed',
    readinessScore: '82%',
    readinessSummary: 'Ready for evaluation once alternate finish strategy is confirmed.',
    confirmedInputs: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step' },
      { label: 'Finish', value: 'Black anodize', source: 'finish-spec.pdf' },
      { label: 'Volume', value: '2,500 units', source: 'customer-email.msg' },
      { label: 'Lead target', value: '18 days', source: 'customer-email.msg' },
      { label: 'Packaging', value: 'Reseller-label-ready', source: 'customer-email.msg' },
    ],
    assumption: {
      title: 'Approved Finish Alternate?',
      reason: 'Required because one manufacturer lacks primary finish capacity.',
      options: [
        { label: 'Type II acceptable', value: 'type-ii' },
        { label: 'No alternate allowed', value: 'no-alternate' },
      ],
      selected: 'type-ii',
    },
    readinessItems: [
      { label: 'Material confirmed', done: true },
      { label: 'Finish confirmed', done: true },
      { label: 'Volume confirmed', done: true },
      { label: 'Lead target confirmed', done: true },
      { label: 'Alternate strategy confirmed', done: false },
    ],
    signal: ['Decision pending', 'Commercial evaluation can proceed once the finish alternate policy is set.', 'warn'],
    trace: 'Normalized request → compared supplier finish capacity → alternate finish decision required.',
    evaluationEnabled: false,
  },
  lead: {
    label: 'Lead target review',
    readinessLabel: 'Commercial review needed',
    readinessScore: '78%',
    readinessSummary: 'Ready for evaluation once delivery target is confirmed against supplier options.',
    confirmedInputs: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step' },
      { label: 'Finish', value: 'Black anodize', source: 'finish-spec.pdf' },
      { label: 'Volume', value: '2,500 units', source: 'customer-email.msg' },
      { label: 'Alternate strategy', value: 'Type II acceptable if needed', source: 'operator assumption' },
      { label: 'Packaging', value: 'Reseller-label-ready', source: 'customer-email.msg' },
    ],
    assumption: {
      title: 'Lead target acceptable?',
      reason: 'Required because the fastest qualified manufacturer is projecting 20 days instead of 18.',
      options: [
        { label: '18 days required', value: 'strict-18' },
        { label: '20 days acceptable', value: 'allow-20' },
      ],
      selected: 'strict-18',
    },
    readinessItems: [
      { label: 'Material confirmed', done: true },
      { label: 'Finish confirmed', done: true },
      { label: 'Volume confirmed', done: true },
      { label: 'Lead target confirmed', done: false },
      { label: 'Alternate strategy confirmed', done: true },
    ],
    signal: ['Delivery decision pending', 'Commercial evaluation depends on whether schedule flexibility is allowed.', 'warn'],
    trace: 'Normalized request → compared supplier lead projections → delivery policy requires operator direction.',
    evaluationEnabled: false,
  },
  capacity: {
    label: 'Capacity tradeoff',
    readinessLabel: 'Commercial review needed',
    readinessScore: '86%',
    readinessSummary: 'Ready for evaluation once the operator confirms how much supplier concentration is acceptable.',
    confirmedInputs: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step' },
      { label: 'Finish', value: 'Black anodize', source: 'finish-spec.pdf' },
      { label: 'Volume', value: '2,500 units', source: 'customer-email.msg' },
      { label: 'Lead target', value: '18 days', source: 'customer-email.msg' },
      { label: 'Alternate strategy', value: 'Type II acceptable if needed', source: 'operator assumption' },
    ],
    assumption: {
      title: 'Single-source acceptable?',
      reason: 'Required because one manufacturer is clearly best on cost but creates concentration risk.',
      options: [
        { label: 'Single-source acceptable', value: 'single-source' },
        { label: 'Require backup source', value: 'backup-required' },
      ],
      selected: 'backup-required',
    },
    readinessItems: [
      { label: 'Material confirmed', done: true },
      { label: 'Finish confirmed', done: true },
      { label: 'Volume confirmed', done: true },
      { label: 'Lead target confirmed', done: true },
      { label: 'Alternate strategy confirmed', done: true },
    ],
    signal: ['Commercial choice available', 'All core signals are confirmed; remaining choice is portfolio strategy.', 'good'],
    trace: 'Normalized request → ranked supplier set → surfaced concentration tradeoff for operator preference.',
    evaluationEnabled: true,
  },
  source: {
    label: 'Evidence review',
    readinessLabel: 'Evidence available',
    readinessScore: '88%',
    readinessSummary: 'Ready for evaluation once the operator confirms the assumption based on source evidence.',
    confirmedInputs: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step → model metadata' },
      { label: 'Finish', value: 'Black anodize', source: 'finish-spec.pdf → section 2.1' },
      { label: 'Volume', value: '2,500 units', source: 'customer-email.msg → line item summary' },
      { label: 'Lead target', value: '18 days', source: 'customer-email.msg → requested delivery note' },
      { label: 'Tolerance sensitivity', value: 'Sealing surface called out', source: 'tolerance-notes.xlsx → row 12' },
    ],
    assumption: {
      title: 'Use alternate finish path if capacity is constrained?',
      reason: 'Required because the source package confirms finish requirements but does not explicitly prohibit approved alternates.',
      options: [
        { label: 'Allow approved alternate', value: 'allow-alt' },
        { label: 'Primary finish only', value: 'primary-only' },
      ],
      selected: 'allow-alt',
    },
    readinessItems: [
      { label: 'Material confirmed', done: true },
      { label: 'Finish confirmed', done: true },
      { label: 'Volume confirmed', done: true },
      { label: 'Lead target confirmed', done: true },
      { label: 'Alternate strategy confirmed', done: false },
    ],
    signal: ['Evidence aligned', 'Source evidence is grounded; one commercial assumption still needs operator judgment.', 'warn'],
    trace: 'Source evidence expanded → finish policy remains a business decision rather than a parsing issue.',
    evaluationEnabled: false,
  },
  ready: {
    label: 'Ready',
    readinessLabel: 'Ready for evaluation',
    readinessScore: '100%',
    readinessSummary: 'Commercial inputs are confirmed and the request is ready for manufacturer evaluation.',
    confirmedInputs: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step' },
      { label: 'Finish', value: 'Black anodize with Type II alternate if needed', source: 'finish-spec.pdf + operator assumption' },
      { label: 'Volume', value: '2,500 units', source: 'customer-email.msg' },
      { label: 'Lead target', value: '18 days', source: 'customer-email.msg' },
      { label: 'Packaging', value: 'Reseller-label-ready', source: 'customer-email.msg' },
    ],
    assumption: {
      title: 'Commercial assumption confirmed',
      reason: 'Alternate finish policy has been approved for evaluation.',
      options: [
        { label: 'Type II acceptable', value: 'type-ii' },
        { label: 'No alternate allowed', value: 'no-alternate' },
      ],
      selected: 'type-ii',
    },
    readinessItems: [
      { label: 'Material confirmed', done: true },
      { label: 'Finish confirmed', done: true },
      { label: 'Volume confirmed', done: true },
      { label: 'Lead target confirmed', done: true },
      { label: 'Alternate strategy confirmed', done: true },
    ],
    signal: ['Ready for evaluation', 'Commercial readiness is complete for manufacturer evaluation.', 'good'],
    trace: 'Normalized request → business assumptions confirmed → ready for supplier evaluation.',
    evaluationEnabled: true,
  },
}

function SignalCard({ data }: { data: readonly [string, string, string] }) {
  return (
    <div className={`state ${data[2]}`}>
      <strong>{data[0]}</strong>
      {data[1]}
    </div>
  )
}

export function ConfirmPage() {
  const [view, setView] = useState<ConfirmState>('alternate')
  const [selectedOptions, setSelectedOptions] = useState<Record<ConfirmState, string>>({
    alternate: states.alternate.assumption.selected,
    lead: states.lead.assumption.selected,
    capacity: states.capacity.assumption.selected,
    source: states.source.assumption.selected,
    ready: states.ready.assumption.selected,
  })

  const state = states[view]
  const selectedOption = selectedOptions[view]
  const readinessDone = useMemo(() => state.readinessItems.filter((item) => item.done).length, [state.readinessItems])

  const applyView = (nextView: ConfirmState) => {
    setView(nextView)
  }

  const handleSelect = (value: string) => {
    setSelectedOptions((current) => ({ ...current, [view]: value }))
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Confirm</strong>
          <span className="badge">Decision-ready review</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <WorkflowProgress label="Confirm" />

        <h1>Confirm request</h1>
        <div className="intro">Review what the system believes is true, confirm the business assumptions that require operator judgment, and move to evaluation when the commercial picture is complete.</div>

        <div className="state-toolbar">
          <span className="toolbar-label">Confirm states</span>
          {(Object.entries(states) as [ConfirmState, ConfirmConfig][]).map(([name, config]) => (
            <button
              key={name}
              className={`state-chip${view === name ? ' active' : ''}`}
              onClick={() => applyView(name)}
              type="button"
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-header"><div className="panel-title">Decision readiness</div></div>
            <div className="panel-body confirm-panel-body">
              <div className="stats stats-3 confirm-metrics">
                <div className="metric"><span className="k">Commercial readiness</span><div className="v">{state.readinessScore}</div></div>
                <div className="metric"><span className="k">Status</span><div className="v confirm-status-copy">{state.readinessLabel}</div></div>
                <div className="metric"><span className="k">Readiness signals</span><div className="v">{readinessDone}/5</div></div>
              </div>

              <div className="confirm-section-card">
                <div className="confirm-section-title">Confirmed Inputs</div>
                <div className="confirm-input-grid">
                  {state.confirmedInputs.map((item) => (
                    <div key={item.label} className="confirm-input-card">
                      <span className="k">{item.label}</span>
                      <strong>{item.value}</strong>
                      {item.source ? <div className="confirm-input-source">Source: {item.source}</div> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirm-section-card assumption-card">
                <div className="confirm-section-title">Human Assumptions Needed</div>
                <div className="assumption-title">{state.assumption.title}</div>
                <div className="assumption-reason">{state.assumption.reason}</div>
                <div className="assumption-options">
                  {state.assumption.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`assumption-option${selectedOption === option.value ? ' active' : ''}`}
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="confirm-section-card readiness-card">
                <div className="confirm-section-title">Decision Readiness</div>
                <div className="readiness-summary">{state.readinessSummary}</div>
                <div className="readiness-list">
                  {state.readinessItems.map((item) => (
                    <div key={item.label} className={`readiness-item${item.done ? ' done' : ''}`}>
                      <span className="readiness-icon">{item.done ? '✓' : '○'}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="actions">
                <Link className="btn primary" style={{ pointerEvents: state.evaluationEnabled ? 'auto' : 'none', opacity: state.evaluationEnabled ? '1' : '.45' }} to="/manufacturer-evaluation">Evaluate manufacturers</Link>
                <Link className="btn secondary" to="/capture">Back</Link>
              </div>
            </div>
          </section>

          <aside className="panel">
            <div className="panel-header"><div className="panel-title">Commercial signal</div></div>
            <div className="panel-body">
              <div className="list">
                <SignalCard data={state.signal} />
                <details className="trace">
                  <summary>System details</summary>
                  <div className="trace-copy">{state.trace}</div>
                </details>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
