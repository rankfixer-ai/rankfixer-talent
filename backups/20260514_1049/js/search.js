// ============================================================
// js/search.js â€” Job search with pagination
// ============================================================
var Search = {
  sugTimer: null,

  doSearch: async function(){
    var kw=String((App.$('s-kw')?.value||'').trim()), city=String((App.$('s-city')?.value||'').trim());
    App.curPage=1;
    var con=App.$('jobs-con'), meta=App.$('res-meta');
    if(!con) return;
    con.innerHTML='<div class="loading"><div class="spinner"></div></div>';
    if(meta) meta.style.display='none';
    var pg=App.$('pg'); if(pg) pg.innerHTML='';
    var p=new URLSearchParams({page:1,limit:15});
    if(kw) p.set('keyword',kw); if(city) p.set('city',city); if(App.remOnly) p.set('remote','true');
    var d=await App.api('/api/jobs?'+p);
    if(!d.success){ con.innerHTML='<div class="empty"><p>Could not load jobs.</p></div>'; return; }
    App.totPages=d.totalPages||1;
    if(meta){ meta.style.display='flex'; App.$('res-count').innerHTML='Showing <strong>'+d.data.length+'</strong> of <strong>'+(d.total||0).toLocaleString()+'</strong>'+(kw?' for "<strong>'+App.esc(kw)+'</strong>"':''); }
    con.innerHTML=d.data.length?'<div class="jobs-list">'+d.data.map(Search.card).join('')+'</div>':'<div class="empty"><div class="empty-icon">ðŸ”</div><h3>No jobs found</h3></div>';
    Search.renderPg();
  },

  loadPage: async function(pg){
    App.curPage=pg;
    var kw=String((App.$('s-kw')?.value||'').trim()), city=String((App.$('s-city')?.value||'').trim());
    var p=new URLSearchParams({page:pg,limit:15});
    if(kw) p.set('keyword',kw); if(city) p.set('city',city); if(App.remOnly) p.set('remote','true');
    var d=await App.api('/api/jobs?'+p);
    if(!d.success) return;
    App.totPages=d.totalPages||1;
    App.$('res-count').innerHTML='Showing <strong>'+d.data.length+'</strong> of <strong>'+(d.total||0).toLocaleString()+'</strong>'+(kw?' for "<strong>'+App.esc(kw)+'</strong>"':'');
    App.$('jobs-con').innerHTML=d.data.length?'<div class="jobs-list">'+d.data.map(Search.card).join('')+'</div>':'<div class="empty"><h3>No jobs found</h3></div>';
    Search.renderPg(); window.scrollTo(0,0);
  },

  card: function(j){
    var sal=App.fmtSal(j.salary_min,j.salary_max,j.salary_currency), isR=j.remote_type==='remote', sv=App.savedIds[j.id];
    return '<div class="list-card" onclick="Detail.open(\''+App.esc(j.id)+'\',\'search\')"><div class="av" style="width:48px;height:48px;flex-shrink:0">'+App.ini(j.company)+'</div><div class="list-body"><div class="list-title">'+App.esc(j.title)+'</div><div class="list-company">'+App.esc(j.company||'Company')+(j.city?' Â· '+App.esc(j.city):'')+'</div><div class="tags" style="margin-top:6px">'+(isR?'<span class="tag remote">Remote</span>':'')+(j.employment_type?'<span class="tag">'+App.esc(j.employment_type)+'</span>':'')+(sal?'<span class="tag salary">'+sal+'</span>':'')+'</div>'+(j.snippet?'<div class="list-snippet">'+App.esc(j.snippet)+'</div>':'')+'</div><div class="list-right"><span>'+App.ago(j.posted_at)+'</span>'+(App.CU?'<button class="save-btn'+(sv?' saved':'')+'" onclick="event.stopPropagation();Saved.toggle(\''+App.esc(j.id)+'\',this)">'+(sv?'â™¥ Saved':'â™¡ Save')+'</button>':'')+'<span>'+App.esc(j.source&&j.source.name?j.source.name:'')+'</span></div></div>';
  },

  renderPg: function(){
    var pg=App.$('pg'); if(!pg) return;
    if(App.totPages<=1){ pg.innerHTML=''; return; }
    var h='<button class="page-btn" onclick="Search.loadPage('+(App.curPage-1)+')" '+(App.curPage===1?'disabled':'')+'>â† Prev</button>';
    var s=Math.max(1,App.curPage-2), e=Math.min(App.totPages,App.curPage+2);
    if(s>1) h+='<button class="page-btn" onclick="Search.loadPage(1)">1</button>'+(s>2?'<span style="color:var(--text-muted);padding:0 4px">â€¦</span>':'');
    for(var i=s;i<=e;i++) h+='<button class="page-btn'+(i===App.curPage?' active':'')+'" onclick="Search.loadPage('+i+')">'+i+'</button>';
    if(e<App.totPages) h+=(e<App.totPages-1?'<span style="color:var(--text-muted);padding:0 4px">â€¦</span>':'')+' <button class="page-btn" onclick="Search.loadPage('+App.totPages+')">'+App.totPages+'</button>';
    h+='<button class="page-btn" onclick="Search.loadPage('+(App.curPage+1)+')" '+(App.curPage===App.totPages?'disabled':'')+'>Next â†’</button>';
    pg.innerHTML=h;
  },

  togRem: function(){ App.remOnly=!App.remOnly; var t=App.$('rem-tog'); if(t) t.classList.toggle('on',App.remOnly); },

  fetchSug: async function(q){
    clearTimeout(Search.sugTimer);
    var box=App.$('sug-box'); if(!box) return;
    if(q.length<2){ box.classList.remove('open'); return; }
    Search.sugTimer=setTimeout(async function(){
      var d=await App.api('/api/search/suggest?q='+encodeURIComponent(q));
      if(d.success&&d.data&&d.data.length){
        box.innerHTML=d.data.map(function(s){ var text=typeof s==='string'?s:(s.title||s.name||String(s)); return '<div class="suggest-item" onmousedown="Search.pickSug(\''+App.esc(text)+'\')">'+App.esc(text)+'</div>'; }).join('');
        box.classList.add('open');
      } else box.classList.remove('open');
    },250);
  },

  pickSug: function(v){ App.$('s-kw').value=v; App.$('sug-box').classList.remove('open'); Search.doSearch(); }
};

document.addEventListener('click',function(e){ if(!e.target.closest('.toolbar-wrap')&&App.$('sug-box')) App.$('sug-box').classList.remove('open'); });

