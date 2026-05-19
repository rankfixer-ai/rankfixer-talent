var API = 'https://jobcopilot-api-zeuk.onrender.com';
var tok = localStorage.getItem('_jc_tok') || null;
var CU  = (function(){ try{ return JSON.parse(localStorage.getItem('_jc_user') || 'null'); } catch(e){ localStorage.removeItem('_jc_user'); return null; } })();
var savedIds = {};
var curPage = 1, totPages = 1, remOnly = false, prevPg = 'home';
var modalMode = 'login', newSkillProf = 3;
var sugTimer = null, trkFilter = 'all', allApps = [];
var adminLoaded = false;

// -- UTILS --
function $(id){ return document.getElementById(id); }
function esc(s){ if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function ago(d){ if(!d)return''; var diff=Math.floor((Date.now()-new Date(d))/86400000); if(diff===0)return'Today'; if(diff===1)return'Yesterday'; if(diff<7)return diff+'d ago'; if(diff<30)return Math.floor(diff/7)+'w ago'; return Math.floor(diff/30)+'mo ago'; }
function fmtSal(mn,mx,c){ if(!mn&&!mx)return null; c=c||'₱'; var f=function(n){return n>=1000?Math.round(n/1000)+'k':n;}; if(mn&&mx)return c+f(mn)+'–'+f(mx); if(mx)return'Up to '+c+f(mx); return c+f(mn)+'+'; }
function ini(n){ return(n||'?').trim()[0].toUpperCase(); }
function toast(m,d){ var t=$('toast'); t.textContent=m; t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); },d||3000); }
function starsHtmlInline(n){
  var h='<div class="stars">';
  for(var i=1;i<=5;i++) h+='<span class="'+(i<=n?'on':'off')+'">★</span>';
  return h+'</div>';
}

async function api(path,opts,auth){
  var h={'Content-Type':'application/json'};
  if(auth&&tok) h['Authorization']='Bearer '+tok;
  opts=opts||{};
  var r=await fetch(API+path,Object.assign({},opts,{headers:Object.assign({},h,opts.headers||{})}));
  if(r.status===401&&auth){ doLogout(); throw new Error('Session expired'); }
  return r.json();
}

// -- NAV --
function updateNav(){
  var a=!!CU;
  if(a){
    var letter=ini(CU.name||CU.email||'U');
    var sets=getSettings();
    $('nav-auth').innerHTML='<div class="nav-user-wrap" id="nav-user-wrap">'
      +'<button class="nav-av-btn" onclick="togNavDD()" title="'+(CU.name||CU.email||'Account')+'">'+letter+'</button>'
      +'<div class="nav-dropdown" id="nav-dd">'
      +'<button class="nav-dd-item" onclick="closeNavDD();go(\'profile\')">👤 My Profile</button>'
      +'<button class="nav-dd-item" onclick="closeNavDD();go(\'saved\')">⭐ Saved Jobs</button>'
      +'<button class="nav-dd-item" onclick="closeNavDD();go(\'tracker\')">📋 Applications</button>'
      +'<div class="nav-dd-divider"></div>'
      +'<div class="nav-dd-section">Settings</div>'
      +'<div class="nav-dd-row" onclick="togNotif()">'
      +'<span class="nav-dd-row-label">Notifications</span>'
      +'<div class="toggle'+(sets.notif?' on':'')+'" id="notif-tog"></div>'
      +'</div>'
      +'<div class="nav-dd-row" onclick="togPrivacy()">'
      +'<span class="nav-dd-row-label">Public Profile</span>'
      +'<div class="toggle'+(sets.pub?' on':'')+'" id="pub-tog"></div>'
      +'</div>'
      +'<div class="nav-dd-divider"></div>'
      +'<button class="nav-dd-item danger" onclick="closeNavDD();doLogout()">Sign Out</button>'
      +'</div></div>';
  } else {
    $('nav-auth').innerHTML='<button class="nav-signin" onclick="openModal(\'login\')">Sign In</button>'
      +'<button class="nav-signup" onclick="openModal(\'register\')">Sign Up</button>';
  }
  $('nav-saved').style.display    = a?'':'none';
  $('nav-tracker').style.display  = a?'':'none';
  $('nav-employer').style.display = (a&&CU&&(CU.role==='employer'||CU.role==='admin'))?'':'none';
  $('nav-admin').style.display    = (a&&CU&&CU.email&&CU.email.indexOf('admin')>-1)?'':'none';
  var ms=$('mobt-saved');    if(ms) ms.style.display=a?'':'none';
  var mt=$('mobt-tracker');  if(mt) mt.style.display=a?'':'none';
  var pl=$('mobt-profile-label'); if(pl) pl.textContent=a?(CU.name||'Profile'):'';
  var mp=$('mobt-profile'); if(mp) mp.style.display=a?'':'none';
}
function togNavDD(){ var dd=$('nav-dd'); if(dd) dd.classList.toggle('open'); }
function closeNavDD(){ var dd=$('nav-dd'); if(dd) dd.classList.remove('open'); }
function getSettings(){ try{ return JSON.parse(localStorage.getItem('_jc_settings')||'{"notif":true,"pub":true}'); }catch(e){ return {notif:true,pub:true}; } }
function saveSettings(s){ localStorage.setItem('_jc_settings',JSON.stringify(s)); }
function togNotif(){ var s=getSettings(); s.notif=!s.notif; saveSettings(s); var t=$('notif-tog'); if(t) t.classList.toggle('on',s.notif); toast(s.notif?'Notifications on':'Notifications off'); }
function togPrivacy(){ var s=getSettings(); s.pub=!s.pub; saveSettings(s); var t=$('pub-tog'); if(t) t.classList.toggle('on',s.pub); toast(s.pub?'Profile is now public':'Profile is now private'); }

// -- PAGES --
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
  if(name==='employer'){ loadEmpStats(); loadEmpJobs(); }
  if(name==='admin')       loadAdmin();
}
function goBack(){ go(prevPage||'search'); }

// -- AUTH MODAL --
function openModal(mode){ modalMode=mode; renderModal(); $('auth-modal').classList.add('open'); }
function closeModal(){ $('auth-modal').classList.remove('open'); }
function switchMode(){ modalMode=modalMode==='login'?'register':'login'; renderModal(); }
function renderModal(){
  var isL=modalMode==='login';
  $('m-title').textContent=isL?'Welcome back.':'Create account.';
  $('m-sub').innerHTML=isL?'Don\'t have an account? <span onclick="switchMode()">Sign up free</span>':'Already have an account? <span onclick="switchMode()">Sign in</span>';
  $('m-name-wrap').style.display=isL?'none':'block';
  $('m-submit').textContent=isL?'Sign In':'Create Account';
  $('m-error').classList.remove('show');
}
async function submitAuth(){
  var email=$('m-email').value.trim(), pass=$('m-pass').value;
  var err=$('m-error');
  if(!email||!pass){ err.textContent='Email and password required.'; err.classList.add('show'); return; }
  $('m-submit').disabled=true; $('m-submit').textContent='Please wait…';
  try{
    var res;
    if(modalMode==='login'){
      res=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:email,password:pass})});
    } else {
      var name=$('m-name').value.trim(), role=$('m-role').value;
      res=await api('/api/auth/register',{method:'POST',body:JSON.stringify({email:email,password:pass,full_name:name,role:role})});
      if(res.success){ toast('📧 Check your email to confirm.'); closeModal(); $('m-submit').disabled=false; renderModal(); return; }
    }
    if(!res.success) throw new Error(res.error||'Authentication failed');
    tok=res.data.session.access_token; CU=res.data.user;
    localStorage.setItem('_jc_tok',tok);
    localStorage.setItem('_jc_user',JSON.stringify(CU));
    closeModal(); updateNav(); toast('Welcome! 👋'); loadSavedIds();
  } catch(e){ err.textContent=e.message; err.classList.add('show'); }
  finally{ $('m-submit').disabled=false; renderModal(); }
}
function doLogout(){
  tok=null; CU=null; savedIds={};
  localStorage.removeItem('_jc_tok'); localStorage.removeItem('_jc_user');
  updateNav(); go('home'); toast('Signed out.');
}

// -- HOME --
async function loadHome(){
  try{
    var s=await api('/api/stats');
    if(s.success){ $('stat-total').textContent=(s.data.totalJobs||0).toLocaleString(); $('stat-remote').textContent=(s.data.remoteJobs||0).toLocaleString(); }
    var j=await api('/api/jobs?limit=6');
    $('home-jobs').innerHTML=(j.success&&j.data.length)?j.data.map(jobCardHtml).join(''):'<div class="empty"><div class="empty-icon">📋</div><h3>No jobs yet</h3></div>';
  } catch(e){ $('home-jobs').innerHTML='<div class="empty"><p>Could not load jobs.</p></div>'; }
}
function heroSearch(){ $('s-kw').value=$('h-kw').value.trim(); go('search'); }
function qSearch(kw){ $('s-kw').value=kw; go('search'); }

function jobCardHtml(j){
  var sal=fmtSal(j.salary_min,j.salary_max,j.salary_currency);
  var isR=j.remote_type==='remote';
  var isN=j.posted_at&&(Date.now()-new Date(j.posted_at))/86400000<2;
  return '<div class="job-card" onclick="openJob(\''+esc(j.id)+'\',\'home\')">'
    +'<div class="card-top"><div class="av">'+ini(j.company)+'</div>'
    +'<div><div class="card-title">'+esc(j.title)+'</div><div class="card-company">'+esc(j.company||'Company')+'</div></div></div>'
    +'<div class="tags">'
    +(j.city?'<span class="tag">📍 '+esc(j.city)+'</span>':'')
    +(isR?'<span class="tag remote">🏠 Remote</span>':'')
    +(j.employment_type?'<span class="tag">'+esc(j.employment_type)+'</span>':'')
    +(sal?'<span class="tag salary">'+sal+'</span>':'')
    +(isN?'<span class="tag new-tag">New</span>':'')
    +'</div>'
    +'<div class="card-footer"><span>'+esc(j.source&&j.source.name?j.source.name:'Job Board')+'</span><span>'+ago(j.posted_at)+'</span></div>'
    +'</div>';
}

// -- SEARCH --
async function doSearch(){
  var kwEl=$('s-kw'); var kw=String(kwEl?kwEl.value:'').trim();
  var cityEl=$('s-city'); var city=String(cityEl?cityEl.value:'').trim();
  curPage=1;
  var con=$('jobs-con'), meta=$('res-meta');
  if(!con) return;
  con.innerHTML='<div class="loading"><div class="spinner"></div></div>';
  if(meta) meta.style.display='none';
  $('pg').innerHTML='';
  var p=new URLSearchParams({page:1,limit:15});
  if(kw) p.set('keyword',kw); if(city) p.set('city',city); if(remOnly) p.set('remote','true');
  var d=await api('/api/jobs?'+p);
  if(!d.success){ con.innerHTML='<div class="empty"><p>Could not load jobs.</p></div>'; return; }
  totPages=d.totalPages||1;
  if(meta){ meta.style.display='flex'; $('res-count').innerHTML='Showing <strong>'+d.data.length+'</strong> of <strong>'+(d.total||0).toLocaleString()+'</strong>'+(kw?' for "<strong>'+esc(kw)+'</strong>"':''); }
  con.innerHTML=d.data.length?'<div class="jobs-list">'+d.data.map(listCardHtml).join('')+'</div>':'<div class="empty"><div class="empty-icon">📍</div><h3>No jobs found</h3><p>Try different keywords.</p></div>';
  renderPg();
}
async function loadJobsPage(pg){
  curPage=pg;
  var kwEl=$('s-kw'); var kw=String(kwEl?kwEl.value:'').trim();
  var cityEl=$('s-city'); var city=String(cityEl?cityEl.value:'').trim();
  var p=new URLSearchParams({page:pg,limit:15});
  if(kw) p.set('keyword',kw); if(city) p.set('city',city); if(remOnly) p.set('remote','true');
  var d=await api('/api/jobs?'+p);
  if(!d.success) return;
  totPages=d.totalPages||1;
  $('res-count').innerHTML='Showing <strong>'+d.data.length+'</strong> of <strong>'+(d.total||0).toLocaleString()+'</strong>'+(kw?' for "<strong>'+esc(kw)+'</strong>"':'');
  $('jobs-con').innerHTML=d.data.length?'<div class="jobs-list">'+d.data.map(listCardHtml).join('')+'</div>':'<div class="empty"><h3>No jobs found</h3></div>';
  renderPg(); window.scrollTo(0,0);
}
function listCardHtml(j){
  var sal=fmtSal(j.salary_min,j.salary_max,j.salary_currency);
  var isR=j.remote_type==='remote'; var sv=savedIds[j.id];
  return '<div class="list-card" onclick="openJob(\''+esc(j.id)+'\',\'search\')">'
    +'<div class="av" style="width:48px;height:48px;flex-shrink:0">'+ini(j.company)+'</div>'
    +'<div class="list-body">'
    +'<div class="list-title">'+esc(j.title)+'</div>'
    +'<div class="list-company">'+esc(j.company||'Company')+(j.city?' · '+esc(j.city):'')+'</div>'
    +'<div class="tags" style="margin-top:6px">'+(isR?'<span class="tag remote">Remote</span>':'')+(j.employment_type?'<span class="tag">'+esc(j.employment_type)+'</span>':'')+(sal?'<span class="tag salary">'+sal+'</span>':'')+'</div>'
    +(j.snippet?'<div class="list-snippet">'+esc(j.snippet)+'</div>':'')
    +'</div>'
    +'<div class="list-right"><span>'+ago(j.posted_at)+'</span>'
    +(CU?'<button class="save-btn'+(sv?' saved':'')+('" onclick="event.stopPropagation();togSave(\''+esc(j.id)+'\',this)">'+(sv?'♥ Saved':'♡ Save')+'</button>'):'')
    +'<span>'+esc(j.source&&j.source.name?j.source.name:'')+'</span></div>'
    +'</div>';
}
function renderPg(){
  if(totPages<=1){ $('pg').innerHTML=''; return; }
  var h='<button class="page-btn" onclick="loadJobsPage('+(curPage-1)+')" '+(curPage===1?'disabled':'')+'">← Prev</button>';
  var s=Math.max(1,curPage-2), e=Math.min(totPages,curPage+2);
  if(s>1) h+='<button class="page-btn" onclick="loadJobsPage(1)">1</button>'+(s>2?'<span style="color:var(--text-muted);padding:0 4px">…</span>':'');
  for(var i=s;i<=e;i++) h+='<button class="page-btn'+(i===curPage?' active':'')+('" onclick="loadJobsPage('+i+')">')+i+'</button>';
  if(e<totPages) h+=(e<totPages-1?'<span style="color:var(--text-muted);padding:0 4px">…</span>':'')+' <button class="page-btn" onclick="loadJobsPage('+totPages+')">'+totPages+'</button>';
  h+='<button class="page-btn" onclick="loadJobsPage('+(curPage+1)+')" '+(curPage===totPages?'disabled':'')+'">Next →</button>';
  $('pg').innerHTML=h;
}
function togRem(){ remOnly=!remOnly; $('rem-tog').classList.toggle('on',remOnly); }
async function fetchSug(q){
  clearTimeout(sugTimer);
  var box=$('sug-box');
  if(q.length<2){ box.classList.remove('open'); return; }
  sugTimer=setTimeout(async function(){
    var d=await api('/api/search/suggest?q='+encodeURIComponent(q));
    if(d.success&&d.data&&d.data.length){
      box.innerHTML=d.data.map(function(s){
        var text=typeof s==='string'?s:(s.title||s.name||String(s));
        return'<div class="suggest-item" onmousedown="pickSug(\''+esc(text)+'\')">'+esc(text)+'</div>';
      }).join('');
      box.classList.add('open');
    } else box.classList.remove('open');
  },250);
}
function pickSug(v){ $('s-kw').value=v; $('sug-box').classList.remove('open'); doSearch(); }
document.addEventListener('click',function(e){
  if(!e.target.closest('.toolbar-wrap')&&$('sug-box')) $('sug-box').classList.remove('open');
  if(!e.target.closest('#nav-user-wrap')){ var dd=$('nav-dd'); if(dd) dd.classList.remove('open'); }
});

// -- JOB DETAIL --
async function openJob(id,from){
  prevPage=from||'search'; go('detail');
  $('detail-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
  var d=await api('/api/jobs/'+id);
  if(!d.success){ $('detail-con').innerHTML='<div class="empty"><p>Job not found.</p></div>'; return; }
  $('detail-con').innerHTML=detailHtml(d.data);
  injectJobSchema(d.data);
}
function injectJobSchema(j){
  var el = document.getElementById('job-schema');
  if(el) el.remove();
  var schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': j.title || '',
    'description': (j.description || j.snippet || '').replace(/<[^>]*>/g,'').slice(0,500),
    'datePosted': j.posted_at || '',
    'hiringOrganization': { '@type': 'Organization', 'name': j.company || 'Company' },
    'jobLocation': {
      '@type': 'Place',
      'address': { '@type': 'PostalAddress', 'addressLocality': j.city || '', 'addressCountry': 'PH' }
    },
    'employmentType': j.employment_type || 'FULL_TIME',
    'jobLocationType': j.remote_type === 'remote' ? 'TELECOMMUTE' : 'ONSITE'
  };
  if(j.salary_min || j.salary_max){
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      'currency': j.salary_currency || 'PHP',
      'value': {
        '@type': 'QuantitativeValue',
        'minValue': j.salary_min || j.salary_max,
        'maxValue': j.salary_max || j.salary_min,
        'unitText': 'MONTH'
      }
    };
  }
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'job-schema';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
function detailHtml(j){
  var sal=fmtSal(j.salary_min,j.salary_max,j.salary_currency);
  var isR=j.remote_type==='remote'; var sv=savedIds[j.id];
  var h='<div class="detail-card"><div class="detail-hdr">';
  h+='<div class="detail-av">'+ini(j.company)+'</div>';
  h+='<div class="detail-title">'+esc(j.title)+'</div>';
  h+='<div class="detail-co">'+esc(j.company||'Company')+(j.location?' · '+esc(j.location):'')+'</div>';
  h+='<div class="detail-tags">';
  if(j.city) h+='<span class="detail-tag">📍 '+esc(j.city)+'</span>';
  if(isR)    h+='<span class="detail-tag remote">🏠 Remote / WFH</span>';
  if(j.employment_type) h+='<span class="detail-tag">'+esc(j.employment_type)+'</span>';
  if(sal)    h+='<span class="detail-tag salary">💰 '+sal+'</span>';
  h+='<span class="detail-tag">📅 '+ago(j.posted_at)+'</span>';
  if(j.source&&j.source.name) h+='<span class="detail-tag">via '+esc(j.source.name)+'</span>';
  h+='</div><div class="detail-actions">';
  if(j.job_url) h+='<a href="'+esc(j.job_url)+'" target="_blank" rel="noopener" class="apply-btn">Apply Now →</a>';
  else h+='<button class="apply-btn" style="opacity:.5;cursor:default">Application closed</button>';
  if(CU) h+='<button class="outline-btn'+(sv?' active':'')+('" onclick="togSaveDetail(\''+esc(j.id)+'\',this)">'+(sv?'★ Saved':'☆ Save Job')+'</button>');
  if(CU) h+='<button class="outline-btn" onclick="trackApp(\''+esc(j.id)+'\')">+ Track Application</button>';
  h+='</div></div><div class="detail-body">';
  if(j.city||isR||j.employment_type||sal){
    h+='<div class="detail-grid">';
    if(j.city) h+='<div class="info-item"><div class="info-label">Location</div><div class="info-value">'+esc(j.city)+'</div></div>';
    if(isR)    h+='<div class="info-item"><div class="info-label">Work Setup</div><div class="info-value">Remote / WFH</div></div>';
    if(j.employment_type) h+='<div class="info-item"><div class="info-label">Job Type</div><div class="info-value">'+esc(j.employment_type)+'</div></div>';
    if(sal)    h+='<div class="info-item"><div class="info-label">Salary</div><div class="info-value">'+sal+'</div></div>';
    h+='</div>';
  }
  if(j.description||j.snippet){
    var desc = esc(j.description||j.snippet);
    desc = desc.split(/\n\n+/).map(function(p){ return '<p>'+p.replace(/\n/g,'<br>')+'</p>'; }).join('');
    h+='<div class="detail-sec"><h3>About this role</h3>'+desc+'</div>';
  }
  if(j.source&&j.source.name) h+='<p style="font-size:.8rem;color:var(--text-muted)">📌 Sourced from <strong>'+esc(j.source.name)+'</strong></p>';
  return h+'</div></div>';
}

// -- SAVE --
async function loadSavedIds(){
  if(!CU||!tok) return;
  try{ var d=await api('/api/saved',{},true); if(d.success) d.data.forEach(function(item){ var j=item.job||item.jobs_clean||item; if(j&&j.id) savedIds[j.id]=true; }); } catch(e){}
}
async function togSave(id,btn){
  if(!CU){ openModal('login'); return; }
  var sv=!savedIds[id];
  if(sv){ await api('/api/saved/'+id,{method:'POST'},true); savedIds[id]=true; btn.textContent='★ Saved'; btn.classList.add('saved'); toast('Job saved!'); }
  else{ await api('/api/saved/'+id,{method:'DELETE'},true); delete savedIds[id]; btn.textContent='☆ Save'; btn.classList.remove('saved'); toast('Removed.'); }
}
async function togSaveDetail(id,btn){
  if(!CU){ openModal('login'); return; }
  var sv=!savedIds[id];
  if(sv){ await api('/api/saved/'+id,{method:'POST'},true); savedIds[id]=true; btn.textContent='★ Saved'; btn.classList.add('active'); toast('Job saved!'); }
  else{ await api('/api/saved/'+id,{method:'DELETE'},true); delete savedIds[id]; btn.textContent='☆ Save Job'; btn.classList.remove('active'); toast('Removed.'); }
}
async function trackApp(id){
  if(!CU){ openModal('login'); return; }
  try{ await api('/api/applications',{method:'POST',body:JSON.stringify({job_id:id})},true); toast('✅ Application tracked!'); }
  catch(e){ toast(e.message.indexOf('tracked')>-1?'Already tracking this job.':'Could not track.'); }
}

// -- SAVED PAGE --
async function loadSaved(){
  if(!CU){ $('saved-con').innerHTML='<div class="empty"><div class="empty-icon">🔒</div><h3>Sign in to see saved jobs</h3><p><button class="search-btn" style="display:inline-block;margin-top:1rem" onclick="openModal(\'login\')">Sign In</button></p></div>'; return; }
  $('saved-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
  var d=await api('/api/saved',{},true);
  if(d.success&&d.data&&d.data.length){
    $('saved-con').innerHTML='<div class="jobs-grid">'+d.data.map(function(item){
      var j=item.job||item.jobs_clean||item;
      return jobCardHtml(j);
    }).join('')+'</div>';
  } else {
    $('saved-con').innerHTML='<div class="empty"><div class="empty-icon">📌</div><h3>No saved jobs</h3><p>Browse jobs and tap Save to add them here.</p></div>';
  }
}

// -- TRACKER --
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
  $('trk-tabs').innerHTML=ST.map(function(s){ return'<button class="status-tab'+(trkFilter===s.k?' active':'')+('" onclick="setTrkF(\''+s.k+'\')">')+s.l+(counts[s.k]>0?' ('+counts[s.k]+')':'')+'</button>'; }).join('');
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
      +'<button class="del-btn" onclick="delApp(\''+a.id+'\')">✕ Remove</button>'
      +'</div></div>';
  }).join('');
}
function setTrkF(f){ trkFilter=f; renderTracker(); }
async function updApp(id,status){ await api('/api/applications/'+id,{method:'PUT',body:JSON.stringify({status:status})},true); allApps=allApps.map(function(a){ return a.id===id?Object.assign({},a,{status:status}):a; }); renderTracker(); toast('Status updated.'); }
async function delApp(id){ await api('/api/applications/'+id,{method:'DELETE'},true); allApps=allApps.filter(function(a){ return a.id!==id; }); renderTracker(); toast('Removed.'); }

// -- UPDATE PROFILE --
var profData = {};
async function loadProfile(){
  if(!CU){ go('home'); openModal('login'); return; }
  try{
    var d=await api('/api/profile',{},true);
    if(!d.success) return;
    profData=d.data||{};
    $('p-name').value=profData.full_name||'';
    $('p-email').value=profData.email||CU.email||'';
    $('p-phone').value=profData.phone||'';
    $('p-jobtitle').value=profData.job_title||'';
    $('p-location').value=profData.location||'';
    $('p-linkedin').value=profData.linkedin_url||'';
    $('p-bio').value=profData.bio||'';
    $('p-resume-url').value=profData.resume_url||'';
    if(profData.availability) $('p-avail').value=profData.availability;
    renderSkillsList(profData.skills||[]);
    renderExpList(profData.experience||[]);
    renderEduList(profData.education||[]);
    calcStrength();
  } catch(e){ toast('Could not load profile.'); }
}
function calcStrength(){
  var p=profData; var sc=0;
  if(p.full_name) sc++;
  if(p.linkedin_url) sc++;
  if(p.skills&&p.skills.length) sc++;
  if(p.experience&&p.experience.length) sc++;
  if(p.education&&p.education.length) sc++;
  var b=$('strength-badge');
  if(sc>=5){ b.textContent='✅ Profile 100% Complete'; b.classList.remove('partial'); }
  else if(sc>=3){ b.textContent='Profile '+Math.round(sc/5*100)+'% Complete'; b.classList.add('partial'); }
  else{ b.textContent='Building profile… '+Math.round(sc/5*100)+'%'; b.classList.add('partial'); }
}
async function saveProfile(){
  var d=await api('/api/profile',{method:'PUT',body:JSON.stringify({
    full_name:   $('p-name').value,
    phone:       $('p-phone').value,
    location:    $('p-location').value,
    job_title:   $('p-jobtitle').value,
    linkedin_url:$('p-linkedin').value,
    bio:         $('p-bio').value,
    resume_url:  $('p-resume-url').value,
    availability:$('p-avail').value
  })},true);
  if(d.success){ Object.assign(profData,d.data); toast('Profile saved ✅'); calcStrength(); } else toast('Error: '+d.error);
}

// Skills
function setNewSkillStar(n){
  newSkillProf=n;
  var stars=$('new-skill-stars').querySelectorAll('.star');
  stars.forEach(function(s,i){ if(i<n) s.classList.add('on'); else s.classList.remove('on'); });
}
function renderSkillsList(skills){
  if(!skills.length){ $('skills-list').innerHTML=''; return; }
  $('skills-list').innerHTML=skills.map(function(s){
    return'<div class="nested-item">'
      +'<button class="nested-del" onclick="delSkill(\''+s.id+'\')">✕</button>'
      +'<div style="display:flex;align-items:center;justify-content:space-between">'
      +'<span style="font-weight:600;font-size:.95rem">'+esc(s.skill_name)+'</span>'
      +starsHtmlInline(s.proficiency||3)
      +'</div></div>';
  }).join('');
}
async function addSkill(){
  var name=$('new-skill').value.trim();
  if(!name){ toast('Enter a skill name.'); return; }
  var d=await api('/api/skills',{method:'POST',body:JSON.stringify({skill_name:name,proficiency:newSkillProf})},true);
  if(d.success){ profData.skills=profData.skills||[]; profData.skills.push(d.data); renderSkillsList(profData.skills); $('new-skill').value=''; toast('Skill added!'); calcStrength(); }
  else toast('Error: '+d.error);
}
async function delSkill(id){
  await api('/api/skills/'+id,{method:'DELETE'},true);
  profData.skills=profData.skills.filter(function(s){ return s.id!==id; });
  renderSkillsList(profData.skills); toast('Skill removed.'); calcStrength();
}

// Experience
function renderExpList(exp){
  if(!exp.length){ $('exp-list').innerHTML=''; return; }
  $('exp-list').innerHTML=exp.map(function(e){
    return'<div class="nested-item">'
      +'<button class="nested-del" onclick="delExp(\''+e.id+'\')">✕</button>'
      +'<div style="font-weight:600;font-size:.95rem">'+esc(e.job_title)+'</div>'
      +'<div style="font-size:.88rem;color:var(--text-sub);margin-top:3px">'+esc(e.company)+(e.start_date?' · '+e.start_date.slice(0,7):'')+(e.end_date?' – '+e.end_date.slice(0,7):e.start_date?' – Present':'')+'</div>'
      +'</div>';
  }).join('');
}
async function saveExp(){
  var t=$('ne-title').value.trim(), c=$('ne-company').value.trim();
  if(!t||!c){ toast('Job title and company are required.'); return; }
  var d=await api('/api/experience',{method:'POST',body:JSON.stringify({job_title:t,company:c,start_date:$('ne-start').value||null,end_date:$('ne-end').value||null})},true);
  if(d.success){ profData.experience=profData.experience||[]; profData.experience.unshift(d.data); renderExpList(profData.experience); $('ne-title').value=''; $('ne-company').value=''; $('ne-start').value=''; $('ne-end').value=''; $('new-exp-form').style.display='none'; toast('Experience added!'); calcStrength(); }
  else toast('Error: '+d.error);
}
async function delExp(id){
  await api('/api/experience/'+id,{method:'DELETE'},true);
  profData.experience=profData.experience.filter(function(e){ return e.id!==id; });
  renderExpList(profData.experience); toast('Removed.'); calcStrength();
}

// Education
function renderEduList(edu){
  if(!edu.length){ $('edu-list').innerHTML=''; return; }
  $('edu-list').innerHTML=edu.map(function(e){
    return'<div class="nested-item">'
      +'<button class="nested-del" onclick="delEdu(\''+e.id+'\')">✕</button>'
      +'<div style="font-weight:600;font-size:.95rem">'+esc(e.degree||'Degree')+'</div>'
      +'<div style="font-size:.88rem;color:var(--text-sub);margin-top:3px">'+esc(e.school)+(e.graduation_year?' · '+e.graduation_year:'')+'</div>'
      +'</div>';
  }).join('');
}
async function saveEdu(){
  var s=$('ne-school').value.trim();
  if(!s){ toast('School name is required.'); return; }
  var d=await api('/api/education',{method:'POST',body:JSON.stringify({school:s,degree:$('ne-degree').value.trim()||null,graduation_year:parseInt($('ne-year').value)||null})},true);
  if(d.success){ profData.education=profData.education||[]; profData.education.unshift(d.data); renderEduList(profData.education); $('ne-school').value=''; $('ne-degree').value=''; $('ne-year').value=''; $('new-edu-form').style.display='none'; toast('Education added!'); calcStrength(); }
  else toast('Error: '+d.error);
}
async function delEdu(id){
  await api('/api/education/'+id,{method:'DELETE'},true);
  profData.education=profData.education.filter(function(e){ return e.id!==id; });
  renderEduList(profData.education); toast('Removed.'); calcStrength();
}

// -- PUBLIC PROFILE --
async function openPubProfile(userId, from){
  prevPage=from||'search'; go('pub-profile');
  $('pub-profile-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
  var d=await api('/api/profile/'+userId);
  if(!d.success){ $('pub-profile-con').innerHTML='<div class="empty"><p>Profile not found.</p></div>'; return; }
  $('pub-profile-con').innerHTML=pubProfileHtml(d.data);
}
function pubProfileHtml(p){
  var hasLI = !!p.linkedin_url;
  var hasSk = p.skills&&p.skills.length>0;
  var hasEx = p.experience&&p.experience.length>0;
  var hasEd = p.education&&p.education.length>0;
  var complete = hasLI&&hasSk&&hasEx&&hasEd;

  var h='<div class="pub-card">';

  h+='<div class="pub-hdr"><div class="pub-av-area">';
  h+='<div class="pub-av">'+ini(p.full_name)+'</div>';
  h+='<div class="pub-meta">';
  h+='<div style="display:inline-flex;align-items:center;gap:6px;background:'+(complete?'var(--remote-bg)':'var(--gold-bg)')+';color:'+(complete?'var(--remote-txt)':'var(--gold-txt)')+';padding:4px 12px;border-radius:100px;font-size:.75rem;font-weight:600;margin-bottom:.5rem">';
  h+=(complete?'✅ Profile 100% Complete':'Profile Ready')+'</div>';
  h+='<h1>'+esc(p.full_name||'Candidate')+'</h1>';
  h+='<div class="pub-contact">';
  if(p.job_title) h+='💼 '+esc(p.job_title)+'<br/>';
  if(p.location)  h+='📍 '+esc(p.location)+'<br/>';
  h+='</div></div></div>';

  h+='<div class="pub-actions">';
  h+='<a href="mailto:" class="pub-msg-btn">Send Message</a>';
  if(p.linkedin_url) h+='<a href="'+esc(p.linkedin_url)+'" target="_blank" rel="noopener" class="pub-li-btn">LinkedIn Profile</a>';
  if(p.resume_url) h+='<a href="'+esc(p.resume_url)+'" target="_blank" rel="noopener" class="pub-dl-btn">Download Resume</a>';
  else h+='<button class="pub-dl-btn" onclick="window.print()">Download Resume</button>';
  h+='</div></div>';

  h+='<div class="pub-body">';

  if(hasSk){
    h+='<div class="sec-label">Core Expertise</div>';
    h+='<div class="skills-grid">';
    p.skills.forEach(function(s){
      h+='<div class="skill-badge"><span class="skill-name">'+esc(s.skill_name)+'</span>'+starsHtmlInline(s.proficiency||3)+'</div>';
    });
    h+='</div>';
  }

  if(hasEx){
    h+='<div class="sec-label">Experience</div>';
    p.experience.forEach(function(e){
      h+='<div class="timeline-item">';
      h+='<div class="tl-title">'+esc(e.job_title)+'</div>';
      h+='<div class="tl-sub">'+esc(e.company);
      if(e.start_date) h+=' • '+e.start_date.slice(0,7)+' – '+(e.end_date?e.end_date.slice(0,7):'Present');
      h+='</div></div>';
    });
  }

  if(hasEd){
    h+='<div class="sec-label">Education</div>';
    p.education.forEach(function(e){
      h+='<div class="timeline-item tl-item-edu">';
      h+='<div class="tl-title">'+esc(e.degree||'Degree')+'</div>';
      h+='<div class="tl-sub">'+esc(e.school)+(e.graduation_year?' • '+e.graduation_year:'')+'</div>';
      h+='</div>';
    });
  }

  if(!hasSk&&!hasEx&&!hasEd){
    h+='<div class="empty"><div class="empty-icon">👤</div><h3>Profile in progress</h3><p>This candidate is still building their profile.</p></div>';
  }

  if(p.bio){
    h+='<div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border)">';
    h+='<div style="font-size:.72rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.75rem">About</div>';
    h+='<p style="font-size:.9rem;color:var(--text-sub);line-height:1.75">'+esc(p.bio)+'</p>';
    h+='</div>';
  }

  return h+'</div></div>';
}

// -- EMPLOYER --
async function loadEmpStats(){
  var d=await api('/api/stats');
  if(d.success){ $('emp-total').textContent=(d.data.totalJobs||0).toLocaleString(); $('emp-remote').textContent=(d.data.remoteJobs||0).toLocaleString(); }
}
function togglePostForm(){ $('post-form').style.display=$('post-form').style.display==='none'?'block':'none'; }
async function submitJob(){
  if(!CU){ openModal('login'); return; }
  var title=$('pj-title').value.trim(), company=$('pj-company').value.trim(), desc=$('pj-desc').value.trim();
  if(!title||!company||!desc){ toast('Title, company, and description are required.'); return; }
  var d=await api('/api/employer/jobs',{method:'POST',body:JSON.stringify({title:title,company:company,city:$('pj-city').value.trim(),remote_type:$('pj-remote').value,employment_type:$('pj-type').value,salary_min:parseInt($('pj-sal-min').value)||null,salary_max:parseInt($('pj-sal-max').value)||null,description:desc,job_url:$('pj-url').value.trim()})},true);
  if(d.success){ toast('Job posted! ✅'); togglePostForm(); loadEmpJobs(); }
  else toast('Error: '+(d.error||'Post failed'));
}
async function loadEmpJobs(){
  if(!CU||!tok) return;
  var d=await api('/api/employer/jobs',{},true);
  if(d.success&&d.data&&d.data.length){
    $('emp-jobs-sec').style.display='block';
    $('emp-jobs-list').innerHTML=d.data.map(function(j){
      return'<div class="emp-job-card"><div class="emp-job-info">'
        +'<div class="emp-job-title">'+esc(j.title)+'</div>'
        +'<div class="emp-job-meta">'+esc(j.company||'')+(j.city?' · '+esc(j.city):'')+(j.posted_at?' · '+ago(j.posted_at):'')+'</div>'
        +'</div><div class="emp-job-actions">'
        +'<button class="emp-btn danger" onclick="delEmpJob(\''+j.id+'\')">Delete</button>'
        +'</div></div>';
    }).join('');
  }
}
async function delEmpJob(id){ await api('/api/employer/jobs/'+id,{method:'DELETE'},true); loadEmpJobs(); toast('Job removed.'); }

// -- ADMIN --
async function loadAdmin(){
  if(adminLoaded) return; adminLoaded=true;
  var stats=await api('/api/stats');
  if(stats.success){
    $('adm-stats').innerHTML='<div class="admin-stat hl"><span class="admin-stat-num">'+(stats.data.totalJobs||0).toLocaleString()+'</span><div class="admin-stat-label">Active jobs</div></div>'
      +'<div class="admin-stat"><span class="admin-stat-num">'+(stats.data.remoteJobs||0).toLocaleString()+'</span><div class="admin-stat-label">Remote jobs</div></div>'
      +'<div class="admin-stat"><span class="admin-stat-num">'+Math.round(((stats.data.remoteJobs||0)/(stats.data.totalJobs||1))*100)+'%</span><div class="admin-stat-label">Remote ratio</div></div>';
  }
  var sources=await api('/api/sources');
  if(sources.success&&sources.data.length){
    $('adm-src-con').innerHTML='<table class="data-table"><thead><tr><th>Source</th><th>Status</th></tr></thead><tbody>'
      +sources.data.map(function(s){ return'<tr><td>'+esc(s.name)+'</td><td><span class="badge ok">Active</span></td></tr>'; }).join('')
      +'</tbody></table>';
  }
}
function swAdmin(tab,btn){
  document.querySelectorAll('.admin-sec').forEach(function(s){ s.classList.remove('active'); });
  document.querySelectorAll('.admin-tab').forEach(function(b){ b.classList.remove('active'); });
  $('adm-'+tab).classList.add('active'); btn.classList.add('active');
}

// -- CONTACT --
async function submitContact(){
  var name=$('cf-name').value.trim();
  var email=$('cf-email').value.trim();
  var subject=$('cf-subject').value;
  var message=$('cf-message').value.trim();
  var err=$('cf-error');
  err.classList.remove('show');
  if(!name||!email||!subject||!message){
    err.textContent='Please fill in all fields before sending.';
    err.classList.add('show');
    return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    err.textContent='Please enter a valid email address.';
    err.classList.add('show');
    return;
  }
  var btn=$('cf-submit');
  btn.disabled=true; btn.textContent='Sending…';
  try{
    var res=await fetch('https://formspree.io/f/xzdagqnk',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({name:name,email:email,subject:subject,message:message})
    });
    if(res.ok){
      $('contact-form-body').style.display='none';
      $('contact-success').style.display='block';
    } else {
      err.textContent='Something went wrong. Please try again or email us directly.';
      err.classList.add('show');
      btn.disabled=false; btn.textContent='Send message';
    }
  } catch(e){
    err.textContent='Could not send. Please check your connection and try again.';
    err.classList.add('show');
    btn.disabled=false; btn.textContent='Send message';
  }
}
function resetContact(){
  $('cf-name').value=''; $('cf-email').value=''; $('cf-subject').value=''; $('cf-message').value='';
  $('cf-error').classList.remove('show');
  $('cf-submit').disabled=false; $('cf-submit').textContent='Send message';
  $('contact-form-body').style.display='block';
  $('contact-success').style.display='none';
}

// -- FAQ --
function faqToggle(btn){
  var item=btn.closest('.faq-item');
  item.classList.toggle('open');
}
function faqTab(id,btn){
  document.querySelectorAll('.faq-group').forEach(function(g){g.style.display='none';});
  document.querySelectorAll('.faq-tab-btn').forEach(function(b){b.classList.remove('active');});
  document.getElementById('faq-'+id).style.display='block';
  btn.classList.add('active');
}

// -- INIT --
updateNav();
go('home');
if(tok&&CU) loadSavedIds();