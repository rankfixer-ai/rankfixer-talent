// ── ADMIN ──
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
