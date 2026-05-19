// ── JOB DETAIL ──
async function openJob(id,from){
  prevPage=from||'search'; go('detail');
  $('detail-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
  var d=await api('/api/jobs/'+id);
  if(!d.success){ $('detail-con').innerHTML='<div class="empty"><p>Job not found.</p></div>'; return; }
  $('detail-con').innerHTML=detailHtml(d.data);
  injectJobSchema(d.data);  // ADD THIS LINE

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
  if(j.job_url) h+='<a href="'+esc(j.job_url)+'" target="_blank" rel="noopener" class="apply-btn">Apply Now ↗</a>';
  else h+='<button class="apply-btn" style="opacity:.5;cursor:default">Application closed</button>';
  if(CU) h+='<button class="outline-btn'+(sv?' active':'')+('" onclick="togSaveDetail(\''+esc(j.id)+'\',this)">'+(sv?'♥ Saved':'♡ Save Job')+'</button>');
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
  // Split on double newlines for paragraphs, single newlines for line breaks
  desc = desc.split(/\n\n+/).map(function(p){ return '<p>'+p.replace(/\n/g,'<br>')+'</p>'; }).join('');
  h+='<div class="detail-sec"><h3>About this role</h3>'+desc+'</div>';
}
  if(j.source&&j.source.name) h+='<p style="font-size:.8rem;color:var(--text-muted)">ℹ️ Sourced from <strong>'+esc(j.source.name)+'</strong></p>';
  return h+'</div></div>';
}
