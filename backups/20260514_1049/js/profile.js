var Profile={
  data:{},
  load:async function(){
    if(!App.CU){ App.go('home'); App.openModal('login'); return; }
    try{
      var d=await App.api('/api/profile',{},true);
      if(!d.success) return;
      Profile.data=d.data||{};
      Profile.renderForm();
    } catch(e){ App.toast('Could not load profile.'); }
  },
  renderForm:function(){
    var p=Profile.data;
    App.$('profile-content').innerHTML=`
      <div class="profile-block"><div class="block-label">Professional Identity</div>
        <div class="f-row"><div><label class="f-label">Full Name</label><input class="f-input" id="p-name" value="${App.esc(p.full_name||'')}"/></div><div><label class="f-label">LinkedIn URL</label><input class="f-input" id="p-linkedin" value="${App.esc(p.linkedin_url||'')}"/></div></div>
        <div class="f-row"><div><label class="f-label">Email</label><input class="f-input" value="${App.esc(p.email||App.CU.email||'')}" readonly style="opacity:.6"/></div><div><label class="f-label">Mobile</label><input class="f-input" id="p-phone" value="${App.esc(p.phone||'')}"/></div></div>
        <div class="f-row"><div><label class="f-label">Looking for</label><input class="f-input" id="p-jobtitle" value="${App.esc(p.job_title||'')}"/></div><div><label class="f-label">Location</label><input class="f-input" id="p-location" value="${App.esc(p.location||'')}"/></div></div>
        <div class="f-row"><div class="full"><label class="f-label">Bio</label><textarea class="f-textarea" id="p-bio">${App.esc(p.bio||'')}</textarea></div></div>
      </div>
      <button class="prof-save-btn" onclick="Profile.save()">Save Profile Changes</button>
      <div style="text-align:center;margin-top:1.5rem"><button class="section-link" onclick="App.doLogout()">Sign Out â†’</button></div>`;
  },
  save:async function(){
    var d=await App.api('/api/profile',{method:'PUT',body:JSON.stringify({full_name:App.$('p-name').value,phone:App.$('p-phone').value,location:App.$('p-location').value,job_title:App.$('p-jobtitle').value,linkedin_url:App.$('p-linkedin').value,bio:App.$('p-bio').value})},true);
    if(d.success){ Profile.data=d.data; App.toast('Profile saved âœ“'); } else App.toast('Error: '+d.error);
  }
};

