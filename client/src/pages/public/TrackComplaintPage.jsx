import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge.jsx';
import PriorityBadge from '../../components/PriorityBadge.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { complaintService } from '../../services/complaintService.js';
import { getErrorMessage } from '../../services/api.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import { STATUS_ICON } from '../../utils/constants.js';

const REF_RE=/^CF-\d{4}-\d{6}$/;

export default function TrackComplaintPage(){
 useDocumentTitle('Track a complaint');
 const [params,setParams]=useSearchParams();const initial=params.get('ref')||'';const [input,setInput]=useState(initial);const [result,setResult]=useState(null);const [error,setError]=useState('');const [loading,setLoading]=useState(false);
 const lookup=async(ref)=>{const value=ref.trim().toUpperCase();if(!REF_RE.test(value)){setError('Reference numbers look like CF-2026-000123.');setResult(null);return;}setLoading(true);setError('');try{setResult(await complaintService.track(value));setParams({ref:value},{replace:true});}catch(err){setResult(null);setError(getErrorMessage(err));}finally{setLoading(false);}};
 useEffect(()=>{if(initial)lookup(initial);},[]);
 const c=result?.complaint;
 return(
 <div className="tc-track-page">
  <header className="tc-track-header"><div><span className="tc-eyebrow">Public lookup</span><h1>Follow the progress.</h1></div><p>Enter the reference number issued when the report was submitted.</p></header>
  <form className="tc-track-search" onSubmit={(e)=>{e.preventDefault();lookup(input)}} noValidate>
   <span className="input-group-text border-0 bg-transparent"><i className="bi bi-search"/></span>
   <input id="ref" className="form-control text-uppercase" aria-label="Reference number" placeholder="CF-2026-000123" value={input} onChange={(e)=>setInput(e.target.value)} maxLength={14} autoComplete="off"/>
   <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Searching…':'View timeline'}</button>
  </form>
  {loading&&<LoadingSpinner label="Looking up complaint"/>}<ErrorMessage message={error}/>
  {c&&!loading&&<div className="tc-track-result"><article className="tc-track-main">
   <div className="d-flex justify-content-between align-items-start gap-3 mb-3"><div><span className="cf-ref">{c.referenceNumber}</span><h2 className="h3 mt-2 mb-0">{c.title}</h2></div><StatusBadge status={c.status}/></div>
   <div className="tc-detail-grid">
    <div><span>Category</span>{c.category}</div><div><span>Priority</span><PriorityBadge priority={c.priority}/></div><div><span>Area</span>{c.city}</div><div><span>Submitted</span>{formatDate(c.createdAt)}</div><div><span>Department</span>{c.department||'Not yet assigned'}</div><div><span>Reference</span>{c.referenceNumber}</div>
   </div>
  </article><aside className="tc-track-side"><span className="tc-eyebrow text-light">Progress</span><h2 className="h4 mt-2">Current status</h2><div className="my-3"><StatusBadge status={c.status}/></div><ol className="tc-timeline mt-4">{result.timeline.map((t)=><li key={t._id}><span className="tc-timeline-dot"><i className={`bi ${t.action==='ASSIGNED'?'bi-person-badge':STATUS_ICON[t.newStatus]||'bi-flag-fill'}`}/></span><strong>{t.action==='CREATED'?'Complaint submitted':t.action==='ASSIGNED'?'Assigned to a department':t.action==='STATUS_CHANGED'?`Status changed to ${t.newStatus}`:'Progress update'}</strong><time dateTime={t.createdAt}>{formatDateTime(t.createdAt)}</time></li>)}</ol></aside></div>}
 </div>
 );
}
