// ── UPDATE PROFILE ──
var profData = {};
async function loadProfile(){
  if(!CU){ go('home'); openModal('login'); return; }
  try{
    var d=await api('/api/profile',{},true);
    if(!d.success) return;
    profData=d.data||{};
    $('p-name').value=profData.full_name||'';
    $('p-email').value=profData.email||CU.email||'';
    $('p-phone').value=profData.phone||'';
    $('p-jobtitle').value=profData.job_title||'';
    $('p-location').value=profData.location||'';
    $('p-linkedin').value=profData.linkedin_url||'';
    $('p-bio').value=profData.bio||'';
    $('p-resume-url').value=profData.resume_url||'';
    if(profData.availability) $('p-avail').value=profData.availability;
    renderSkillsList(profData.skills||[]);
    renderExpList(profData.experience||[]);
    renderEduList(profData.education||[]);
    calcStrength();
  } catch(e){ toast('Could not load profile.'); }
}
function calcStrength(){
  var p=profData; var sc=0;
  if(p.full_name) sc++;
  if(p.linkedin_url) sc++;
  if(p.skills&&p.skills.length) sc++;
  if(p.experience&&p.experience.length) sc++;
  if(p.education&&p.education.length) sc++;
  var b=$('strength-badge');
  if(sc>=5){ b.textContent='✓ Profile 100% Complete'; b.classList.remove('partial'); }
  else if(sc>=3){ b.textContent='Profile '+Math.round(sc/5*100)+'% Complete'; b.classList.add('partial'); }
  else{ b.textContent='Building profile… '+Math.round(sc/5*100)+'%'; b.classList.add('partial'); }
}
async function saveProfile(){
  var d=await api('/api/profile',{method:'PUT',body:JSON.stringify({
    full_name:   $('p-name').value,
    phone:       $('p-phone').value,
    location:    $('p-location').value,
    job_title:   $('p-jobtitle').value,
    linkedin_url:$('p-linkedin').value,
    bio:         $('p-bio').value,
    resume_url:  $('p-resume-url').value,
    availability:$('p-avail').value
  })},true);
  if(d.success){ Object.assign(profData,d.data); toast('Profile saved ✓'); calcStrength(); } else toast('Error: '+d.error);
}

// Skills
var newSkillProf=3;
function setNewSkillStar(n){
  newSkillProf=n;
  var stars=$('new-skill-stars').querySelectorAll('.star');
  stars.forEach(function(s,i){ if(i<n) s.classList.add('on'); else s.classList.remove('on'); });
}
function renderSkillsList(skills){
  if(!skills.length){ $('skills-list').innerHTML=''; return; }
  $('skills-list').innerHTML=skills.map(function(s){
    return'<div class="nested-item">'
      +'<button class="nested-del" onclick="delSkill(\''+s.id+'\')">✕</button>'
      +'<div style="display:flex;align-items:center;justify-content:space-between">'
      +'<span style="font-weight:600;font-size:.95rem">'+esc(s.skill_name)+'</span>'
      +starsHtmlInline(s.proficiency||3)
      +'</div></div>';
  }).join('');
}
async function addSkill(){
  var name=$('new-skill').value.trim();
  if(!name){ toast('Enter a skill name.'); return; }
  var d=await api('/api/skills',{method:'POST',body:JSON.stringify({skill_name:name,proficiency:newSkillProf})},true);
  if(d.success){ profData.skills=profData.skills||[]; profData.skills.push(d.data); renderSkillsList(profData.skills); $('new-skill').value=''; toast('Skill added!'); calcStrength(); }
  else toast('Error: '+d.error);
}
async function delSkill(id){
  await api('/api/skills/'+id,{method:'DELETE'},true);
  profData.skills=profData.skills.filter(function(s){ return s.id!==id; });
  renderSkillsList(profData.skills); toast('Skill removed.'); calcStrength();
}

// Experience
function renderExpList(exp){
  if(!exp.length){ $('exp-list').innerHTML=''; return; }
  $('exp-list').innerHTML=exp.map(function(e){
    return'<div class="nested-item">'
      +'<button class="nested-del" onclick="delExp(\''+e.id+'\')">✕</button>'
      +'<div style="font-weight:600;font-size:.95rem">'+esc(e.job_title)+'</div>'
      +'<div style="font-size:.88rem;color:var(--text-sub);margin-top:3px">'+esc(e.company)+(e.start_date?' · '+e.start_date.slice(0,7):'')+(e.end_date?' – '+e.end_date.slice(0,7):e.start_date?' – Present':'')+'</div>'
      +'</div>';
  }).join('');
}
async function saveExp(){
  var t=$('ne-title').value.trim(), c=$('ne-company').value.trim();
  if(!t||!c){ toast('Job title and company are required.'); return; }
  var d=await api('/api/experience',{method:'POST',body:JSON.stringify({job_title:t,company:c,start_date:$('ne-start').value||null,end_date:$('ne-end').value||null})},true);
  if(d.success){ profData.experience=profData.experience||[]; profData.experience.unshift(d.data); renderExpList(profData.experience); $('ne-title').value=''; $('ne-company').value=''; $('ne-start').value=''; $('ne-end').value=''; $('new-exp-form').style.display='none'; toast('Experience added!'); calcStrength(); }
  else toast('Error: '+d.error);
}
async function delExp(id){
  await api('/api/experience/'+id,{method:'DELETE'},true);
  profData.experience=profData.experience.filter(function(e){ return e.id!==id; });
  renderExpList(profData.experience); toast('Removed.'); calcStrength();
}

// Education
function renderEduList(edu){
  if(!edu.length){ $('edu-list').innerHTML=''; return; }
  $('edu-list').innerHTML=edu.map(function(e){
    return'<div class="nested-item">'
      +'<button class="nested-del" onclick="delEdu(\''+e.id+'\')">✕</button>'
      +'<div style="font-weight:600;font-size:.95rem">'+esc(e.degree||'Degree')+'</div>'
      +'<div style="font-size:.88rem;color:var(--text-sub);margin-top:3px">'+esc(e.school)+(e.graduation_year?' · '+e.graduation_year:'')+'</div>'
      +'</div>';
  }).join('');
}
async function saveEdu(){
  var s=$('ne-school').value.trim();
  if(!s){ toast('School name is required.'); return; }
  var d=await api('/api/education',{method:'POST',body:JSON.stringify({school:s,degree:$('ne-degree').value.trim()||null,graduation_year:parseInt($('ne-year').value)||null})},true);
  if(d.success){ profData.education=profData.education||[]; profData.education.unshift(d.data); renderEduList(profData.education); $('ne-school').value=''; $('ne-degree').value=''; $('ne-year').value=''; $('new-edu-form').style.display='none'; toast('Education added!'); calcStrength(); }
  else toast('Error: '+d.error);
}
async function delEdu(id){
  await api('/api/education/'+id,{method:'DELETE'},true);
  profData.education=profData.education.filter(function(e){ return e.id!==id; });
  renderEduList(profData.education); toast('Removed.'); calcStrength();
}

// ── PUBLIC PROFILE ──
async function openPubProfile(userId, from){
  prevPage=from||'search'; go('pub-profile');
  $('pub-profile-con').innerHTML='<div class="loading"><div class="spinner"></div></div>';
  var d=await api('/api/profile/'+userId);
  if(!d.success){ $('pub-profile-con').innerHTML='<div class="empty"><p>Profile not found.</p></div>'; return; }
  $('pub-profile-con').innerHTML=pubProfileHtml(d.data);
}
function pubProfileHtml(p){
  var hasLI = !!p.linkedin_url;
  var hasSk = p.skills&&p.skills.length>0;
  var hasEx = p.experience&&p.experience.length>0;
  var hasEd = p.education&&p.education.length>0;
  var complete = hasLI&&hasSk&&hasEx&&hasEd;

  var h='<div class="pub-card">';

  // Header
  h+='<div class="pub-hdr"><div class="pub-av-area">';
  h+='<div class="pub-av">'+ini(p.full_name)+'</div>';
  h+='<div class="pub-meta">';
  h+='<div style="display:inline-flex;align-items:center;gap:6px;background:'+(complete?'var(--remote-bg)':'var(--gold-bg)')+';color:'+(complete?'var(--remote-txt)':'var(--gold-txt)')+';padding:4px 12px;border-radius:100px;font-size:.75rem;font-weight:600;margin-bottom:.5rem">';
  h+=(complete?'✓ Profile 100% Complete':'Profile Ready')+'</div>';
  h+='<h1>'+esc(p.full_name||'Candidate')+'</h1>';
  h+='<div class="pub-contact">';
  if(p.job_title) h+='💼 '+esc(p.job_title)+'<br/>';
  if(p.location)  h+='📍 '+esc(p.location)+'<br/>';
  h+='</div></div></div>';

  // Actions
  h+='<div class="pub-actions">';
  h+='<a href="mailto:" class="pub-msg-btn">Send Message</a>';
  if(p.linkedin_url) h+='<a href="'+esc(p.linkedin_url)+'" target="_blank" rel="noopener" class="pub-li-btn">LinkedIn Profile</a>';
  if(p.resume_url) h+='<a href="'+esc(p.resume_url)+'" target="_blank" rel="noopener" class="pub-dl-btn">Download Resume</a>';
  else h+='<button class="pub-dl-btn" onclick="window.print()">Download Resume</button>';
  h+='</div></div>';

  // Body
  h+='<div class="pub-body">';

  // Skills
  if(hasSk){
    h+='<div class="sec-label">Core Expertise</div>';
    h+='<div class="skills-grid">';
    p.skills.forEach(function(s){
      h+='<div class="skill-badge"><span class="skill-name">'+esc(s.skill_name)+'</span>'+starsHtmlInline(s.proficiency||3)+'</div>';
    });
    h+='</div>';
  }

  // Experience
  if(hasEx){
    h+='<div class="sec-label">Experience</div>';
    p.experience.forEach(function(e){
      h+='<div class="timeline-item">';
      h+='<div class="tl-title">'+esc(e.job_title)+'</div>';
      h+='<div class="tl-sub">'+esc(e.company);
      if(e.start_date) h+=' • '+e.start_date.slice(0,7)+' – '+(e.end_date?e.end_date.slice(0,7):'Present');
      h+='</div></div>';
    });
  }

  // Education
  if(hasEd){
    h+='<div class="sec-label">Education</div>';
    p.education.forEach(function(e){
      h+='<div class="timeline-item tl-item-edu">';
      h+='<div class="tl-title">'+esc(e.degree||'Degree')+'</div>';
      h+='<div class="tl-sub">'+esc(e.school)+(e.graduation_year?' • '+e.graduation_year:'')+'</div>';
      h+='</div>';
    });
  }

  if(!hasSk&&!hasEx&&!hasEd){
    h+='<div class="empty"><div class="empty-icon">👤</div><h3>Profile in progress</h3><p>This candidate is still building their profile.</p></div>';
  }

  if(p.bio){
    h+='<div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border)">';
    h+='<div style="font-size:.72rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.75rem">About</div>';
    h+='<p style="font-size:.9rem;color:var(--text-sub);line-height:1.75">'+esc(p.bio)+'</p>';
    h+='</div>';
  }

  return h+'</div></div>';
}
