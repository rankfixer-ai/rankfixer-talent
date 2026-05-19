var Admin={ loaded:false,
  load:async function(){ if(Admin.loaded) return; Admin.loaded=true; var s=await App.api('/api/stats'); App.$('admin-content').innerHTML='<div class="admin-stat-grid"><div class="admin-stat hl"><span class="admin-stat-num">'+(s.success?(s.data.totalJobs||0).toLocaleString():0)+'</span><div class="admin-stat-label">Active jobs</div></div></div>'; }
};

