import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const CATEGORIES = ['All Topics', 'Filing Reports', 'Tracking & Status', 'Account & Privacy', 'Municipal Process'];

const FAQS = [
  {
    category: 'Filing Reports',
    q: 'Do I need an account to report a civic issue?',
    a: 'Yes. Creating a free citizen account ensures that your complaints are securely linked to you, allowing you to track progress milestones, attach photos, and receive resolution updates.',
  },
  {
    category: 'Tracking & Status',
    q: 'Where do I find my complaint reference number?',
    a: 'Your reference number is generated instantly upon submission (e.g. CF-2026-000001) and shown on your confirmation screen. It is also permanently listed under your Complaint History tab and can be used on the public Track Complaint page.',
  },
  {
    category: 'Filing Reports',
    q: 'Can I edit or delete my complaint after submitting?',
    a: 'You can edit or delete a complaint as long as its status is "Pending". Once an administrator begins review or assigns a field department, the original details remain locked for public auditability.',
  },
  {
    category: 'Filing Reports',
    q: 'What kind of photos and location information can I attach?',
    a: 'You can attach one photo (JPEG, PNG, or WebP up to 2 MB). You can also use our interactive map to pin the exact coordinates or click "Use My Current Location" for automatic GPS accuracy.',
  },
  {
    category: 'Account & Privacy',
    q: 'Who can see my personal information?',
    a: 'Your personal phone number and email are kept strictly confidential and only accessible to authorized municipal staff for verification. Public visitors only see the complaint title, category, area, and status timeline.',
  },
  {
    category: 'Account & Privacy',
    q: 'What if I forget my password?',
    a: 'Citizens, field staff, and administrators can all reset their password using the "Forgot password?" option on the login portal by verifying their registered email with a 6-digit verification code.',
  },
  {
    category: 'Municipal Process',
    q: 'How long does it take for a complaint to be resolved?',
    a: 'Resolution times vary by department and urgency. Urgent road safety or water hazard reports are prioritized within 24–48 hours, while routine maintenance follows standard municipal schedules.',
  },
  {
    category: 'Municipal Process',
    q: 'What should I do in an emergency?',
    a: 'TrackCivic is designed for non-emergency municipal maintenance. For life-threatening emergencies, fire hazards, or medical assistance, please immediately call 112 or local emergency hotlines.',
  },
];

export default function HelpPage() {
  useDocumentTitle('Help & FAQ — TrackCivic');
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(0);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'All Topics' || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="tc-help-page py-5">
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Header Banner */}
        <header className="text-center mb-5">
          <span className="badge tc-badge-pill-teal mb-3 px-3 py-2">
            <i className="bi bi-question-circle-fill me-1" /> Help & Support Centre
          </span>
          <h1 className="display-5 fw-bold text-dark mb-3">How Can We Help You?</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: 640 }}>
            Find answers to common questions about submitting civic complaints, following real-time milestones, and managing your account.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-4" style={{ maxWidth: 580 }}>
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search text-teal" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search topics (e.g. photos, reference, tracking)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Category Pills */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${
                activeCategory === cat ? 'btn-teal' : 'btn-outline-secondary'
              }`}
              style={{ borderRadius: 20, padding: '6px 16px', fontWeight: 600 }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="tc-panel shadow-sm border p-4 mb-5" style={{ borderRadius: 16 }}>
          <h2 className="h4 fw-bold text-dark mb-4 pb-2 border-bottom">
            <i className="bi bi-chat-quote-fill text-teal me-2" />
            Frequently Asked Questions
            {search && <span className="small text-muted fw-normal ms-2">({filteredFaqs.length} results)</span>}
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search text-muted fs-1 mb-2 d-block" />
              <h3 className="h5 fw-bold">No Matching Questions Found</h3>
              <p className="text-muted small">Try searching with a different keyword or reset the category filter.</p>
              <button
                type="button"
                className="btn btn-sm btn-outline-teal mt-2"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('All Topics');
                }}
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="accordion accordion-flush" id="faqAccordion">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    className="accordion-item mb-2 border rounded-3 overflow-hidden shadow-2xs"
                    key={faq.q}
                  >
                    <h3 className="accordion-header">
                      <button
                        type="button"
                        className={`accordion-button fw-bold py-3 ${isOpen ? 'bg-light text-teal' : 'collapsed'}`}
                        onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="me-2 text-teal">Q.</span>
                        {faq.q}
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
                      <div className="accordion-body text-secondary" style={{ lineHeight: 1.65 }}>
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3 Helpful Resource Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="tc-panel h-100 p-4 border shadow-sm text-center" style={{ borderRadius: 16 }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 52, height: 52, background: '#eff6ff', color: '#2563eb', fontSize: '1.4rem' }}
              >
                <i className="bi bi-plus-circle-fill" />
              </div>
              <h3 className="h5 fw-bold mb-2">Report an Issue</h3>
              <p className="text-muted small mb-3">Notice a broken streetlight, pothole or garbage dump? File a ticket in under 2 minutes.</p>
              <Link to="/report" className="btn btn-sm btn-outline-primary w-100">
                Submit New Report
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="tc-panel h-100 p-4 border shadow-sm text-center" style={{ borderRadius: 16 }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 52, height: 52, background: '#ecfdf5', color: '#059669', fontSize: '1.4rem' }}
              >
                <i className="bi bi-clock-history" />
              </div>
              <h3 className="h5 fw-bold mb-2">Track Status</h3>
              <p className="text-muted small mb-3">Have a reference number? Check live department progress without logging in.</p>
              <Link to="/track" className="btn btn-sm btn-outline-teal w-100">
                Track by Reference
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="tc-panel h-100 p-4 border shadow-sm text-center" style={{ borderRadius: 16 }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 52, height: 52, background: '#fff1f2', color: '#e11d48', fontSize: '1.4rem' }}
              >
                <i className="bi bi-exclamation-triangle-fill" />
              </div>
              <h3 className="h5 fw-bold mb-2">Civic Emergency?</h3>
              <p className="text-muted small mb-3">For immediate hazards, electrical short-circuits or life safety, contact municipal control rooms.</p>
              <span className="badge bg-danger px-3 py-2 fs-6">Dial 112 / Emergency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
