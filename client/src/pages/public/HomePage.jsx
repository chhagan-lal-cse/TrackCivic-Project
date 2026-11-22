import { Link } from 'react-router-dom';
import ComplaintCard from '../../components/ComplaintCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { publicService } from '../../services/publicService.js';
import { CATEGORIES } from '../../utils/constants.js';

export default function HomePage() {
  useDocumentTitle('Smart Civic Issue Tracking');
  const statsRequest = useAsync(() => publicService.stats(), []);
  const recentRequest = useAsync(() => publicService.recent(6), []);

  const stats = statsRequest.data;
  const recent = recentRequest.data;

  return (
    <div className="tc-home">
      {/* Hero Section */}
      <section className="tc-hero">
        <div className="container">
          <div className="tc-hero-grid">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge tc-badge-pill-teal">
                  <i className="bi bi-broadcast me-1" /> Real-time Civic Platform
                </span>
                <span className="badge tc-badge-pill-indigo">
                  <i className="bi bi-shield-check me-1" /> Transparent Governance
                </span>
              </div>
              <h1 className="tc-hero-title">
                See a civic problem? <span className="tc-gradient-text">Move it forward.</span>
              </h1>
              <p className="tc-hero-copy">
                Report local issues, follow every action and know exactly what happens next. TrackCivic keeps residents and municipal teams connected in one clear, colorful workspace.
              </p>

              <div className="tc-hero-actions">
                <Link to="/report" className="btn btn-teal btn-lg shadow">
                  <i className="bi bi-plus-circle-fill me-2" />Submit a Report
                </Link>
                <Link to="/track" className="btn btn-outline-primary btn-lg shadow-sm">
                  <i className="bi bi-search me-2" />Track by Reference
                </Link>
                <Link to="/login/admin" className="btn btn-admin-nav btn-lg shadow-sm">
                  <i className="bi bi-shield-lock-fill me-2" />Admin Portal
                </Link>
              </div>

              <div className="tc-trust-row mt-4">
                <div className="tc-trust-stat">
                  <strong>{stats ? stats.total : '120+'}</strong>
                  <span>reports recorded</span>
                </div>
                <div className="tc-trust-stat">
                  <strong className="text-success">{stats ? `${stats.resolutionRate}%` : '94%'}</strong>
                  <span>resolution rate</span>
                </div>
                <div className="tc-trust-stat">
                  <strong className="text-primary">{stats ? stats.areasCovered : '18'}</strong>
                  <span>wards covered</span>
                </div>
              </div>
            </div>

            <div className="tc-map-panel shadow-lg">
              <span className="tc-pin" aria-hidden="true" />
              <article className="tc-report-card shadow">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="tc-ref">TC-2026-000214</span>
                  <span className="cf-badge cf-status-in-progress">
                    <i className="bi bi-hourglass-split me-1" />In Progress
                  </span>
                </div>
                <h3>Streetlight repair near East Gate</h3>
                <div className="small text-muted mb-3">
                  <i className="bi bi-geo-alt-fill text-danger me-1" />Lakeview Colony • Sector 4
                </div>
                <div className="tc-progress-bar-wrap mb-2">
                  <div className="tc-progress-bar-fill" style={{ width: '65%' }} />
                </div>
                <div className="d-flex justify-content-between small text-muted">
                  <span>Assigned: Electrical Division</span>
                  <span className="fw-semibold text-teal">Step 3 of 4</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Portals Section: Citizen & Administrator Login Access */}
      <section className="tc-section tc-portal-showcase">
        <div className="container">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="tc-eyebrow justify-content-center">Role-Based Access</span>
            <h2 className="display-6 fw-bold mt-2">Dedicated Portals for Every Stakeholder</h2>
            <p className="text-muted fs-5">
              Choose your role below to log in directly to your personalized workspace.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Citizen Portal Card */}
            <div className="col-lg-5 col-md-6">
              <div className="tc-portal-card tc-portal-citizen h-100 shadow-sm">
                <div className="tc-portal-icon-wrap citizen">
                  <i className="bi bi-person-heart fs-2" />
                </div>
                <span className="badge tc-badge-pill-teal mb-2">Citizens & Residents</span>
                <h3 className="h4 fw-bold mb-2">Citizen Portal</h3>
                <p className="text-muted mb-4">
                  Report civic infrastructure issues in your neighborhood, attach photos, track real-time resolution stages, and hold municipal services accountable.
                </p>

                <div className="tc-portal-features mb-4">
                  <div><i className="bi bi-check-circle-fill text-teal me-2" />Instant issue logging with photo upload</div>
                  <div><i className="bi bi-check-circle-fill text-teal me-2" />Real-time tracking by reference code</div>
                  <div><i className="bi bi-check-circle-fill text-teal me-2" />Direct municipal status timeline</div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-auto">
                  <Link to="/login/citizen" className="btn btn-citizen-card flex-grow-1">
                    <i className="bi bi-person-fill me-2" />Citizen Login
                  </Link>
                  <Link to="/register" className="btn btn-outline-teal">
                    <i className="bi bi-person-plus me-1" />New Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Administrator Portal Card */}
            <div className="col-lg-5 col-md-6">
              <div className="tc-portal-card tc-portal-admin h-100 shadow-sm">
                <div className="tc-portal-icon-wrap admin">
                  <i className="bi bi-shield-lock-fill fs-2" />
                </div>
                <span className="badge tc-badge-pill-indigo mb-2">Municipal Administration</span>
                <h3 className="h4 fw-bold mb-2">Administrator Portal</h3>
                <p className="text-muted mb-4">
                  Review incoming complaints, prioritize urgency, allocate tickets to departments and field teams, and oversee municipal performance analytics.
                </p>

                <div className="tc-portal-features mb-4">
                  <div><i className="bi bi-check-circle-fill text-indigo me-2" />Comprehensive complaint triage dashboard</div>
                  <div><i className="bi bi-check-circle-fill text-indigo me-2" />Department & staff assignment workflow</div>
                  <div><i className="bi bi-check-circle-fill text-indigo me-2" />Ward-level analytics and resolution rates</div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-auto">
                  <Link to="/login/admin" className="btn btn-admin-card flex-grow-1">
                    <i className="bi bi-shield-lock-fill me-2" />Administrator Login
                  </Link>
                  <Link to="/login/staff" className="btn btn-outline-indigo">
                    <i className="bi bi-tools me-1" />Staff Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Categories Section */}
      <section className="tc-section">
        <div className="container">
          <div className="tc-section-heading">
            <div>
              <span className="tc-eyebrow">Issue Categories</span>
              <h2>What needs attention?</h2>
            </div>
            <p>Select an issue category to explore common issues routed to respective municipal departments.</p>
          </div>
          <div className="tc-category-grid shadow-sm">
            {CATEGORIES.map((c, index) => {
              const colors = ['cat-amber', 'cat-teal', 'cat-blue', 'cat-indigo', 'cat-green', 'cat-rose'];
              const colorClass = colors[index % colors.length];
              return (
                <article className={`tc-category-item ${colorClass}`} key={c.value}>
                  <div className="tc-cat-icon-bubble">
                    <i className={`bi ${c.icon}`} aria-hidden="true" />
                  </div>
                  <h3>{c.value}</h3>
                  <p>{c.blurb}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="tc-section tinted">
        <div className="container">
          <div className="tc-section-heading">
            <div>
              <span className="tc-eyebrow">Transparent Process</span>
              <h2>From report to resolution</h2>
            </div>
            <p>Every ticket follows an auditable 4-stage lifecycle visible to both citizens and administrators.</p>
          </div>
          <div className="tc-process">
            {[
              {
                number: '01',
                title: 'Submit Report',
                text: 'Citizens log neighborhood issues with description, category, and photo evidence.',
                icon: 'bi-send-fill',
                theme: 'teal',
                bg: '#ccfbf1',
                color: '#0f766e',
              },
              {
                number: '02',
                title: 'Triage & Review',
                text: 'Administration verifies urgency, department jurisdiction, and logs acceptance.',
                icon: 'bi-search',
                theme: 'indigo',
                bg: '#e0e7ff',
                color: '#4338ca',
              },
              {
                number: '03',
                title: 'Field Team Action',
                text: 'Assigned field officer conducts on-site maintenance and records progress reports.',
                icon: 'bi-tools',
                theme: 'amber',
                bg: '#fef3c7',
                color: '#b45309',
              },
              {
                number: '04',
                title: 'Verified Resolution',
                text: 'Work is completed and permanently timestamped on the public resolution record.',
                icon: 'bi-check-circle-fill',
                theme: 'emerald',
                bg: '#d1fae5',
                color: '#047857',
              },
            ].map((step) => (
              <article className={`tc-process-step tc-step-${step.theme}`} key={step.number}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="tc-step-num" style={{ color: step.color }}>
                    STAGE {step.number}
                  </span>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: 44, height: 44, background: step.bg, color: step.color }}
                  >
                    <i className={`bi ${step.icon} fs-5`} />
                  </div>
                </div>
                <h3 className="h5 fw-bold text-dark mb-2">{step.title}</h3>
                <p className="text-muted small mb-0">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="tc-section">
        <div className="container">
          <div className="tc-section-heading">
            <div>
              <span className="tc-eyebrow">Public Activity</span>
              <h2>Recent community reports</h2>
            </div>
            <Link to="/track" className="btn btn-outline-primary">
              <i className="bi bi-search me-1" />Track an Issue
            </Link>
          </div>
          {recentRequest.loading && <LoadingSpinner label="Loading recent reports..." />}
          {recentRequest.error && <p className="text-muted">Recent reports are unavailable.</p>}
          {recent?.length > 0 && (
            <div className="row g-4">
              {recent.map((complaint) => (
                <div className="col-md-6 col-lg-4" key={complaint.referenceNumber}>
                  <ComplaintCard complaint={complaint} />
                </div>
              ))}
            </div>
          )}
          {!recentRequest.loading && !recent?.length && (
            <div className="tc-empty-state-card text-center p-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-3" />
              <p className="text-muted mb-0">No public reports to display at this time.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
