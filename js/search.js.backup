// ── SEARCH ──
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
  con.innerHTML=d.data.length?'<div class="jobs-list">'+d.data.map(listCardHtml).join('')+'</div>':'<div class="empty"><div class="empty-icon">🔍</div><h3>No jobs found</h3><p>Try different keywords.</p></div>';
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
