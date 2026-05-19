// ============================================================
// js/pages.js â€” Page HTML templates loaded on demand
// ============================================================
App.pageHTML = {};

// HOME PAGE
App.pageHTML.home = `
<div class="page active" id="page-home">
  <div class="hero">
    <div class="eyebrow">ðŸ‡µðŸ‡­ Philippines Job Board</div>
    <h1>Find your next <em>great job</em><br>in the Philippines</h1>
    <p>Thousands of verified openings â€” BPO, tech, remote, and more.</p>
    <div class="search-box">
      <input id="h-kw" type="text" placeholder="Try: CSR, VA, remote, social mediaâ€¦" onkeydown="if(event.key==='Enter')heroSearch()"/>
      <button class="search-btn" onclick="heroSearch()">Search Jobs</button>
    </div>
    <div class="quick-tags">
      <button class="quick-tag" onclick="qSearch('CSR')">CSR / BPO</button>
      <button class="quick-tag" onclick="qSearch('Virtual Assistant')">Virtual Assistant</button>
      <button class="quick-tag" onclick="qSearch('Remote')">Remote / WFH</button>
      <button class="quick-tag" onclick="qSearch('Social Media')">Social Media</button>
      <button class="quick-tag" onclick="qSearch('Developer')">Developer</button>
      <button class="quick-tag" onclick="qSearch('Data Entry')">Data Entry</button>
    </div>
  </div>
  <div class="stats-bar">
    <div class="stat"><span class="stat-num" id="stat-total">3,604</span><div class="stat-label">Active jobs</div></div>
    <div class="stat"><span class="stat-num" id="stat-remote">228</span><div class="stat-label">Remote / WFH</div></div>
    <div class="stat"><span class="stat-num">Free</span><div class="stat-label">To browse &amp; apply</div></div>
  </div>
  <div class="dash-section">
    <div class="dash-inner">
      <div class="dash-label">Explore</div>
      <div class="dash-tiles">
        <div class="dash-tile" onclick="App.go('search')"><div class="dash-tile-icon orange">ðŸ”</div><div class="dash-tile-label">Browse Jobs</div></div>
        <div class="dash-tile" onclick="App.go('courses')"><div class="dash-tile-icon blue">ðŸ“š</div><div class="dash-tile-label">Free Courses</div></div>
        <div class="dash-tile" onclick="App.go('salary')"><div class="dash-tile-icon green">â‚±</div><div class="dash-tile-label">Salary Guide</div></div>
        <div class="dash-tile" onclick="App.go('trends')"><div class="dash-tile-icon gold">ðŸ“ˆ</div><div class="dash-tile-label">Job Trends</div></div>
        <div class="dash-tile" onclick="App.go('employers-featured')"><div class="dash-tile-icon red">ðŸ¢</div><div class="dash-tile-label">Top Employers</div></div>
        <div class="dash-tile" onclick="App.go('tips')"><div class="dash-tile-icon purple">ðŸ’¡</div><div class="dash-tile-label">Career Tips</div></div>
      <div class="dash-tile" onclick="App.go(\"ai-tools\")"><div class="dash-tile-icon" style="background:#E8F5E9">ðŸ¤–</div><div class="dash-tile-label">AI Tools</div></div></div></div></div><div class="section"><div class="section-hdr"><h2 class="section-title">Recent openings</h2><button class="section-link" onclick="App.go('search')">View all â†’</button></div><div id="home-jobs" class="jobs-grid"><div class="loading"><div class="spinner"></div></div></div></div>
</div>`;

// EXPLORE PAGE (mobile dashboard)
App.pageHTML.explore = `
<div class="page" id="page-explore">
  <div class="page-hdr"><h1>Explore</h1><p>Everything you need for your career</p></div>
  <div class="explore-page"><div class="explore-grid">
    <div class="explore-tile" onclick="App.go('search')"><div class="explore-tile-icon orange">ðŸ”</div><div class="explore-tile-label">Browse Jobs</div></div>
    <div class="explore-tile" onclick="App.go('courses')"><div class="explore-tile-icon blue">ðŸ“š</div><div class="explore-tile-label">Free Courses</div></div>
    <div class="explore-tile" onclick="App.go('salary')"><div class="explore-tile-icon green">â‚±</div><div class="explore-tile-label">Salary Guide</div></div>
    <div class="explore-tile" onclick="App.go('trends')"><div class="explore-tile-icon gold">ðŸ“ˆ</div><div class="explore-tile-label">Job Trends</div></div>
    <div class="explore-tile" onclick="App.go('employers-featured')"><div class="explore-tile-icon red">ðŸ¢</div><div class="explore-tile-label">Top Employers</div></div>
    <div class="explore-tile" onclick="App.go('tips')"><div class="explore-tile-icon purple">ðŸ’¡</div><div class="explore-tile-label">Career Tips</div></div>
  </div></div>
</div>`;

// SEARCH PAGE
App.pageHTML.search = `
<div class="page" id="page-search"><div class="search-page">
  <div class="toolbar">
    <div class="toolbar-wrap"><input class="toolbar-input" id="s-kw" placeholder="Job title, skill, keywordâ€¦" oninput="Search.fetchSug(this.value)" onkeydown="if(event.key==='Enter')Search.doSearch()"/><div class="suggest-drop" id="sug-box"></div></div>
    <input class="toolbar-input" id="s-city" placeholder="City" onkeydown="if(event.key==='Enter')Search.doSearch()" style="max-width:180px"/>
    <label class="remote-label"><div class="toggle" id="rem-tog" onclick="Search.togRem()"></div>Remote only</label>
    <button class="toolbar-btn" onclick="Search.doSearch()">Search</button>
  </div>
  <div class="results-meta" id="res-meta" style="display:none"><span id="res-count"></span></div>
  <div id="jobs-con"><div class="loading"><div class="spinner"></div></div></div>
  <div class="pagination" id="pg"></div>
</div></div>`;

// JOB DETAIL PAGE
App.pageHTML.detail = `
<div class="page" id="page-detail"><div class="detail-wrap"><button class="back-btn" onclick="App.go(App.prevPage||'search')">â† Back</button><div id="detail-con"><div class="loading"><div class="spinner"></div></div></div></div></div>`;

// SAVED PAGE
App.pageHTML.saved = `
<div class="page" id="page-saved"><div class="saved-page"><div class="section-hdr"><h2 class="section-title">Saved Jobs</h2></div><div id="saved-con"><div class="loading"><div class="spinner"></div></div></div></div></div>`;

// TRACKER PAGE
App.pageHTML.tracker = `
<div class="page" id="page-tracker"><div class="tracker-page"><div class="section-hdr"><h2 class="section-title">Application Tracker</h2></div><div class="status-tabs" id="trk-tabs"></div><div id="trk-con"><div class="loading"><div class="spinner"></div></div></div></div></div>`;

// PROFILE PAGE
App.pageHTML.profile = `
<div class="page" id="page-profile"><div class="profile-edit-page"><div class="profile-edit-hdr"><h2>My Profile</h2><div class="strength-badge partial" id="strength-badge">Building profileâ€¦</div></div><div id="profile-content"><div class="loading"><div class="spinner"></div></div></div></div></div>`;

// EMPLOYER PAGE
App.pageHTML.employer = `
<div class="page" id="page-employer"><div class="employer-page"><div class="emp-hero"><div><h1>Hire great talent<br><em style="font-style:italic;color:var(--accent)">in the Philippines.</em></h1><p>Post jobs directly to thousands of active job seekers. Free to start.</p></div><button class="emp-cta" onclick="Employer.toggleForm()">+ Post a Job</button></div><div id="emp-content"><div class="loading"><div class="spinner"></div></div></div></div></div>`;

// ADMIN PAGE
App.pageHTML.admin = `
<div class="page" id="page-admin"><div class="admin-page"><h2 style="font-family:var(--font-d);font-size:1.8rem;font-weight:500;margin-bottom:1.5rem">Admin Dashboard</h2><div id="admin-content"><div class="loading"><div class="spinner"></div></div></div></div></div>`;

// SIMPLE PAGES (loaded from data modules)
App.pageHTML.courses = '<div class="page" id="page-courses"><div class="page-hdr"><h1>Free Courses &amp; Training</h1><p>Upskill for your next job â€” all completely free</p></div><div class="courses-page"><div class="cat-pills" id="courses-pills"></div><div class="courses-grid" id="courses-grid"></div></div></div>';
App.pageHTML.salary = '<div class="page" id="page-salary"><div class="page-hdr"><h1>Salary Guide</h1><p>Know your worth in the Philippine job market</p></div><div class="salary-page"><input class="f-input" id="salary-q" placeholder="Search a job roleâ€¦" oninput="Salary.render(this.value)" style="max-width:360px;margin:0 auto 1.5rem;display:block"/><div class="salary-list" id="salary-list"></div><div class="salary-chart-wrap"><div class="salary-chart-title">Average Salary Comparison</div><div id="salary-chart-bars"></div></div></div></div>';
App.pageHTML.trends = '<div class="page" id="page-trends"><div class="page-hdr"><h1>Job Market Trends</h1><p>Philippine job market insights</p></div><div class="trends-page"><div id="trends-content"><div class="loading"><div class="spinner"></div></div></div></div></div>';
App.pageHTML['employers-featured'] = '<div class="page" id="page-employers-featured"><div class="page-hdr"><h1>Featured Employers</h1><p>Top companies actively hiring in the Philippines</p></div><div class="featured-emp-page"><div class="emp-cards-grid" id="emp-profile-grid"></div></div></div>';
App.pageHTML.tips = '<div class="page" id="page-tips"><div class="page-hdr"><h1>Application Tips</h1><p>Stand out from the crowd</p></div><div class="tips-page"><div class="tips-list" id="tips-list"></div></div></div>';
App.pageHTML.messages = '<div class="page" id="page-messages"><div class="messages-page"><h2>Messages</h2><div class="msg-banner"><div class="msg-banner-icon">ðŸ’¬</div><div class="msg-banner-text"><strong>Coming Soon</strong>Direct messaging is being built.</div></div><div class="msg-inbox" id="msg-inbox"></div></div></div>';


// AI TOOLS PAGE
App.pageHTML["ai-tools"] = `<div class="page" id="page-ai-tools"><div class="page-hdr"><h1>ðŸ¤– AI Career Tools</h1><p>Free AI-powered tools to help you land your next job</p></div><div class="section" style="max-width:700px;margin:0 auto"><div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1.5rem;margin-bottom:1.5rem"><h3 style="font-family:var(--font-d);font-size:1.2rem;margin-bottom:.25rem">ðŸ“ Cover Letter Generator</h3><p style="color:var(--text-sub);font-size:.85rem;margin-bottom:1rem">Generate a professional cover letter in seconds â€” tailored to your job application.</p><div class="f-field"><label class="f-label">Job Title *</label><input class="f-input" id="ai-job" placeholder="e.g. Virtual Assistant"/></div><div class="f-field"><label class="f-label">Company *</label><input class="f-input" id="ai-company" placeholder="e.g. Concentrix"/></div><div class="f-field"><label class="f-label">Your Skills *</label><input class="f-input" id="ai-skills" placeholder="e.g. English, Excel, customer service"/></div><div class="f-field"><label class="f-label">Years Experience</label><input class="f-input" id="ai-exp" placeholder="e.g. 2"/></div><button class="apply-btn" onclick="AITools.generateCL()" style="margin-top:.5rem;width:100%">âœ¨ Generate Cover Letter</button><div id="ai-cl-result" style="margin-top:1rem;white-space:pre-wrap;font-size:.88rem;line-height:1.8;display:none;background:var(--bg);padding:1.25rem;border-radius:var(--r-sm);color:var(--text-sub)"></div></div><div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1.5rem;text-align:center"><div style="font-size:2rem;margin-bottom:.5rem">ðŸ”œ</div><h3 style="font-family:var(--font-d);font-size:1rem">More AI Tools Coming Soon</h3><p style="color:var(--text-sub);font-size:.82rem">Resume Analyzer Â· Interview Simulator Â· Salary Negotiator</p></div></div></div>`;

// Page loader â€” injects HTML into the pages container
App.loadPage = function(name) {
  var existing = App.$('page-'+name);
  if(!existing && App.pageHTML[name]) {
    var div = document.createElement('div');
    div.innerHTML = App.pageHTML[name];
    App.$('pages').appendChild(div.firstElementChild);
  }
  // Hide all pages, show target
  document.querySelectorAll('#pages > .page').forEach(function(p){ p.classList.remove('active'); });
  var pg = App.$('page-'+name);
  if(pg) pg.classList.add('active');
};

// Override App.go to use dynamic loading
var _origGo = App.go;
App.go = function(name){
  document.querySelectorAll('.mob-tab').forEach(function(b){ b.classList.remove('active'); });
  var tabId=name;
  if(['saved','tracker','profile','pub-profile','employer','admin'].includes(name)) tabId='profile';
  if(name==='detail') tabId=(App.prevPage==='home'?'home':'search');
  if(['explore','courses','salary','trends','employers-featured','tips','messages'].includes(name)) tabId='explore';
  var mb=App.$('mobt-'+tabId); if(mb) mb.classList.add('active');
  if(name!=='detail') App.prevPage=name;
  
  App.loadPage(name);
  
  // Call module init
  if(name==='home' && typeof Home !== 'undefined') Home.load();
  if(name==='search' && typeof Search !== 'undefined') Search.doSearch();
  if(name==='saved' && typeof Saved !== 'undefined') Saved.load();
  if(name==='tracker' && typeof Tracker !== 'undefined') Tracker.load();
  if(name==='profile' && typeof Profile !== 'undefined') Profile.load();
  if(name==='employer' && typeof Employer !== 'undefined') Employer.load();
  if(name==='admin' && typeof Admin !== 'undefined') Admin.load();
  if(name==='courses' && typeof Courses !== 'undefined') Courses.init();
  if(name==='salary' && typeof Salary !== 'undefined') Salary.init();
  if(name==='employers-featured' && typeof EmpFeatured !== 'undefined') EmpFeatured.init();
  if(name==='tips' && typeof Tips !== 'undefined') Tips.init();
  if(name==='messages' && typeof Messages !== 'undefined') Messages.init();
  if(name==='trends' && typeof Trends !== 'undefined') Trends.init();

  
  window.scrollTo(0,0);
};

console.log('Pages module loaded. ' + Object.keys(App.pageHTML).length + ' page templates ready.');



