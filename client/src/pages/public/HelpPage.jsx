import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const FAQS=[
['Do I need an account to report an issue?','Yes. An account lets you manage reports and receive updates. Public tracking works with only a reference number.'],
['Where do I find my reference number?','It is shown after submission and on the complaint history page. It looks like CF-2026-000123.'],
['Can I edit or delete a complaint?','You can edit or delete while it is Pending. After review starts, the original record remains locked.'],
['Who can see my complaint?','The public sees limited title, category, area and status. Personal information is not public.'],
['What photos can I attach?','One JPEG, PNG or WebP image up to 2 MB.'],
['What should I do in an emergency?','TrackCivic is not an emergency service. For danger or immediate risk, call the appropriate emergency number.']
];
export default function HelpPage(){useDocumentTitle('Help and FAQ');const [open,setOpen]=useState(0);return(
<div className="tc-page-shell"><header className="tc-info-head"><span className="tc-eyebrow">Help centre</span><h1>Answers when you need them.</h1><p>Common questions about submitting, following and managing civic reports.</p></header>
<div className="accordion"><h2 className="visually-hidden">Frequently asked questions</h2>{FAQS.map(([q,a],i)=><div className="accordion-item" key={q}><h3 className="accordion-header"><button type="button" className={`accordion-button ${open===i?'':'collapsed'}`} onClick={()=>setOpen(open===i?-1:i)}>{q}</button></h3><div className={`accordion-collapse collapse ${open===i?'show':''}`}><div className="accordion-body text-muted">{a}</div></div></div>)}</div>
<div className="tc-panel mt-5"><h2 className="h5">Need to act now?</h2><p className="text-muted mb-3">Submit a report or locate progress using a reference number.</p><div className="d-flex gap-2 flex-wrap"><Link to="/report" className="btn btn-primary">Submit report</Link><Link to="/track" className="btn btn-outline-primary">Track complaint</Link></div></div></div>);
}
