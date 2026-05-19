// ── TRACKER ──
var ST=[{k:'all',l:'All'},{k:'applied',l:'Applied',c:'#185FA5',bg:'#E6F1FB'},{k:'interviewing',l:'Interviewing',c:'#854F0B',bg:'#FAEEDA'},{k:'offered',l:'Offered',c:'#3B6D11',bg:'#EAF3DE'},{k:'rejected',l:'Rejected',c:'#8B1A1A',bg:'#FBEAEA'}];
async function loadTracker(){
  if(!CU){ $('trk-con').innerHTML='<div class="empty"><div class="empty-icon">📋</div><h3>Sign in to track applications</h3></div>'; return; }
  allApps=[];
  $('trk-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
  var d=await api('/api/applications',{},true);
  if(d.success){ allApps=d.data||[]; renderTracker(); }
  else { $('trk-con').innerHTML='<div class="empty"><div class="empty-icon">📋</div><h3>No applications yet</h3><p>Open a job and click "+ Track Application".</p></div>'; }
}
function renderTracker(){
  var counts={}; ST.forEach(function(s){ counts[s.k]=s.k==='all'?allApps.length:allApps.filter(function(a){ return a.status===s.k; }).length; });
  $('trk-tabs').innerHTML=ST.map(function(s){ return'<button class="status-tab'+(trkFilter===s.k?' active':'')+('" onclick="setTrkF(\''+s.k+'\')">')+s.l+(counts[s.k]>0?' ('+counts[s.k]+')':[])+'</button>'; }).join('');
  var fl=trkFilter==='all'?allApps:allApps.filter(function(a){ return a.status===trkFilter; });
  if(!fl.length){ $('trk-con').innerHTML='<div class="empty"><div class="empty-icon">📋</div><h3>No applications</h3><p>Open a job and click "Track Application".</p></div>'; return; }
  $('trk-con').innerHTML=fl.map(function(a){
    var st=ST.find(function(s){ return s.k===a.status; })||ST[1];
    return'<div class="app-card">'
      +'<div style="flex:1"><div class="app-title">'+esc(a.jobs_clean&&a.jobs_clean.title?a.jobs_clean.title:'Job')+'</div>'
      +'<div class="app-co">'+esc(a.jobs_clean&&a.jobs_clean.company?a.jobs_clean.company:'Company')+'</div>'
      +'<div class="app-meta"><span class="status-badge" style="background:'+st.bg+';color:'+st.c+'">'+st.l+'</span><span class="age-txt">'+ago(a.applied_at)+'</span></div>'
      +(a.notes?'<div class="app-notes">'+esc(a.notes)+'</div>':'')+'</div>'
      +'<div class="app-actions">'
      +'<select class="st-select" onchange="updApp(\''+a.id+'\',this.value)">'+ST.filter(function(s){ return s.k!=='all'; }).map(function(s){ return'<option value="'+s.k+('"'+(a.status===s.k?' selected':'')+'>')+s.l+'</option>'; }).join('')+'</select>'
      +'<button class="del-btn" onclick="delApp(\''+a.id+'\')">× Remove</button>'
      +'</div></div>';
  }).join('');
}
function setTrkF(f){ trkFilter=f; renderTracker(); }
async function updApp(id,status){ await api('/api/applications/'+id,{method:'PUT',body:JSON.stringify({status:status})},true); allApps=allApps.map(function(a){ return a.id===id?Object.assign({},a,{status:status}):a; }); renderTracker(); toast('Status updated.'); }
async function delApp(id){ await api('/api/applications/'+id,{method:'DELETE'},true); allApps=allApps.filter(function(a){ return a.id!==id; }); renderTracker(); toast('Removed.'); }
