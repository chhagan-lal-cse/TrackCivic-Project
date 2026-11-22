import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function AboutPage() {
  useDocumentTitle('About TrackCivic — Transparent Municipal Operations');

  const pillars = [
    {
      title: 'Real-Time Transparency',
      desc: 'Every complaint generates an immutable reference number. Every status transition and department milestone is recorded publicly with timestamps.',
      icon: 'bi-eye-fill',
      bg: '#ccfbf1',
      color: '#0d9488',
    },
    {
      title: 'Precision Geo-Mapping',
      desc: 'Citizens can pin the exact location on an interactive map or use GPS, ensuring maintenance crews reach the spot without confusion.',
      icon: 'bi-geo-alt-fill',
      bg: '#eff6ff',
      color: '#2563eb',
    },
    {
      title: 'Direct Department Triage',
      desc: 'Municipal administrators quickly route issues to designated municipal teams (Roads, Water, Sanitation, Electricity, Drainage).',
      icon: 'bi-diagram-3-fill',
      bg: '#e0e7ff',
      color: '#4f46e5',
    },
    {
      title: 'Field Team Accountability',
      desc: 'Field staff receive dedicated credentials, accept work orders, and submit verified completion notes before marking issues resolved.',
      icon: 'bi-shield-check',
      bg: '#dcfce7',
      color: '#16a34a',
    },
  ];

  const departments = [
    { name: 'Roads & Infrastructure', icon: 'bi-cone-striped', color: '#ea580c', count: 'Potholes, Signage, Walkways' },
    { name: 'Sanitation & Waste', icon: 'bi-trash-fill', color: '#059669', count: 'Garbage Clearing, Public Bins' },
    { name: 'Electricity & Lighting', icon: 'bi-lightning-charge-fill', color: '#d97706', count: 'Streetlights, Open Wires' },
    { name: 'Water Supply', icon: 'bi-droplet-fill', color: '#0284c7', count: 'Leaks, Pressure, Contamination' },
    { name: 'Drainage & Sewage', icon: 'bi-water', color: '#4f46e5', count: 'Clogged Drains, Overflows' },
    { name: 'Public Parks', icon: 'bi-tree-fill', color: '#15803d', count: 'Gardens, Benches, Playgrounds' },
  ];

  return (
    <div className="tc-about-page py-5">
      <div className="container">
        {/* Hero Section */}
        <header className="text-center mb-5 pb-3">
          <span className="badge tc-badge-pill-teal mb-3 px-3 py-2">
            <i className="bi bi-buildings-fill me-1" /> Smart Civic Technology Platform
          </span>
          <h1 className="display-5 fw-bold text-dark mb-3">
            Empowering Citizens. <span className="tc-gradient-text">Modernizing Cities.</span>
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: 720 }}>
            TrackCivic bridges the gap between urban residents and municipal administrations. By turning complaints into structured, trackable tickets, we make civic upkeep transparent, accountable, and fast.
          </p>
        </header>

        {/* 4 Core Pillars Grid */}
        <section className="mb-5 pb-4">
          <div className="text-center mb-4">
            <span className="tc-eyebrow">Platform Foundations</span>
            <h2 className="h3 fw-bold text-dark">Built for Trust and Speed</h2>
          </div>

          <div className="row g-4">
            {pillars.map((p) => (
              <div className="col-lg-3 col-md-6" key={p.title}>
                <div className="tc-panel h-100 shadow-sm border p-4 d-flex flex-column" style={{ borderRadius: 16 }}>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 52, height: 52, background: p.bg, color: p.color, fontSize: '1.4rem' }}
                  >
                    <i className={`bi ${p.icon}`} />
                  </div>
                  <h3 className="h5 fw-bold text-dark mb-2">{p.title}</h3>
                  <p className="text-muted small mb-0 flex-grow-1" style={{ lineHeight: 1.6 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Municipal Departments Section */}
        <section className="mb-5 pb-4">
          <div className="tc-panel shadow-sm border p-4 p-lg-5" style={{ borderRadius: 20, background: '#f8fafc' }}>
            <div className="row align-items-center g-4">
              <div className="col-lg-5">
                <span className="tc-eyebrow">Municipal Coverage</span>
                <h2 className="h3 fw-bold text-dark mb-3">Comprehensive City Departments</h2>
                <p className="text-muted mb-4">
                  From streetlights to drainage networks, every municipal service in TrackCivic has automated department ownership and direct field response channels.
                </p>
                <Link to="/report" className="btn btn-teal btn-lg shadow-sm">
                  <i className="bi bi-plus-circle me-2" />
                  Report a Neighborhood Issue
                </Link>
              </div>

              <div className="col-lg-7">
                <div className="row g-3">
                  {departments.map((d) => (
                    <div className="col-sm-6" key={d.name}>
                      <div className="p-3 bg-white rounded-3 shadow-sm border d-flex align-items-start gap-3">
                        <span
                          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 42, height: 42, background: `${d.color}15`, color: d.color, fontSize: '1.2rem' }}
                        >
                          <i className={`bi ${d.icon}`} />
                        </span>
                        <div>
                          <strong className="d-block text-dark small fw-bold">{d.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>{d.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform CTA Banner */}
        <section className="text-center p-5 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #0b1a30 0%, #0d2847 100%)', color: '#ffffff' }}>
          <span className="badge bg-white text-dark mb-3 px-3 py-2 fw-semibold">
            <i className="bi bi-people-fill me-1 text-teal" /> Community First
          </span>
          <h2 className="display-6 fw-bold text-white mb-3" style={{ color: '#ffffff' }}>
            Ready to improve your neighborhood?
          </h2>
          <p className="text-light opacity-75 mx-auto mb-4" style={{ maxWidth: 580 }}>
            Join our open platform to report civic problems, follow real-time maintenance updates, and help build cleaner, safer cities.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/register" className="btn btn-teal btn-lg shadow">
              <i className="bi bi-person-plus-fill me-2" />
              Create Free Citizen Account
            </Link>
            <Link to="/track" className="btn btn-outline-light btn-lg">
              <i className="bi bi-search me-2" />
              Track by Reference Code
            </Link>
            <Link to="/login/admin" className="btn btn-outline-light btn-lg">
              <i className="bi bi-shield-lock me-2" />
              Municipal Login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
