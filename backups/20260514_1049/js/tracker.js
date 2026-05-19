var Tracker={
  ST:[{k:'all',l:'All'},{k:'applied',l:'Applied',c:'#185FA5',bg:'#E6F1FB'},{k:'interviewing',l:'Interviewing',c:'#854F0B',bg:'#FAEEDA'},{k:'offered',l:'Offered',c:'#3B6D11',bg:'#EAF3DE'},{k:'rejected',l:'Rejected',c:'#8B1A1A',bg:'#FBEAEA'}],
  filter:'all', apps:[],
  load:async function(){
    if(!App.CU){ App.$('trk-con').innerHTML='<div class="empty"><h3>Sign in to track applications</h3></div>'; return; }
    Tracker.apps=[]; App.$('trk-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
    var d=await App.api('/api/applications',{},true);
    if(d.success){ Tracker.apps=d.data||[]; Tracker.render(); }
    else App.$('trk-con').innerHTML='<div class="empty"><h3>No applications yet</h3></div>';
  },
  track:async function(id){ if(!App.CU){ App.openModal('login'); return; } try{ await App.api('/api/applications',{method:'POST',body:JSON.stringify({job_id:id})},true); App.toast('Tracked!'); } catch(e){ App.toast('Already tracking.'); } },
  render:function(){
    var counts={}; Tracker.ST.forEach(function(s){ counts[s.k]=s.k==='all'?Tracker.apps.length:Tracker.apps.filter(function(a){return a.status===s.k;}).length; });
    App.$('trk-tabs').innerHTML=Tracker.ST.map(function(s){ return '<button class="status-tab'+(Tracker.filter===s.k?' active':'')+'" onclick="Tracker.setFilter(\''+s.k+'\')">'+s.l+(counts[s.k]>0?' ('+counts[s.k]+')':'')+'</button>'; }).join('');
    var fl=Tracker.filter==='all'?Tracker.apps:Tracker.apps.filter(function(a){return a.status===Tracker.filter;});
    if(!fl.length){ App.$('trk-con').innerHTML='<div class="empty"><h3>No applications</h3></div>'; return; }
    App.$('trk-con').innerHTML=fl.map(function(a){ var st=Tracker.ST.find(function(s){return s.k===a.status;})||Tracker.ST[1]; return '<div class="app-card"><div style="flex:1"><div class="app-title">'+App.esc(a.jobs_clean&&a.jobs_clean.title?a.jobs_clean.title:'Job')+'</div><div class="app-co">'+App.esc(a.jobs_clean&&a.jobs_clean.company?a.jobs_clean.company:'Company')+'</div><div class="app-meta"><span class="status-badge" style="background:'+st.bg+';color:'+st.c+'">'+st.l+'</span><span class="age-txt">'+App.ago(a.applied_at)+'</span></div></div><div class="app-actions"><select class="st-select" onchange="Tracker.update(\''+a.id+'\',this.value)">'+Tracker.ST.filter(function(s){return s.k!=='all';}).map(function(s){return '<option value="'+s.k+'"'+(a.status===s.k?' selected':'')+'>'+s.l+'</option>';}).join('')+'</select><button class="del-btn" onclick="Tracker.remove(\''+a.id+'\')">Ã— Remove</button></div></div>'; }).join('');
  },
  setFilter:function(f){ Tracker.filter=f; Tracker.render(); },
  update:async function(id,status){ await App.api('/api/applications/'+id,{method:'PUT',body:JSON.stringify({status:status})},true); Tracker.apps=Tracker.apps.map(function(a){return a.id===id?Object.assign({},a,{status:status}):a;}); Tracker.render(); App.toast('Updated.'); },
  remove:async function(id){ await App.api('/api/applications/'+id,{method:'DELETE'},true); Tracker.apps=Tracker.apps.filter(function(a){return a.id!==id;}); Tracker.render(); App.toast('Removed.'); }
};

