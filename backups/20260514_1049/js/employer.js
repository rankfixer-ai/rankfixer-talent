var Employer={
  loaded:false,
  load:async function(){
    if(Employer.loaded) return; Employer.loaded=true;
    var d=await App.api('/api/stats');
    App.$('emp-content').innerHTML=`
      <div class="emp-stats"><div class="emp-stat"><span class="emp-stat-num">${(d.success?d.data.totalJobs||0:0).toLocaleString()}</span><div class="emp-stat-label">Active job seekers</div></div><div class="emp-stat"><span class="emp-stat-num">${(d.success?d.data.remoteJobs||0:0).toLocaleString()}</span><div class="emp-stat-label">Remote seekers</div></div><div class="emp-stat"><span class="emp-stat-num">Free</span><div class="emp-stat-label">To post</div></div></div>
      <div class="post-form" id="post-form" style="display:none"><h3 style="font-family:var(--font-d);font-size:1.3rem;margin-bottom:1.5rem">Post a New Job</h3>
        <div class="form-grid"><div><label class="f-label">Job Title *</label><input class="f-input" id="pj-title"/></div><div><label class="f-label">Company *</label><input class="f-input" id="pj-company"/></div><div><label class="f-label">City</label><input class="f-input" id="pj-city"/></div><div><label class="f-label">Work Setup</label><select class="f-select" id="pj-remote"><option value="">On-site</option><option value="remote">Remote</option></select></div><div><label class="f-label">Employment Type</label><select class="f-select" id="pj-type"><option value="">Selectâ€¦</option><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div><div class="full"><label class="f-label">Job Description *</label><textarea class="f-textarea" id="pj-desc"></textarea></div><div class="full"><label class="f-label">Application URL</label><input class="f-input" id="pj-url"/></div></div>
        <div style="display:flex;gap:10px"><button class="post-submit" onclick="Employer.submitJob()">Post Job</button><button class="emp-btn" onclick="Employer.toggleForm()">Cancel</button></div>
      </div>
      <div id="emp-jobs-sec" style="display:none"><div class="section-hdr"><h3 class="section-title">Your Postings</h3></div><div id="emp-jobs-list"></div></div>`;
    Employer.loadJobs();
  },
  toggleForm:function(){ var f=App.$('post-form'); f.style.display=f.style.display==='none'?'block':'none'; },
  submitJob:async function(){
    var title=App.$('pj-title').value.trim(), company=App.$('pj-company').value.trim(), desc=App.$('pj-desc').value.trim();
    if(!title||!company||!desc){ App.toast('All fields required.'); return; }
    var d=await App.api('/api/employer/jobs',{method:'POST',body:JSON.stringify({title:title,company:company,city:App.$('pj-city').value,remote_type:App.$('pj-remote').value,employment_type:App.$('pj-type').value,description:desc,job_url:App.$('pj-url').value})},true);
    if(d.success){ App.toast('Job posted!'); Employer.toggleForm(); Employer.loadJobs(); } else App.toast('Error');
  },
  loadJobs:async function(){
    var d=await App.api('/api/employer/jobs',{},true);
    if(d.success&&d.data&&d.data.length){ App.$('emp-jobs-sec').style.display='block'; App.$('emp-jobs-list').innerHTML=d.data.map(function(j){ return '<div class="emp-job-card"><div class="emp-job-info"><div class="emp-job-title">'+App.esc(j.title)+'</div><div class="emp-job-meta">'+App.esc(j.company||'')+'</div></div><div class="emp-job-actions"><button class="emp-btn danger" onclick="Employer.deleteJob(\''+j.id+'\')">Delete</button></div></div>'; }).join(''); }
  },
  deleteJob:async function(id){ await App.api('/api/employer/jobs/'+id,{method:'DELETE'},true); Employer.loadJobs(); App.toast('Removed.'); }
};

