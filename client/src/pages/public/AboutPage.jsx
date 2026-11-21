import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function AboutPage(){useDocumentTitle('About TrackCivic');return(
<div className="tc-page-shell"><header className="tc-info-head"><span className="tc-eyebrow">About TrackCivic</span><h1>Public reports. Visible progress.</h1><p>TrackCivic connects residents with the teams responsible for streets, utilities and shared public spaces.</p></header>
<div className="row g-5"><div className="col-lg-5"><h2 className="h4">The working principle</h2><p className="text-muted">Every report is a clear, trackable record—from its first detail through review, assignment and resolution.</p></div><div className="col-lg-7"><div className="tc-process" style={{gridTemplateColumns:'repeat(2,1fr)'}}>{[['01','Record','A citizen submits a precise report.'],['02','Route','A department reviews and accepts responsibility.'],['03','Resolve','Field teams record work and status.'],['04','Close','The final result stays visible in the timeline.']].map(([n,t,d])=><article className="tc-process-step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></div></div>
<div className="alert alert-light border mt-5"><strong>Project notice.</strong> TrackCivic is a civic complaint management platform. Demo contact details are not real municipal services.</div><Link to="/report" className="btn btn-primary mt-2">Submit a report</Link></div>);
}
