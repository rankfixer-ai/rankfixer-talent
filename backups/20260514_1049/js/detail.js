// ============================================================
// js/detail.js â€” Job detail page with schema injection
// ============================================================
var Detail = {
  open: async function(id,from){
    App.prevPage=from||'search'; App.go('detail');
    App.$('detail-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
    var d=await App.api('/api/jobs/'+id);
    if(!d.success){ App.$('detail-con').innerHTML='<div class="empty"><p>Job not found.</p></div>'; return; }
    App.$('detail-con').innerHTML=Detail.html(d.data);
    Detail.injectSchema(d.data);
  },

  injectSchema: function(j){
    var el=document.getElementById('job-schema'); if(el) el.remove();
    var schema={'@context':'https://schema.org','@type':'JobPosting','title':j.title||'','description':(j.description||j.snippet||'').replace(/<[^>]*>/g,'').slice(0,500),'datePosted':j.posted_at||'','hiringOrganization':{'@type':'Organization','name':j.company||'Company'},'jobLocation':{'@type':'Place','address':{'@type':'PostalAddress','addressLocality':j.city||'','addressCountry':'PH'}},'employmentType':j.employment_type||'FULL_TIME','jobLocationType':j.remote_type==='remote'?'TELECOMMUTE':'ONSITE'};
    if(j.salary_min||j.salary_max){ schema.baseSalary={'@type':'MonetaryAmount','currency':j.salary_currency||'PHP','value':{'@type':'QuantitativeValue','minValue':j.salary_min||j.salary_max,'maxValue':j.salary_max||j.salary_min,'unitText':'MONTH'}}; }
    var script=document.createElement('script'); script.type='application/ld+json'; script.id='job-schema'; script.textContent=JSON.stringify(schema); document.head.appendChild(script);
  },

  html: function(j){
    var sal=App.fmtSal(j.salary_min,j.salary_max,j.salary_currency), isR=j.remote_type==='remote', sv=App.savedIds[j.id];
    var h='<div class="detail-card"><div class="detail-hdr">';
    h+='<div class="detail-av">'+App.ini(j.company)+'</div>';
    h+='<div class="detail-title">'+App.esc(j.title)+'</div>';
    h+='<div class="detail-co">'+App.esc(j.company||'Company')+(j.location?' Â· '+App.esc(j.location):'')+'</div>';
    h+='<div class="detail-tags">';
    if(j.city) h+='<span class="detail-tag">ðŸ“ '+App.esc(j.city)+'</span>';
    if(isR) h+='<span class="detail-tag remote">ðŸ  Remote / WFH</span>';
    if(j.employment_type) h+='<span class="detail-tag">'+App.esc(j.employment_type)+'</span>';
    if(sal) h+='<span class="detail-tag salary">ðŸ’° '+sal+'</span>';
    h+='<span class="detail-tag">ðŸ“… '+App.ago(j.posted_at)+'</span>';
    h+='</div><div class="detail-actions">';
    if(j.job_url) h+='<a href="'+App.esc(j.job_url)+'" target="_blank" rel="noopener" class="apply-btn">Apply Now â†—</a>';
    else h+='<button class="apply-btn" style="opacity:.5;cursor:default">Application closed</button>';
    if(App.CU) h+='<button class="outline-btn'+(sv?' active':'')+'" onclick="Saved.toggleDetail(\''+App.esc(j.id)+'\',this)">'+(sv?'â™¥ Saved':'â™¡ Save Job')+'</button>';
    if(App.CU) h+='<button class="outline-btn" onclick="Tracker.track(\''+App.esc(j.id)+'\')">+ Track Application</button>';
    h+='</div></div><div class="detail-body">';
    if(j.city||isR||j.employment_type||sal){
      h+='<div class="detail-grid">';
      if(j.city) h+='<div class="info-item"><div class="info-label">Location</div><div class="info-value">'+App.esc(j.city)+'</div></div>';
      if(isR) h+='<div class="info-item"><div class="info-label">Work Setup</div><div class="info-value">Remote / WFH</div></div>';
      if(j.employment_type) h+='<div class="info-item"><div class="info-label">Job Type</div><div class="info-value">'+App.esc(j.employment_type)+'</div></div>';
      if(sal) h+='<div class="info-item"><div class="info-label">Salary</div><div class="info-value">'+sal+'</div></div>';
      h+='</div>';
    }
    if(j.description||j.snippet){
      var desc=App.esc(j.description||j.snippet);
      desc=desc.split(/\\n\\n+/).map(function(p){return '<p>'+p.replace(/\\n/g,'<br>')+'</p>';}).join('');
      h+='<div class="detail-sec"><h3>About this role</h3>'+desc+'</div>';
    }
    return h+'</div></div>';
  }
};

