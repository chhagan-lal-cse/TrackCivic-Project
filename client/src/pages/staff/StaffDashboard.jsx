import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import PriorityBadge from '../../components/PriorityBadge.jsx';
import FormInput from '../../components/FormInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { complaintService } from '../../services/complaintService.js';
import api, { getErrorMessage } from '../../services/api.js';
import { timeAgo } from '../../utils/format.js';

export default function StaffDashboard() {
  useDocumentTitle('Field Staff Workspace — TrackCivic');
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: summaryData, reload: reloadSummary } = useAsync(() => complaintService.summary(), []);
  const { data: listData, loading, error, reload: reloadList } = useAsync(() => complaintService.list({ limit: 50 }), []);

  const complaints = listData?.data?.complaints || [];

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'in-progress') return c.status === 'In Progress' || c.status === 'Under Review';
    if (activeTab === 'resolved') return c.status === 'Resolved';
    if (activeTab === 'pending') return c.status === 'Pending';
    return true;
  });

  const inProgressCount = (summaryData?.byStatus?.['In Progress'] || 0) + (summaryData?.byStatus?.['Under Review'] || 0);
  const resolvedCount = summaryData?.byStatus?.Resolved || 0;
  const pendingCount = summaryData?.byStatus?.Pending || 0;
  const totalCount = summaryData?.total || complaints.length;

  const staffKpis = [
    { label: 'Total Assigned', value: totalCount, icon: 'bi-list-task', bg: '#eff6ff', color: '#2563eb' },
    { label: 'In Progress', value: inProgressCount, icon: 'bi-tools', bg: '#ccfbf1', color: '#0d9488' },
    { label: 'Waiting Action', value: pendingCount, icon: 'bi-hourglass-split', bg: '#fef3c7', color: '#d97706' },
    { label: 'Work Completed', value: resolvedCount, icon: 'bi-check2-circle', bg: '#dcfce7', color: '#16a34a' },
  ];

  const handleOpenUpdate = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status === 'Resolved' ? 'Resolved' : 'In Progress');
    setUpdateMsg('');
    setUpdateNote('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSaving(true);
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, {
        status: updateStatus,
        publicMessage: updateMsg.trim() || `Field work updated to: ${updateStatus}`,
        internalNote: updateNote.trim(),
      });
      toast.success(`Task status updated to ${updateStatus}`);
      setSelectedComplaint(null);
      reloadList();
      reloadSummary();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="tc-page-head">
        <div>
          <span className="badge tc-badge-pill-amber mb-2">
            <i className="bi bi-cone-striped me-1" /> Field Operations Portal
          </span>
          <h1>Welcome, {user?.name}</h1>
          <p>Review your assigned civic maintenance tasks, conduct field inspections, and record completion updates.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              reloadList();
              reloadSummary();
            }}
          >
            <i className="bi bi-arrow-clockwise me-1" /> Refresh Tasks
          </button>
        </div>
      </header>

      {/* Staff KPI Grid */}
      <section className="tc-kpi-grid mb-4">
        {staffKpis.map((kpi) => (
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

      {/* Main Task List */}
      <section className="tc-panel mb-4">
        <div className="tc-panel-head flex-wrap gap-2">
          <div>
            <h2>
              <i className="bi bi-clipboard2-check-fill text-primary me-2" />
              Assigned Field Tasks ({filteredComplaints.length})
            </h2>
          </div>
          <div className="btn-group btn-group-sm" role="group" aria-label="Task filter">
            <button
              type="button"
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('all')}
            >
              All Tasks ({complaints.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'in-progress' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('in-progress')}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'resolved' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner label="Loading your assigned tasks..." />}
        <ErrorMessage message={error} onRetry={reloadList} />

        {!loading && filteredComplaints.length === 0 && (
          <div className="text-center py-5">
            <div className="tc-cat-icon-bubble mx-auto mb-3" style={{ background: '#ecfdf5', color: '#059669' }}>
              <i className="bi bi-check2-circle fs-2" />
            </div>
            <h3 className="h5 fw-bold">No Tasks in this Filter</h3>
            <p className="text-muted small mb-0">
              {complaints.length === 0
                ? 'When an administrator assigns a complaint to you, it will appear here.'
                : 'No complaints match the selected status.'}
            </p>
          </div>
        )}

        {!loading && filteredComplaints.length > 0 && (
          <div className="table-responsive">
            <table className="cf-table align-middle">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Issue Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="cf-ref fw-bold">{c.referenceNumber}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{c.title}</div>
                      <small className="text-muted">
                        <i className="bi bi-geo-alt text-danger me-1" />
                        {c.address}, {c.city}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{c.category}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <small className="text-muted">{timeAgo(c.updatedAt)}</small>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-teal shadow-sm me-1"
                        onClick={() => handleOpenUpdate(c)}
                        disabled={c.status === 'Resolved' || c.status === 'Rejected'}
                      >
                        <i className="bi bi-pencil-square me-1" />
                        Update Work
                      </button>
                      <Link
                        to={`/admin/complaints/${c._id}`}
                        className="btn btn-sm btn-outline-secondary"
                        title="View Full History"
                      >
                        <i className="bi bi-eye" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick Status Update Modal / Overlay */}
      {selectedComplaint && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom pb-3">
                <div>
                  <span className="cf-ref small text-muted d-block">{selectedComplaint.referenceNumber}</span>
                  <h5 className="modal-title fw-bold text-dark">{selectedComplaint.title}</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedComplaint(null)}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={handleSaveStatus}>
                <div className="modal-body py-3">
                  <div className="p-2 mb-3 rounded bg-light border small">
                    <div>
                      <strong>Location:</strong> {selectedComplaint.address}, {selectedComplaint.city}
                    </div>
                    <div>
                      <strong>Current Status:</strong> <StatusBadge status={selectedComplaint.status} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <FormInput
                      id="update-status"
                      as="select"
                      label="New Work Status *"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      required
                    >
                      <option value="In Progress">In Progress (Work scheduled / underway)</option>
                      <option value="Resolved">Resolved (Work completed and verified)</option>
                    </FormInput>
                  </div>

                  <div className="mb-3">
                    <FormInput
                      id="update-public-msg"
                      as="textarea"
                      rows={3}
                      label="Field Work Report (Visible to Citizen & Admin) *"
                      placeholder="Describe what was repaired or current field progress..."
                      value={updateMsg}
                      onChange={(e) => setUpdateMsg(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <FormInput
                      id="update-internal-note"
                      as="textarea"
                      rows={2}
                      label="Internal Note (Staff & Admin Only)"
                      placeholder="e.g. Materials used, inspection crew names, equipment notes..."
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top pt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedComplaint(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" role="status" />}
                    Save Progress Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
