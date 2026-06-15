import { useLocation } from 'react-router-dom'

const workflowSteps = [
  { path: '/capture', label: '1. RFQ Intake', progressLabel: 'Step 1 of 8' },
  { path: '/confirm', label: '2–3. Requirements Understanding + Review', progressLabel: 'Steps 2–3 of 8' },
  { path: '/manufacturer-evaluation', label: '4. Production Readiness Analysis', progressLabel: 'Step 4 of 8' },
  { path: '/production-readiness-analysis', label: '4. Production Readiness Analysis', progressLabel: 'Step 4 of 8' },
  { path: '/recommendation-workspace', label: '5–7. Commercial Analysis + Recommendation + Review', progressLabel: 'Steps 5–7 of 8' },
  { path: '/quote-recommendation', label: '5–7. Commercial Analysis + Recommendation + Review', progressLabel: 'Steps 5–7 of 8' },
  { path: '/customer-quote', label: '8. Quote Delivery', progressLabel: 'Step 8 of 8' },
  { path: '/quote-delivery', label: '8. Quote Delivery', progressLabel: 'Step 8 of 8' },
] as const

type WorkflowProgressProps = {
  label?: string
}

export function WorkflowProgress({ label }: WorkflowProgressProps) {
  const location = useLocation()
  const stepIndex = workflowSteps.findIndex((step) => step.path === location.pathname)

  if (stepIndex === -1) return null

  const currentStep = workflowSteps[stepIndex]
  const title = label ?? currentStep.label
  const progressMap: Record<string, number> = {
    '/capture': 12.5,
    '/confirm': 37.5,
    '/manufacturer-evaluation': 50,
    '/production-readiness-analysis': 50,
    '/recommendation-workspace': 87.5,
    '/quote-recommendation': 87.5,
    '/customer-quote': 100,
    '/quote-delivery': 100,
  }
  const progressPct = progressMap[location.pathname] ?? 0

  return (
    <div className="workflow-progress-head">
      <div className="breadcrumbs">
        <span>Workflow</span>
        <span className="sep">/</span>
        <span>{title}</span>
      </div>

      <div className="workflow-progress-meta" aria-label={currentStep.progressLabel}>
        <span className="workflow-progress-copy">{currentStep.progressLabel}</span>
        <div className="workflow-progress-track">
          <div className="workflow-progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>
    </div>
  )
}
