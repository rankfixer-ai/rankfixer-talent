// ── PAGES ──
function go(name){
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.nav-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.mob-tab').forEach(function(b){ b.classList.remove('active'); });
  var pg=$('page-'+name);
  if(pg) pg.classList.add('active');
  var nb=$('nav-'+name);
  if(nb) nb.classList.add('active');
  var mb=$('mobt-'+name);
  if(mb) mb.classList.add('active');
  window.scrollTo(0,0);
  if(name==='home')        loadHome();
  if(name==='search')      doSearch();
  if(name==='saved')       loadSaved();
  if(name==='tracker')     loadTracker();
  if(name==='profile')     loadProfile();
  if(name==='employer'){
    if(!CU||!CU.user_metadata||(CU.user_metadata.role!=='employer'&&CU.user_metadata.role!=='admin')){ openModal('login'); return; }
    loadEmpStats(); loadEmpJobs();
  }
  if(name==='admin'){
    if(!CU||!CU.user_metadata||CU.user_metadata.role!=='admin'){ go('home'); toast('Access denied.'); return; }
    loadAdmin();
  }
}
function goBack(){ go(prevPage||'search'); }
