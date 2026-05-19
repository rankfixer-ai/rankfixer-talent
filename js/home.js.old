// ── HOME ──
async function loadHome(){
  try{
    var s=await api('/api/stats');
    if(s.success){ $('stat-total').textContent=(s.data.totalJobs||0).toLocaleString(); $('stat-remote').textContent=(s.data.remoteJobs||0).toLocaleString(); }
    var j=await api('/api/jobs?limit=6');
    $('home-jobs').innerHTML=(j.success&&j.data.length)?j.data.map(jobCardHtml).join(''):'<div class="empty"><div class="empty-icon">🔍</div><h3>No jobs yet</h3></div>';
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
