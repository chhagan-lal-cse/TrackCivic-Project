import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { complaintService } from '../../services/complaintService.js';
import { timeAgo } from '../../utils/format.js';

export default function CitizenDashboard() {
  useDocumentTitle('Citizen Dashboard — TrackCivic');
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => complaintService.summary(), []);
  const inProgress = (data?.byStatus['Under Review'] || 0) + (data?.byStatus['In Progress'] || 0);

  const kpis = [
    { label: 'Reports Submitted', value: data?.total || 0, icon: 'bi-layers', bg: '#eff6ff', color: '#2563eb' },
    { label: 'Waiting for Review', value: data?.byStatus.Pending || 0, icon: 'bi-hourglass-split', bg: '#fef3c7', color: '#d97706' },
    { label: 'Currently in Progress', value: inProgress, icon: 'bi-arrow-repeat', bg: '#ccfbf1', color: '#0d9488' },
    { label: 'Resolved Successfully', value: data?.byStatus.Resolved || 0, icon: 'bi-check2-circle', bg: '#dcfce7', color: '#16a34a' },
  ];

  return (
    <>
      <header className="tc-page-head">
        <div>
          <span className="tc-eyebrow">Citizen Workspace</span>
          <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p>Review your civic reports, check progress milestones, or submit a new neighborhood issue.</p>
        </div>
        <Link to="/dashboard/complaints/new" className="btn btn-teal btn-lg shadow-sm">
          <i className="bi bi-plus-circle-fill me-2" />
          Submit a Report
        </Link>
      </header>

      {loading && !data && <LoadingSpinner label="Loading your dashboard..." />}
      <ErrorMessage message={error} onRetry={reload} />

      {data && (
        <>
          <section className="tc-kpi-grid mb-4">
            {kpis.map((kpi) => (
              <article className="tc-kpi" key={kpi.label}>
                <div className="tc-kpi-top">
                  <span>{kpi.label}</span>
                  <span className="tc-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                    <i className={`bi ${kpi.icon}`} />
                  </span>
                </div>
                <strong style={{ color: kpi.color }}>{kpi.value}</strong>
              </article>
            ))}
          </section>

          <section className="tc-dashboard-grid">
            <article className="tc-panel">
              <div className="tc-panel-head">
                <h2>
                  <i className="bi bi-clock-history text-teal me-2" />
                  Recent Reports
                </h2>
                <Link to="/dashboard/complaints" className="small fw-bold text-teal">
                  View Full History <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>

              {data.recent.length === 0 ? (
                <div className="text-center py-5">
                  <div className="tc-cat-icon-bubble mx-auto mb-3" style={{ background: '#f1f5f9', color: '#64748b' }}>
                    <i className="bi bi-inboxes fs-3" />
                  </div>
                  <h3 className="h5 fw-bold mt-2">No Reports Yet</h3>
                  <p className="small text-muted mb-3">Your submitted complaints and resolution updates will appear here.</p>
                  <Link to="/dashboard/complaints/new" className="btn btn-teal btn-sm">
                    <i className="bi bi-plus-lg me-1" />Submit First Report
                  </Link>
                </div>
              ) : (
                <ul className="tc-list">
                  {data.recent.map((c) => (
                    <li className="tc-list-item" key={c._id}>
                      <span className="tc-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                        <i className="bi bi-file-earmark-text" />
                      </span>
                      <div className="tc-list-main">
                        <Link to={`/dashboard/complaints/${c._id}`} className="text-decoration-none text-reset">
                          <strong className="hover-underline">{c.title}</strong>
                        </Link>
                        <small>
                          <span className="cf-ref me-2">{c.referenceNumber}</span>
                          Updated {timeAgo(c.updatedAt)}
                        </small>
                        <div className="tc-status-track">
                          <div className={['Resolved', 'In Progress', 'Under Review', 'Pending'].includes(c.status) ? 'done' : ''} />
                          <div className={['Resolved', 'In Progress', 'Under Review'].includes(c.status) ? 'done' : ''} />
                          <div className={['Resolved', 'In Progress'].includes(c.status) ? 'done' : ''} />
                          <div className={c.status === 'Resolved' ? 'done' : ''} />
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <aside className="tc-panel">
              <div className="tc-panel-head">
                <h2>
                  <i className="bi bi-lightning-charge-fill text-warning me-2" />
                  Quick Actions
                </h2>
              </div>
              <div className="d-grid gap-2">
                <Link to="/dashboard/complaints/new" className="btn btn-teal">
                  <i className="bi bi-plus-circle me-2" />New Complaint
                </Link>
                <Link to="/dashboard/complaints" className="btn btn-outline-primary">
                  <i className="bi bi-clock-history me-2" />Complaint History
                </Link>
                <Link to="/track" className="btn btn-outline-primary">
                  <i className="bi bi-search me-2" />Public Tracking
                </Link>
                <Link to="/dashboard/profile" className="btn btn-outline-secondary">
                  <i className="bi bi-person-gear me-2" />Account Settings
                </Link>
              </div>
            </aside>
          </section>
        </>
      )}
    </>
  );
}
