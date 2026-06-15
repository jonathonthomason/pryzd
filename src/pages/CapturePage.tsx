import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowProgress } from '../components/WorkflowProgress'

type CaptureState = 'empty' | 'parsing' | 'partial' | 'blocker' | 'ready'

type CaptureCard = readonly [string, string, string?]

type ExtractedSignal = {
  label: string
  value: string
  status: 'good' | 'warn'
}

type EvidenceItem = {
  label: string
  value: string
  source: string
  section: string
  confidence: string
  status: 'good' | 'warn'
}

type ReviewFieldKey = 'material' | 'finish' | 'quantity' | 'leadTime' | 'packagingRequirement' | 'toleranceNotes'

type ReviewField = {
  key: ReviewFieldKey
  label: string
  placeholder: string
  required: boolean
}

type CaptureConfig = {
  label: string
  upload: 'empty' | 'parsing' | 'loaded'
  hints: boolean
  readiness: string
  detected: string
  extractionConfidence: string
  blockers: string
  captured: CaptureCard
  structured: CaptureCard
  blocker: readonly [string, string] | null
  warn: readonly [string, string] | null
  trace: string
  reviewEnabled: boolean
  extractedSignals: ExtractedSignal[]
  evidence: EvidenceItem[]
  findings: string[]
}

const emptySignals: ExtractedSignal[] = [
  { label: 'Material', value: 'Waiting for source material', status: 'warn' },
  { label: 'Finish', value: 'Waiting for source material', status: 'warn' },
  { label: 'Qty', value: 'Waiting for source material', status: 'warn' },
  { label: 'Lead Time', value: 'Not detected', status: 'warn' },
  { label: 'Packaging Requirement', value: 'Not detected', status: 'warn' },
  { label: 'Tolerance Notes', value: 'Not detected', status: 'warn' },
]

const states: Record<CaptureState, CaptureConfig> = {
  empty: {
    label: 'Empty',
    upload: 'empty',
    hints: false,
    readiness: 'Not ready for review',
    detected: '0/7 required decision signals detected',
    extractionConfidence: '0%',
    blockers: '0',
    captured: ['Waiting', 'No source material yet'],
    structured: ['Draft', 'No extracted signals yet'],
    blocker: null,
    warn: null,
    trace: 'Waiting for source material.',
    reviewEnabled: false,
    extractedSignals: emptySignals,
    evidence: [],
    findings: [],
  },
  parsing: {
    label: 'Parsing',
    upload: 'parsing',
    hints: false,
    readiness: 'Preparing review',
    detected: '3/7 required decision signals detected',
    extractionConfidence: '63%',
    blockers: '0',
    captured: ['Imported', 'Files received', 'good'],
    structured: ['Parsing', 'Signals and evidence are being assembled', 'warn'],
    blocker: null,
    warn: ['System working', 'Fields are being extracted, grouped, and traced back to source documents.'],
    trace: 'Attachments received → extracting fields → grouping source material → preparing evidence.',
    reviewEnabled: false,
    extractedSignals: [
      { label: 'Material', value: '6061 Aluminum', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', status: 'good' },
      { label: 'Qty', value: '2,500', status: 'good' },
      { label: 'Lead Time', value: 'Not detected', status: 'warn' },
      { label: 'Packaging Requirement', value: 'Low confidence', status: 'warn' },
      { label: 'Tolerance Notes', value: 'Detected', status: 'good' },
    ],
    evidence: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step', section: 'Model metadata', confidence: '98%', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', source: 'finish-spec.pdf', section: 'Section 2.1', confidence: '94%', status: 'good' },
    ],
    findings: ['Tolerance-sensitive sealing surface', 'Cosmetic finish requirement'],
  },
  partial: {
    label: 'Partial autofill',
    upload: 'loaded',
    hints: true,
    readiness: 'Ready for review',
    detected: '5/7 required decision signals detected',
    extractionConfidence: '87%',
    blockers: '0',
    captured: ['Captured', 'Core request detected', 'good'],
    structured: ['Partial review', 'Signals extracted. Remaining uncertainty is surfaced below.', 'warn'],
    blocker: null,
    warn: ['Needs review', 'Lead time was not detected and packaging remains uncertain.'],
    trace: 'Files parsed → extracted signals ranked → uncertain fields surfaced for review.',
    reviewEnabled: false,
    extractedSignals: [
      { label: 'Material', value: '6061 Aluminum', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', status: 'good' },
      { label: 'Qty', value: '2,500', status: 'good' },
      { label: 'Lead Time', value: 'Not detected', status: 'warn' },
      { label: 'Packaging Requirement', value: 'Confidence 61%', status: 'warn' },
      { label: 'Tolerance Notes', value: 'Detected', status: 'good' },
    ],
    evidence: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step', section: 'Model metadata', confidence: '98%', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', source: 'finish-spec.pdf', section: 'Section 2.1', confidence: '94%', status: 'good' },
      { label: 'Qty', value: '2,500', source: 'customer-email.msg', section: 'Line item summary', confidence: '97%', status: 'good' },
      { label: 'Packaging Requirement', value: 'Reseller-label-ready', source: 'customer-email.msg', section: 'Packaging notes', confidence: '61%', status: 'warn' },
    ],
    findings: ['Tolerance-sensitive sealing surface', 'Cosmetic finish requirement', 'Potential alternate anodize path'],
  },
  blocker: {
    label: 'Validation blocker',
    upload: 'loaded',
    hints: true,
    readiness: 'Ready for review',
    detected: '6/7 required decision signals detected',
    extractionConfidence: '91%',
    blockers: '1',
    captured: ['Captured', 'Core request present', 'good'],
    structured: ['Structured', 'Most decision signals are grounded in source evidence', 'good'],
    blocker: ['Blocker', 'Finish alternate still needs human confirmation before downstream evaluation.'],
    warn: null,
    trace: 'Files parsed → evidence mapped → alternate path surfaced as the remaining blocker.',
    reviewEnabled: true,
    extractedSignals: [
      { label: 'Material', value: '6061 Aluminum', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', status: 'good' },
      { label: 'Qty', value: '2,500', status: 'good' },
      { label: 'Lead Time', value: '18 days', status: 'good' },
      { label: 'Packaging Requirement', value: 'Reseller-label-ready', status: 'good' },
      { label: 'Tolerance Notes', value: 'Detected', status: 'good' },
    ],
    evidence: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step', section: 'Model metadata', confidence: '98%', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', source: 'finish-spec.pdf', section: 'Section 2.1', confidence: '94%', status: 'good' },
      { label: 'Qty', value: '2,500', source: 'customer-email.msg', section: 'Line item summary', confidence: '97%', status: 'good' },
      { label: 'Lead Time', value: '18 days', source: 'customer-email.msg', section: 'Requested delivery note', confidence: '89%', status: 'good' },
      { label: 'Packaging Requirement', value: 'Reseller-label-ready', source: 'customer-email.msg', section: 'Packaging notes', confidence: '82%', status: 'good' },
    ],
    findings: ['Tolerance-sensitive sealing surface', 'Cosmetic finish requirement', 'Potential alternate anodize path'],
  },
  ready: {
    label: 'Ready',
    upload: 'loaded',
    hints: true,
    readiness: 'Ready for review',
    detected: '7/7 required decision signals detected',
    extractionConfidence: '94%',
    blockers: '0',
    captured: ['Captured', 'Core request present', 'good'],
    structured: ['Structured', 'Signals are grounded and ready for confirmation', 'good'],
    blocker: null,
    warn: null,
    trace: 'Files parsed → evidence grounded → alternate captured → ready for confirmation.',
    reviewEnabled: true,
    extractedSignals: [
      { label: 'Material', value: '6061 Aluminum', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', status: 'good' },
      { label: 'Qty', value: '2,500', status: 'good' },
      { label: 'Lead Time', value: '18 days', status: 'good' },
      { label: 'Packaging Requirement', value: 'Reseller-label-ready', status: 'good' },
      { label: 'Tolerance Notes', value: 'Detected', status: 'good' },
    ],
    evidence: [
      { label: 'Material', value: '6061 Aluminum', source: 'housing-rev-b.step', section: 'Model metadata', confidence: '98%', status: 'good' },
      { label: 'Finish', value: 'Black Anodize', source: 'finish-spec.pdf', section: 'Section 2.1', confidence: '94%', status: 'good' },
      { label: 'Qty', value: '2,500', source: 'customer-email.msg', section: 'Line item summary', confidence: '97%', status: 'good' },
      { label: 'Lead Time', value: '18 days', source: 'customer-email.msg', section: 'Requested delivery note', confidence: '89%', status: 'good' },
      { label: 'Packaging Requirement', value: 'Reseller-label-ready', source: 'customer-email.msg', section: 'Packaging notes', confidence: '82%', status: 'good' },
    ],
    findings: ['Tolerance-sensitive sealing surface', 'Cosmetic finish requirement', 'Potential alternate anodize path'],
  },
}

const reviewFields: ReviewField[] = [
  { key: 'material', label: 'Material', placeholder: 'e.g. 6061 Aluminum', required: true },
  { key: 'finish', label: 'Finish', placeholder: 'e.g. Black Anodize', required: true },
  { key: 'quantity', label: 'Quantity', placeholder: 'e.g. 2500', required: true },
  { key: 'leadTime', label: 'Lead time', placeholder: 'e.g. 18 days', required: true },
  { key: 'packagingRequirement', label: 'Packaging requirement', placeholder: 'e.g. Reseller-label-ready', required: false },
  { key: 'toleranceNotes', label: 'Tolerance notes', placeholder: 'e.g. Sealing surface callout', required: false },
]

function normalizeSignalValue(value: string) {
  const lowered = value.toLowerCase()
  if (lowered.includes('not detected') || lowered.includes('waiting for source material') || lowered.includes('low confidence')) return ''
  return value.replace(/-day fit/i, ' days')
}

function buildReviewValues(signals: ExtractedSignal[]) {
  const map = Object.fromEntries(signals.map((signal) => [signal.label, normalizeSignalValue(signal.value)]))

  return {
    material: map.Material ?? '',
    finish: map.Finish ?? '',
    quantity: map.Qty ?? '',
    leadTime: map['Lead Time'] ?? '',
    packagingRequirement: map['Packaging Requirement'] ?? '',
    toleranceNotes: map['Tolerance Notes'] ?? '',
  }
}

function StateCard({ data, tone }: { data: readonly [string, string] | readonly [string, string, string?] | null; tone?: string }) {
  if (!data) return null

  const className = `state${tone ?? data[2] ? ` ${tone ?? data[2]}` : ''}`
  return (
    <div className={className}>
      <strong>{data[0]}</strong>
      {data[1]}
    </div>
  )
}

export function CapturePage() {
  const [view, setView] = useState<CaptureState>('empty')

  const state = states[view]
  const [reviewValues, setReviewValues] = useState(() => buildReviewValues(state.extractedSignals))
  const uploadClassName = useMemo(() => {
    if (state.upload === 'empty') return 'upload empty'
    if (state.upload === 'parsing') return 'upload parsing'
    return 'upload'
  }, [state.upload])

  useEffect(() => {
    setReviewValues(buildReviewValues(state.extractedSignals))
  }, [state])

  const requiredFieldsComplete = reviewFields.every((field) => !field.required || reviewValues[field.key].trim())
  const reviewEnabled = state.reviewEnabled || requiredFieldsComplete

  const applyView = (nextView: CaptureState) => {
    setView(nextView)
  }

  const runImportFlow = (targetView: CaptureState) => {
    applyView('parsing')
    window.setTimeout(() => applyView(targetView), 700)
  }

  const updateReviewValue = (key: ReviewFieldKey, value: string) => {
    setReviewValues((current) => ({ ...current, [key]: value }))
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Capture</strong>
          <span className="badge">Upload-first intake</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <WorkflowProgress label="Capture" />

        <h1>RFQ intake</h1>
        <div className="intro">Start with source material. Extract the request, inspect the evidence, and surface anything that could weaken quote confidence downstream.</div>

        <div className="state-toolbar">
          <span className="toolbar-label">Capture states</span>
          {(Object.entries(states) as [CaptureState, CaptureConfig][]).map(([name, config]) => (
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
            <div className="panel-header">
              <div className="panel-title">Source material</div>
            </div>
            <div className="panel-body capture-panel-body">
              <div className={uploadClassName}>
                {state.upload === 'empty' ? (
                  <div>
                    <div className="upload-title">Drop files to start extraction</div>
                    <div className="upload-sub">Drawings, specs, PDFs, spreadsheets, or email notes.</div>
                    <div className="upload-actions">
                      <button className="btn primary" type="button" onClick={() => runImportFlow('partial')}>Import files</button>
                      <button className="btn secondary" type="button">Paste email</button>
                    </div>
                  </div>
                ) : null}

                {state.upload === 'loaded' ? (
                  <div>
                    <div className="upload-title">Source material imported</div>
                    <div className="upload-sub">The system extracted high-signal fields and linked them back to source evidence.</div>
                    <div className="upload-actions">
                      <button className="btn primary" type="button" onClick={() => runImportFlow('ready')}>Import more files</button>
                      <button className="btn secondary" type="button" onClick={() => runImportFlow('partial')}>Replace files</button>
                    </div>
                    <div className="filechips">
                      <span className="chip">housing-rev-b.step</span>
                      <span className="chip">finish-spec.pdf</span>
                      <span className="chip">tolerance-notes.xlsx</span>
                    </div>
                  </div>
                ) : null}

                {state.upload === 'parsing' ? (
                  <div>
                    <div className="upload-title">Importing source material</div>
                    <div className="upload-sub">Extracting decision signals, grounding them in source documents, and surfacing uncertainty.</div>
                    <div className="loader">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span>Parsing files</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="stats stats-3 capture-stats">
                <div className="metric"><span className="k">Ready for review</span><div className="v capture-metric-copy">{state.detected}</div></div>
                <div className="metric"><span className="k">Overall extraction confidence</span><div className="v">{state.extractionConfidence}</div></div>
                <div className="metric"><span className="k">Blockers</span><div className="v">{state.blockers}</div></div>
              </div>

              <div className="capture-intelligence-grid">
                <div className="capture-section-card">
                  <div className="capture-section-title">Extracted requirements</div>
                  <div className="signal-list">
                    {state.extractedSignals.map((signal) => (
                      <div key={signal.label} className={`signal-row ${signal.status}`}>
                        <span className="signal-icon">{signal.status === 'good' ? '✓' : '⚠'}</span>
                        <div className="signal-copy">
                          <strong>{signal.label}:</strong> {signal.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="capture-section-card">
                  <div className="capture-section-title">AI findings</div>
                  <div className="finding-list">
                    {state.findings.length ? state.findings.map((item) => (
                      <div key={item} className="finding-item">{item}</div>
                    )) : <div className="finding-empty">No findings yet.</div>}
                  </div>
                </div>
              </div>

              <div className="capture-section-card">
                <div className="capture-section-title">Review and correct extracted fields</div>
                <div className="capture-review-summary">Complete anything the upload missed and correct any value before moving to confirm.</div>
                <div className="capture-review-grid">
                  {reviewFields.map((field) => {
                    const empty = !reviewValues[field.key].trim()
                    return (
                      <div key={field.key} className={`field ${empty && field.required ? 'review' : ''}`}>
                        <label htmlFor={field.key}>{field.label}{field.required ? ' *' : ''}</label>
                        <input
                          id={field.key}
                          type="text"
                          value={reviewValues[field.key]}
                          placeholder={field.placeholder}
                          onChange={(event) => updateReviewValue(field.key, event.target.value)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="capture-section-card">
                <div className="capture-section-title">Document evidence</div>
                <div className="evidence-grid">
                  {state.evidence.length ? state.evidence.map((item) => (
                    <div key={item.label} className={`evidence-card ${item.status}`}>
                      <div className="evidence-head">
                        <strong>{item.label}</strong>
                        <span className={`evidence-confidence ${item.status}`}>Confidence: {item.confidence}</span>
                      </div>
                      <div className="evidence-value">{item.value}</div>
                      <div className="evidence-meta">Source: {item.source}</div>
                      <div className="evidence-meta">Source section: {item.section}</div>
                    </div>
                  )) : <div className="finding-empty">Import files to inspect source-grounded evidence.</div>}
                </div>
              </div>

              <div className="actions">
                <Link className="btn primary" style={{ pointerEvents: reviewEnabled ? 'auto' : 'none', opacity: reviewEnabled ? '1' : '.45' }} to="/confirm">Move to requirements review</Link>
                <button className="btn secondary" type="button" onClick={() => applyView(state.upload === 'loaded' ? 'partial' : 'empty')}>Reset current state</button>
                <Link className="btn ghost" to="/">Back</Link>
              </div>
            </div>
          </section>

          <aside className="panel">
            <div className="panel-header">
              <div className="panel-title">Quote confidence posture</div>
            </div>
            <div className="panel-body">
              <div className="list">
                <StateCard data={state.captured} />
                <StateCard data={state.structured} />
                <StateCard data={state.blocker} tone="blocker" />
                <StateCard data={state.warn} tone="warn" />
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
