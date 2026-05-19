// ============================================================
// js/home.js â€” Home page (hero, dashboard, recent jobs)
// ============================================================
var Home = {
  load: async function(){
    try{
      var s=await App.api('/api/stats');
      if(s.success){
        var total=App.$('stat-total'); if(total) total.textContent=(s.data.totalJobs||0).toLocaleString();
        var remote=App.$('stat-remote'); if(remote) remote.textContent=(s.data.remoteJobs||0).toLocaleString();
      }
      var j=await App.api('/api/jobs?limit=6');
      var con=App.$('home-jobs');
      if(con) con.innerHTML=(j.success&&j.data.length)?j.data.map(Home.card).join(''):'<div class="empty"><div class="empty-icon">ðŸ”</div><h3>No jobs yet</h3></div>';
    } catch(e){}
  },

  card: function(j){
    var sal=App.fmtSal(j.salary_min,j.salary_max,j.salary_currency), isR=j.remote_type==='remote', isN=j.posted_at&&(Date.now()-new Date(j.posted_at))/86400000<2;
    return '<div class="job-card" onclick="Detail.open(\''+App.esc(j.id)+'\',\'home\')"><div class="card-top"><div class="av">'+App.ini(j.company)+'</div><div><div class="card-title">'+App.esc(j.title)+'</div><div class="card-company">'+App.esc(j.company||'Company')+'</div></div></div><div class="tags">'+(j.city?'<span class="tag">ðŸ“ '+App.esc(j.city)+'</span>':'')+(isR?'<span class="tag remote">ðŸ  Remote</span>':'')+(j.employment_type?'<span class="tag">'+App.esc(j.employment_type)+'</span>':'')+(sal?'<span class="tag salary">'+sal+'</span>':'')+(isN?'<span class="tag new-tag">New</span>':'')+'</div><div class="card-footer"><span>'+App.esc(j.source&&j.source.name?j.source.name:'Job Board')+'</span><span>'+App.ago(j.posted_at)+'</span></div></div>';
  },

  init: function(){
    Home.load();
  }
};

// Global helpers for onclick in HTML
function heroSearch(){ App.$('s-kw').value=App.$('h-kw').value.trim(); App.go('search'); }
function qSearch(kw){ App.$('s-kw').value=kw; App.go('search'); }

