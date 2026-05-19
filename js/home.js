// ─── HOME — RankFixer Talent ───
async function loadHome(){
  // Render operational hero + trust sections
  $('home-hero').innerHTML = heroTemplate();
  $('home-trust-bar').innerHTML = trustBarTemplate();
  $('home-trust').innerHTML = trustSectionTemplate();

  // Fetch stats
  try{
    var s = await api('/api/stats');
    if(s.success){
      $('stat-total').textContent = (s.data.totalJobs||0).toLocaleString();
      $('stat-remote').textContent = (s.data.remoteJobs||0).toLocaleString();
    }
  } catch(e){ /* fail silently */ }

  // Fetch featured roles
  try{
    var j = await api('/api/jobs?limit=6');
    $('home-jobs').innerHTML = (j.success && j.data.length)
      ? '<div class="section-divider"><span>Current Opportunities</span></div>' + j.data.map(jobCardHtml).join('')
      : '<div class="rf-empty-state"><h3>Opportunities Being Updated</h3><p>New operational roles are added weekly as we expand our client teams.</p><a href="/browse" class="action-link" onclick="go(\"browse\");return false">View All Opportunities</a></div>';
  } catch(e){
    $('home-jobs').innerHTML = '<div class="rf-empty-state"><h3>Refreshing Talent Network</h3><p>We'\''re updating our operational listings. Please check back shortly.</p></div>';
  }
}

// ─── HERO TEMPLATE ───
function heroTemplate(){
  return '<div class="rf-hero">'
    +'<h1>Structured Remote Roles Built Around Reliability</h1>'
    +'<p class="hero-subtext">Join a managed operational ecosystem with facility-based teams, redundant systems, and structured pathways — infrastructure that isolated freelancing simply can'\''t provide.</p>'
    +'<div class="search-wrapper">'
    +'<input type="text" id="h-kw" placeholder="Explore operational opportunities" autocomplete="off" onkeydown="if(event.key===\"Enter\")heroSearch()" />'
    +'<button onclick="heroSearch()">Search</button>'
    +'</div>'
    +'<div class="category-pills">'
    +'<span onclick="qSearch(\"Remote Operations\")">Remote Operations</span>'
    +'<span onclick="qSearch(\"Client Support\")">Client Support</span>'
    +'<span onclick="qSearch(\"Executive Assistance\")">Executive Assistance</span>'
    +'<span onclick="qSearch(\"AI-Native Workflows\")">AI-Native Workflows</span>'
    +'<span onclick="qSearch(\"Marketing Operations\")">Marketing Operations</span>'
    +'<span onclick="qSearch(\"Administrative Support\")">Administrative Support</span>'
    +'</div>'
    +'</div>';
}

// ─── TRUST BAR TEMPLATE ───
function trustBarTemplate(){
  return '<div class="rf-trust-bar">'
    +'<span class="trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> 200-Seat Facility</span>'
    +'<span class="trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg> Dual ISP Redundancy</span>'
    +'<span class="trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Backup Power Systems</span>'
    +'<span class="trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> On-Site Management</span>'
    +'</div>';
}

// ─── TRUST SECTION TEMPLATE ───
function trustSectionTemplate(){
  return '<section class="rf-trust-section" id="operational-standards">'
    +'<h2>The Infrastructure That Protects Your Work</h2>'
    +'<p class="section-subtext">When you join RankFixer, you'\''re not relying on a home internet connection or hoping the power stays on during typhoon season. You'\''re working from a 200-seat TESDA-accredited facility in Bislig City — purpose-built for operational continuity.</p>'
    +'<div class="rf-trust-grid">'
    +'<div class="rf-trust-card">'
    +'<div class="trust-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>'
    +'<h4>Continuous Connectivity</h4>'
    +'<p>Dual ISP fiber with automatic failover means your work continues uninterrupted, regardless of local provider issues.</p>'
    +'</div>'
    +'<div class="rf-trust-card">'
    +'<div class="trust-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>'
    +'<h4>Power Continuity</h4>'
    +'<p>Backup generator with automatic failover ensures typhoon season never interrupts your work or your professional standing.</p>'
    +'</div>'
    +'<div class="rf-trust-card">'
    +'<div class="trust-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>'
    +'<h4>Structured Operational Support</h4>'
    +'<p>On-site managers handle administrative friction so you can focus on meaningful work, not troubleshooting infrastructure.</p>'
    +'</div>'
    +'<div class="rf-trust-card">'
    +'<div class="trust-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>'
    +'<h4>AI-Native Environment</h4>'
    +'<p>Every role operates within AI-integrated workflows. ChatGPT, Claude, and automation tools are standard operational infrastructure.</p>'
    +'</div>'
    +'</div>'
    +'</section>';
}

// ─── JOB CARD ───
function jobCardHtml(j){
  var sal = fmtSal(j.salary_min, j.salary_max, j.salary_currency);
  var isR = j.remote_type === 'remote';
  return '<div class="job-card" onclick="openJob(\'' + esc(j.id) + '\',\'home\')">'
    +'<div class="card-top"><div class="av">' + ini(j.company) + '</div>'
    +'<div><div class="card-title">' + esc(j.title) + '</div><div class="card-company">' + esc(j.company||'Company') + '</div></div></div>'
    +'<div class="tags">'
    +(j.city?'<span class="tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + esc(j.city) + '</span>':'')
    +(isR?'<span class="tag badge">Remote Operations</span>':'')
    +(j.employment_type?'<span class="tag">' + esc(j.employment_type) + '</span>':'')
    +(sal?'<span class="tag">' + sal + '</span>':'')
    +'</div>'
    +'<div class="card-footer"><span>' + esc(j.source&&j.source.name?j.source.name:'Operational Role') + '</span><span>' + ago(j.posted_at) + '</span></div>'
    +'</div>';
}

// ─── SEARCH HELPERS ───
function heroSearch(){ $('s-kw').value = $('h-kw').value.trim(); go('search'); }
function qSearch(kw){ $('s-kw').value = kw; go('search'); }
