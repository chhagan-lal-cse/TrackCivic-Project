import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge.jsx';
import PriorityBadge from '../../components/PriorityBadge.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import LocationPicker from '../../components/LocationPicker.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { complaintService } from '../../services/complaintService.js';
import { getErrorMessage } from '../../services/api.js';
import { formatDate, formatDateTime, timeAgo } from '../../utils/format.js';
import { STATUS_ICON } from '../../utils/constants.js';

const REF_RE = /^CF-\d{4}-\d{6}$/;

const SAMPLE_REFS = ['CF-2026-000001', 'CF-2026-000002', 'CF-2026-000020'];

export default function TrackComplaintPage() {
  useDocumentTitle('Track Complaint — TrackCivic');
  const [params, setParams] = useSearchParams();
  const initial = params.get('ref') || '';

  const [input, setInput] = useState(initial);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async (ref) => {
    const value = (ref || input).trim().toUpperCase();
    if (!value) {
      setError('Please enter a complaint reference number.');
      setResult(null);
      return;
    }
    if (!REF_RE.test(value)) {
      setError('Reference numbers follow the format CF-YYYY-NNNNNN (e.g. CF-2026-000001).');
      setResult(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.track(value);
      setResult(data);
      setParams({ ref: value }, { replace: true });
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err, 'No matching complaint found with this reference number.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) lookup(initial);
  }, []);

  const handleQuickFill = (sampleRef) => {
    setInput(sampleRef);
    lookup(sampleRef);
  };

  const c = result?.complaint;

  return (
    <div className="tc-page-shell py-4">
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Header */}
        <header className="text-center mb-4">
          <span className="badge tc-badge-pill-teal mb-2">
            <i className="bi bi-broadcast me-1" /> Public Complaint Tracking
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Follow Resolution Progress</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: 640 }}>
            Enter your unique civic complaint reference number to view real-time department updates, field staff milestones, and resolution timeline.
          </p>
        </header>

        {/* Search Card */}
        <div className="tc-panel shadow-sm mb-4 border" style={{ borderRadius: 16 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookup(input);
            }}
            noValidate
          >
            <label htmlFor="ref" className="form-label fw-bold text-dark mb-2">
              <i className="bi bi-upc-scan text-teal me-1" />
              Enter Reference Number
            </label>

            <div className="input-group input-group-lg shadow-sm mb-3">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search text-teal" />
              </span>
              <input
                id="ref"
                type="text"
                className="form-control text-uppercase fw-bold border-start-0"
                style={{ letterSpacing: '0.05em' }}
                aria-label="Reference number"
                placeholder="e.g. CF-2026-000001"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={14}
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-teal px-4 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Searching…
                  </>
                ) : (
                  <>
                    <i className="bi bi-clock-history me-2" />
                    View Timeline
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Reference Pills */}
            <div className="d-flex flex-wrap align-items-center gap-2 pt-1 small text-muted">
              <span>Quick demo samples:</span>
              {SAMPLE_REFS.map((sRef) => (
                <button
                  key={sRef}
                  type="button"
                  className="btn btn-sm btn-outline-secondary py-0 px-2"
                  style={{ fontSize: '0.78rem', borderRadius: 6 }}
                  onClick={() => handleQuickFill(sRef)}
                >
                  {sRef}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Loading Spinner & Error Message */}
        {loading && <LoadingSpinner label="Retrieving complaint milestones from database..." />}
        <ErrorMessage message={error} />

        {/* Tracking Results */}
        {c && !loading && (
          <div className="tc-panel shadow-sm border mt-4" style={{ borderRadius: 16 }}>
            {/* Top Bar with Reference & Status */}
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="cf-ref" style={{ fontSize: '1rem', padding: '4px 10px' }}>
                    {c.referenceNumber}
                  </span>
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <h2 className="h4 fw-bold text-dark mt-2 mb-0">{c.title}</h2>
              </div>

              <div className="text-end">
                <span className="small text-muted d-block">Last Updated</span>
                <strong className="text-dark">{timeAgo(c.updatedAt)}</strong>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column: Complaint Details */}
              <div className="col-lg-7">
                <div className="tc-detail-grid mb-4">
                  <div>
                    <span>Category</span>
                    <strong className="text-dark">{c.category}</strong>
                  </div>
                  <div>
                    <span>Assigned Department</span>
                    <strong className="text-dark">{c.department || 'Under Review / Not Assigned'}</strong>
                  </div>
                  <div>
                    <span>Area / Ward</span>
                    <strong className="text-dark">{c.city}</strong>
                  </div>
                  <div>
                    <span>Submitted On</span>
                    <strong className="text-dark">{formatDate(c.createdAt)}</strong>
                  </div>
                  {c.resolvedAt && (
                    <div>
                      <span>Resolved Date</span>
                      <strong className="text-success">{formatDate(c.resolvedAt)}</strong>
                    </div>
                  )}
                </div>

                {/* Geo Location Map if coords exist */}
                {c.latitude && c.longitude && (
                  <div className="mt-3">
                    <h3 className="h6 text-muted mb-2">
                      <i className="bi bi-geo-alt-fill text-teal me-1" />
                      Reported Location on Map
                    </h3>
                    <LocationPicker
                      latitude={c.latitude}
                      longitude={c.longitude}
                      readOnly
                      height="200px"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Audit Timeline */}
              <div className="col-lg-5">
                <div className="p-3 bg-light rounded-3 border">
                  <h3 className="h6 fw-bold text-dark mb-3">
                    <i className="bi bi-diagram-3-fill text-teal me-2" />
                    Milestone Timeline
                  </h3>

                  <ol className="tc-timeline list-unstyled ps-0 mb-0">
                    {result.timeline.map((t, idx) => (
                      <li key={t._id || idx} className="d-flex gap-3 mb-3 pb-2 border-bottom border-light">
                        <span
                          className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            background:
                              t.newStatus === 'Resolved'
                                ? '#16a34a'
                                : t.newStatus === 'In Progress'
                                ? '#0d9488'
                                : t.action === 'ASSIGNED'
                                ? '#4f46e5'
                                : '#64748b',
                            fontSize: '0.85rem',
                          }}
                        >
                          <i
                            className={`bi ${
                              t.action === 'ASSIGNED'
                                ? 'bi-person-badge'
                                : STATUS_ICON[t.newStatus] || 'bi-flag-fill'
                            }`}
                          />
                        </span>
                        <div>
                          <strong className="d-block small text-dark">
                            {t.action === 'CREATED'
                              ? 'Complaint submitted'
                              : t.action === 'ASSIGNED'
                              ? 'Assigned to Municipal Department'
                              : t.action === 'STATUS_CHANGED'
                              ? `Status updated to ${t.newStatus}`
                              : 'Progress update'}
                          </strong>
                          {t.publicMessage && (
                            <p className="small text-muted mb-1">{t.publicMessage}</p>
                          )}
                          <time className="small text-secondary" dateTime={t.createdAt}>
                            {formatDateTime(t.createdAt)}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex flex-wrap justify-content-between align-items-center">
              <span className="small text-muted">
                Are you the citizen who submitted this issue?
              </span>
              <Link to="/login/citizen" className="btn btn-sm btn-outline-teal">
                <i className="bi bi-box-arrow-in-right me-1" />
                Sign in to Citizen Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
