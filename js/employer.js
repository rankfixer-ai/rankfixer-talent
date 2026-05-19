// ── EMPLOYER ──
async function loadEmpStats(){
  var d=await api('/api/stats');
  if(d.success){ $('emp-total').textContent=(d.data.totalJobs||0).toLocaleString(); $('emp-remote').textContent=(d.data.remoteJobs||0).toLocaleString(); }
}
function togglePostForm(){ $('post-form').style.display=$('post-form').style.display==='none'?'block':'none'; }
async function submitJob(){
  if(!CU){ openModal('login'); return; }
  var title=$('pj-title').value.trim(), company=$('pj-company').value.trim(), desc=$('pj-desc').value.trim();
  if(!title||!company||!desc){ toast('Title, company, and description are required.'); return; }
  var d=await api('/api/employer/jobs',{method:'POST',body:JSON.stringify({title:title,company:company,city:$('pj-city').value.trim(),remote_type:$('pj-remote').value,employment_type:$('pj-type').value,salary_min:parseInt($('pj-sal-min').value)||null,salary_max:parseInt($('pj-sal-max').value)||null,description:desc,job_url:$('pj-url').value.trim()})},true);
  if(d.success){ toast('Job posted! ✓'); togglePostForm(); loadEmpJobs(); }
  else toast('Error: '+(d.error||'Post failed'));
}
async function loadEmpJobs(){
  if(!CU||!tok) return;
  var d=await api('/api/employer/jobs',{},true);
  if(d.success&&d.data&&d.data.length){
    $('emp-jobs-sec').style.display='block';
    $('emp-jobs-list').innerHTML=d.data.map(function(j){
      return'<div class="emp-job-card"><div class="emp-job-info">'
        +'<div class="emp-job-title">'+esc(j.title)+'</div>'
        +'<div class="emp-job-meta">'+esc(j.company||'')+(j.city?' · '+esc(j.city):'')+(j.posted_at?' · '+ago(j.posted_at):'')+'</div>'
        +'</div><div class="emp-job-actions">'
        +'<button class="emp-btn danger" onclick="delEmpJob(\''+j.id+'\')">Delete</button>'
        +'</div></div>';
    }).join('');
  }
}
async function delEmpJob(id){ await api('/api/employer/jobs/'+id,{method:'DELETE'},true); loadEmpJobs(); toast('Job removed.'); }
