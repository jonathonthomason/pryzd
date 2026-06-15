import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CapturePage } from './pages/CapturePage'
import { ConfirmPage } from './pages/ConfirmPage'
import { CustomerQuotePage } from './pages/CustomerQuotePage'
import { HomePage } from './pages/HomePage'
import { ManufacturerEvaluationPage } from './pages/ManufacturerEvaluationPage'
import { RecommendationWorkspacePage } from './pages/RecommendationWorkspacePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/manufacturer-evaluation" element={<ManufacturerEvaluationPage />} />
        <Route path="/production-readiness-analysis" element={<ManufacturerEvaluationPage />} />
        <Route path="/recommendation-workspace" element={<RecommendationWorkspacePage />} />
        <Route path="/quote-recommendation" element={<RecommendationWorkspacePage />} />
        <Route path="/optimize" element={<Navigate to="/quote-recommendation" replace />} />
        <Route path="/customer-quote" element={<CustomerQuotePage />} />
        <Route path="/quote-delivery" element={<CustomerQuotePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
