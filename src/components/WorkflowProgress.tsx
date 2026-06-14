import { useLocation } from 'react-router-dom'

const workflowSteps = [
  { path: '/capture', label: 'Capture' },
  { path: '/confirm', label: 'Confirm' },
  { path: '/manufacturer-evaluation', label: 'Manufacturer Evaluation' },
  { path: '/recommendation-workspace', label: 'Recommendation Workspace' },
  { path: '/customer-quote', label: 'Present' },
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
  const progressPct = ((stepIndex + 1) / workflowSteps.length) * 100

  return (
    <div className="workflow-progress-head">
      <div className="breadcrumbs">
        <span>Workflow</span>
        <span className="sep">/</span>
        <span>{title}</span>
      </div>

      <div className="workflow-progress-meta" aria-label={`Step ${stepIndex + 1} of ${workflowSteps.length}`}>
        <span className="workflow-progress-copy">Step {stepIndex + 1} of {workflowSteps.length}</span>
        <div className="workflow-progress-track">
          <div className="workflow-progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>
    </div>
  )
}
