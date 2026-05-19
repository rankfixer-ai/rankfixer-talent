// ============================================================
// js/saved.js â€” Saved jobs
// ============================================================
var Saved = {
  loadIds: async function(){
    if(!App.CU||!App.tok) return;
    try{ var d=await App.api('/api/saved',{},true); if(d.success) d.data.forEach(function(item){ var j=item.job||item.jobs_clean||item; if(j&&j.id) App.savedIds[j.id]=true; }); } catch(e){}
  },

  load: async function(){
    if(!App.CU){ App.$('saved-con').innerHTML='<div class="empty"><div class="empty-icon">ðŸ”–</div><h3>Sign in to see saved jobs</h3></div>'; return; }
    App.$('saved-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
    var d=await App.api('/api/saved',{},true);
    if(d.success&&d.data&&d.data.length){
      App.$('saved-con').innerHTML='<div class="jobs-grid">'+d.data.map(function(item){ var j=item.job||item.jobs_clean||item; return Home.card(j); }).join('')+'</div>';
    } else {
      App.$('saved-con').innerHTML='<div class="empty"><div class="empty-icon">ðŸ”–</div><h3>No saved jobs</h3><p>Browse jobs and tap Save to add them here.</p></div>';
    }
  },

  toggle: async function(id,btn){
    if(!App.CU){ App.openModal('login'); return; }
    var sv=!App.savedIds[id];
    if(sv){ await App.api('/api/saved/'+id,{method:'POST'},true); App.savedIds[id]=true; btn.textContent='â™¥ Saved'; btn.classList.add('saved'); App.toast('Job saved!'); }
    else{ await App.api('/api/saved/'+id,{method:'DELETE'},true); delete App.savedIds[id]; btn.textContent='â™¡ Save'; btn.classList.remove('saved'); App.toast('Removed.'); }
  },

  toggleDetail: async function(id,btn){
    if(!App.CU){ App.openModal('login'); return; }
    var sv=!App.savedIds[id];
    if(sv){ await App.api('/api/saved/'+id,{method:'POST'},true); App.savedIds[id]=true; btn.textContent='â™¥ Saved'; btn.classList.add('active'); App.toast('Job saved!'); }
    else{ await App.api('/api/saved/'+id,{method:'DELETE'},true); delete App.savedIds[id]; btn.textContent='â™¡ Save Job'; btn.classList.remove('active'); App.toast('Removed.'); }
  }
};

