// ── SAVE ──
async function loadSavedIds(){
  if(!CU||!tok) return;
  try{ var d=await api('/api/saved',{},true); if(d.success) d.data.forEach(function(item){ var j=item.job||item.jobs_clean||item; if(j&&j.id) savedIds[j.id]=true; }); } catch(e){}
}
async function togSave(id,btn){
  if(!CU){ openModal('login'); return; }
  var sv=!savedIds[id];
  if(sv){ await api('/api/saved/'+id,{method:'POST'},true); savedIds[id]=true; btn.textContent='♥ Saved'; btn.classList.add('saved'); toast('Job saved!'); }
  else{ await api('/api/saved/'+id,{method:'DELETE'},true); delete savedIds[id]; btn.textContent='♡ Save'; btn.classList.remove('saved'); toast('Removed.'); }
}
async function togSaveDetail(id,btn){
  if(!CU){ openModal('login'); return; }
  var sv=!savedIds[id];
  if(sv){ await api('/api/saved/'+id,{method:'POST'},true); savedIds[id]=true; btn.textContent='♥ Saved'; btn.classList.add('active'); toast('Job saved!'); }
  else{ await api('/api/saved/'+id,{method:'DELETE'},true); delete savedIds[id]; btn.textContent='♡ Save Job'; btn.classList.remove('active'); toast('Removed.'); }
}
async function trackApp(id){
  if(!CU){ openModal('login'); return; }
  try{ await api('/api/applications',{method:'POST',body:JSON.stringify({job_id:id})},true); toast('✅ Application tracked!'); }
  catch(e){ toast(e.message.indexOf('tracked')>-1?'Already tracking this job.':'Could not track.'); }
}

// ── SAVED PAGE ──
async function loadSaved(){
  if(!CU){ $('saved-con').innerHTML='<div class="empty"><div class="empty-icon">🔖</div><h3>Sign in to see saved jobs</h3><p><button class="search-btn" style="display:inline-block;margin-top:1rem" onclick="openModal(\'login\')">Sign In</button></p></div>'; return; }
  $('saved-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
  var d=await api('/api/saved',{},true);
  if(d.success&&d.data&&d.data.length){
    $('saved-con').innerHTML='<div class="jobs-grid">'+d.data.map(function(item){
      var j=item.job||item.jobs_clean||item;
      return jobCardHtml(j);
    }).join('')+'</div>';
  } else {
    $('saved-con').innerHTML='<div class="empty"><div class="empty-icon">🔖</div><h3>No saved jobs</h3><p>Browse jobs and tap Save to add them here.</p></div>';
  }
}
