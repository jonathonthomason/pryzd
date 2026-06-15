import { useState } from 'react'
import { Link } from 'react-router-dom'

export function HomePage() {
  const [showArchitectureModal, setShowArchitectureModal] = useState(false)
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <strong>Prototype home</strong>
          <span className="badge">Launch</span>
        </div>
        <div className="topbar-right">MQI System</div>
      </div>

      <div className="content">
        <div className="breadcrumbs">
          <span>Prototype</span>
          <span className="sep">/</span>
          <span>Home</span>
        </div>

        <h1>Production Readiness Intelligence</h1>
        <div className="intro intro-home">Turn one manufacturer’s live constraints into a quote you can defend: evidence, confidence, assumptions, risks, recommendation.</div>

        <div className="layout home-layout">
          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">Prototype flow</div>
            </div>
            <div className="panel-body">
              <div className="stats stats-3">
                <div className="metric">
                  <span className="k">Primary task</span>
                  <div className="v">Quote confidence and readiness</div>
                </div>
                <div className="metric">
                  <span className="k">Margin target</span>
                  <div className="v">50%+</div>
                </div>
                <div className="metric">
                  <span className="k">Output</span>
                  <div className="v">Approved recommendation</div>
                </div>
              </div>

              <div className="cards">
                <div className="card"><h3>1. RFQ Intake</h3><p>Upload the source package and capture the request.</p></div>
                <div className="card"><h3>2–3. Requirements Understanding + Review</h3><p>Normalize the request, surface uncertainty, and confirm assumptions.</p></div>
                <div className="card"><h3>4. Production Readiness Analysis</h3><p>Check one manufacturer’s material, capacity, quality, timing, and fulfillment posture.</p></div>
                <div className="card"><h3>5–7. Commercial Analysis + Recommendation + Review</h3><p>Turn readiness into a volatility-aware quote recommendation with evidence and risk.</p></div>
                <div className="card"><h3>8. Quote Delivery</h3><p>Generate the customer-facing quote from the approved recommendation.</p></div>
              </div>

              <div className="home-resource-grid">
                <div className="home-resource-card">
                  <div>
                    <div className="confirm-section-title">Stakeholder deck</div>
                    <p>Open the updated case study deck with the as-is process intro and MQI story flow.</p>
                  </div>
                  <a className="btn secondary" href="/stakeholder-case-study.html" target="_blank" rel="noreferrer">Open deck</a>
                </div>
                <div className="home-resource-card">
                  <div>
                    <div className="confirm-section-title">Roadmap architecture</div>
                    <p>Preview the architecture reference without leaving the prototype.</p>
                  </div>
                  <button className="btn secondary" type="button" onClick={() => setShowArchitectureModal(true)}>Open architecture</button>
                </div>
              </div>

              <div className="actions">
                <Link className="btn primary" to="/capture">Open workflow</Link>
                <a className="btn secondary" href="/prototype/design-system.html">Open MQI System</a>
                <a className="btn secondary" href="/prototype/design-system.json">Open JSON</a>
              </div>
            </div>
          </section>

          <aside className="panel">
            <div className="panel-header">
              <div className="panel-title">Current state</div>
            </div>
            <div className="panel-body">
              <div className="list">
                <div className="listrow"><span>1. RFQ Intake</span><strong>Ready</strong></div>
                <div className="listrow"><span>2–3. Requirements Understanding + Review</span><strong>Ready</strong></div>
                <div className="listrow"><span>4. Production Readiness Analysis</span><strong>Ready</strong></div>
                <div className="listrow"><span>5–7. Commercial Analysis + Recommendation + Review</span><strong>Ready</strong></div>
                <div className="listrow"><span>8. Quote Delivery</span><strong>Ready</strong></div>
              </div>
            </div>
          </aside>
        </div>

        {showArchitectureModal ? (
          <div className="modal-backdrop" onClick={() => setShowArchitectureModal(false)} role="presentation">
            <div className="modal-card architecture-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Roadmap architecture">
              <div className="modal-head">
                <div>
                  <div className="panel-title">Roadmap architecture</div>
                  <div className="sidebar-sub">Reference architecture for the stakeholder story and roadmap discussion.</div>
                </div>
                <button className="btn ghost" type="button" onClick={() => setShowArchitectureModal(false)}>Close</button>
              </div>
              <div className="architecture-modal-frame">
                <img src="/architecture.png" alt="MQI roadmap architecture" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
