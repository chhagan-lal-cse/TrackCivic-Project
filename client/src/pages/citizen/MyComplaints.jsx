import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import SearchFilterBar from '../../components/SearchFilterBar.jsx';
import ComplaintTable from '../../components/ComplaintTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import {useAsync} from '../../hooks/useAsync.js';import {useDebounce} from '../../hooks/useDebounce.js';import {useDocumentTitle} from '../../hooks/useDocumentTitle.js';import {useQueryFilters} from '../../hooks/useQueryFilters.js';import {complaintService} from '../../services/complaintService.js';
const KEYS=['search','status','category','from','to','sort'];
export default function MyComplaints(){useDocumentTitle('Complaint history');const[filters,setFilters,reset]=useQueryFilters(KEYS,{sort:'newest'});const[search,setSearch]=useState(filters.search||'');const debounced=useDebounce(search);useEffect(()=>{if((filters.search||'')!==debounced)setFilters({...filters,search:debounced,page:1});},[debounced]);const query={...filters,limit:10};const{data,loading,error,reload}=useAsync(()=>complaintService.list(query),[JSON.stringify(query)]);const complaints=data?.data?.complaints||[];const hasFilters=KEYS.some(k=>k!== 'sort'&&filters[k]);
 return<>
 <header className="tc-page-head"><div><span className="tc-eyebrow">Citizen workspace</span><h1>Complaint history</h1><p>Search, filter and open each report.</p></div><Link to="/dashboard/complaints/new" className="btn btn-teal"><i className="bi bi-plus-lg me-1"/>Submit report</Link></header>
 <div className="tc-filter-shell"><SearchFilterBar values={{...filters,search}} onChange={(v)=>{if(v.search!==search)setSearch(v.search);else setFilters(v)}} onReset={()=>{setSearch('');reset();}} show={['search','status','category','dates','sort']} searchPlaceholder="Search title or reference"/></div>
 <div className="tc-table-shell">
   {loading && <div className="p-3"><LoadingSpinner label="Loading reports" /></div>}
   <ErrorMessage message={error} onRetry={reload} />
   {!loading && !error && complaints.length === 0 && (
     <EmptyState
       icon="bi-funnel"
       title={hasFilters ? 'No reports match' : 'No reports submitted'}
       message={hasFilters ? 'Clear or adjust the filters.' : 'Submit an issue to begin its TrackCivic timeline.'}
       action={hasFilters
         ? <button type="button" className="btn btn-light" onClick={() => { setSearch(''); reset(); }}>Clear filters</button>
         : <Link to="/dashboard/complaints/new" className="btn btn-primary">Submit report</Link>}
     />
   )}
   {!loading && !error && complaints.length > 0 && (
     <>
       <ComplaintTable complaints={complaints} linkBase="/dashboard/complaints" />
       <div className="p-3">
         <Pagination meta={data.meta} onPageChange={(page) => setFilters({ ...filters, page })} />
       </div>
     </>
   )}
 </div>
 </>;
}
