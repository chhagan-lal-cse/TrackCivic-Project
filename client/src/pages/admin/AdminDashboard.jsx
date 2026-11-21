import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { adminService } from '../../services/adminService.js';
import { ACTION_LABEL, CATEGORY_ICON } from '../../utils/constants.js';
import { timeAgo } from '../../utils/format.js';

export default function AdminDashboard() {
  useDocumentTitle('Administration Overview — TrackCivic');
  const { data, loading, error, reload } = useAsync(() => adminService.dashboard(), []);

  const adminKpis = [
    { label: 'Total', value: data?.totals.total || 0, icon: 'bi-layers', bg: '#eff6ff', color: '#2563eb' },
    { label: 'Pending', value: data?.totals.pending || 0, icon: 'bi-hourglass-split', bg: '#fef3c7', color: '#d97706' },
    { label: 'Under Review', value: data?.totals.underReview || 0, icon: 'bi-search', bg: '#e0e7ff', color: '#4f46e5' },
    { label: 'In Progress', value: data?.totals.inProgress || 0, icon: 'bi-tools', bg: '#ccfbf1', color: '#0d9488' },
    { label: 'Resolved', value: data?.totals.resolved || 0, icon: 'bi-check2-circle', bg: '#dcfce7', color: '#16a34a' },
    { label: 'Rejected', value: data?.totals.rejected || 0, icon: 'bi-x-circle', bg: '#ffe4e6', color: '#e11d48' },
  ];

  return (
    <>
      <header className="tc-page-head">
        <div>
          <span className="tc-eyebrow">Municipal Administration</span>
          <h1>Operations Overview</h1>
          <p>Live civic complaint triage, department allocation, and resolution performance tracking.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={reload} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-1" />Refresh
          </button>
          <Link to="/admin/complaints?status=Pending" className="btn btn-admin-card shadow-sm">
            <i className="bi bi-inbox-fill me-1" />Open Pending Queue
          </Link>
        </div>
      </header>

      {loading && !data && <LoadingSpinner label="Calculating municipal statistics..." />}
      <ErrorMessage message={error} onRetry={reload} />

      {data && (
        <>
          <section className="tc-kpi-grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {adminKpis.map((kpi) => (
              <article className="tc-kpi" key={kpi.label} style={{ minHeight: 116 }}>
                <div className="tc-kpi-top">
                  <span>{kpi.label}</span>
                  <span className="tc-kpi-icon" style={{ background: kpi.bg, color: kpi.color, width: 34, height: 34, fontSize: '1rem' }}>
                    <i className={`bi ${kpi.icon}`} />
                  </span>
                </div>
                <strong style={{ fontSize: '1.75rem', color: kpi.color, marginTop: 8 }}>{kpi.value}</strong>
              </article>
            ))}
          </section>

          <section className="tc-dashboard-grid mb-4">
            <article className="tc-panel">
              <div className="tc-panel-head">
                <h2>
                  <i className="bi bi-activity text-indigo me-2" />
                  Recent Operational Activity
                </h2>
                <Link to="/admin/complaints" className="small fw-bold text-indigo">
                  Open Complaint Queue <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>

              {data.recentActivity.length === 0 ? (
                <p className="text-muted small mb-0 py-3">No activity recorded yet.</p>
              ) : (
                <ul className="tc-list">
                  {data.recentActivity.map((a) => (
                    <li className="tc-list-item" key={a._id}>
                      <span className="tc-kpi-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                        <i className="bi bi-arrow-repeat" />
                      </span>
                      <div className="tc-list-main">
                        {a.complaint && (
                          <Link to={`/admin/complaints/${a.complaint._id}`} className="text-decoration-none">
                            <strong className="d-inline text-primary hover-underline">{a.complaint.referenceNumber}</strong>
                          </Link>
                        )}
                        <small className="d-block">
                          {ACTION_LABEL[a.action]}
                          {a.newStatus && a.action === 'STATUS_CHANGED' ? ` → ${a.newStatus}` : ''} • {timeAgo(a.createdAt)}
                        </small>
                      </div>
                      <span className="badge bg-light text-dark border px-2 py-1 small">{a.actor.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <aside className="tc-panel">
              <div className="tc-panel-head">
                <h2>
                  <i className="bi bi-trophy-fill text-warning me-2" />
                  Resolution Rate
                </h2>
              </div>
              <strong style={{ fontSize: '2.6rem', color: 'var(--tc-navy)', display: 'block', lineHeight: 1 }}>
                {data.resolutionRate}%
              </strong>
              <p className="small text-muted mb-3 mt-1">of all non-rejected citizen reports resolved</p>
              <div className="border-top pt-3 small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Average resolution</span>
                  <strong>{data.averageResolutionDays ?? '—'} days</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Registered Citizens</span>
                  <strong>{data.totals.citizens}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Active Departments</span>
                  <strong>{data.totals.activeDepartments}</strong>
                </div>
              </div>
            </aside>
          </section>

          <section className="tc-panel">
            <div className="tc-panel-head">
              <h2>
                <i className="bi bi-pie-chart-fill text-teal me-2" />
                Complaints by Category
              </h2>
            </div>
            <div className="row g-3">
              {data.byCategory.map((c) => {
                const maxCount = data.byCategory.reduce((m, x) => Math.max(m, x.count), 1);
                const percent = Math.max(c.count ? 12 : 0, (c.count / maxCount) * 100);
                return (
                  <div className="col-sm-6 col-lg-4" key={c.category}>
                    <div className="d-flex justify-content-between small mb-2">
                      <Link to={`/admin/complaints?category=${encodeURIComponent(c.category)}`} className="text-decoration-none text-reset fw-semibold">
                        <i className={`bi ${CATEGORY_ICON[c.category]} me-2 text-teal`} />
                        {c.category}
                      </Link>
                      <strong className="badge bg-light text-dark border">{c.count}</strong>
                    </div>
                    <div className="cf-bar">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </>
  );
}
