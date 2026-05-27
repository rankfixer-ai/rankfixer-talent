// ── NAV ──
function updateNav(){
  var a=!!CU;
  if(a){
    var letter=ini(CU.name||CU.email||'U');
    var sets=getSettings();
    $('nav-auth').innerHTML='<div class="nav-user-wrap" id="nav-user-wrap">'
      +'<button class="nav-av-btn" onclick="togNavDD()" title="'+(CU.name||CU.email||'Account')+'">'+letter+'</button>'
      +'<div class="nav-dropdown" id="nav-dd">'
      +'<button class="nav-dd-item" onclick="closeNavDD();go(\'profile\')">👤 My Profile</button>'
      +'<button class="nav-dd-item" onclick="closeNavDD();go(\'saved\')">🔖 Saved Jobs</button>'
      +'<button class="nav-dd-item" onclick="closeNavDD();go(\'tracker\')">📋 Applications</button>'
      +'<div class="nav-dd-divider"></div>'
      +'<div class="nav-dd-section">Settings</div>'
      +'<div class="nav-dd-row" onclick="togNotif()">'
      +'<span class="nav-dd-row-label">Notifications</span>'
      +'<div class="toggle'+(sets.notif?' on':'')+'" id="notif-tog"></div>'
      +'</div>'
      +'<div class="nav-dd-row" onclick="togPrivacy()">'
      +'<span class="nav-dd-row-label">Public Profile</span>'
      +'<div class="toggle'+(sets.pub?' on':'')+'" id="pub-tog"></div>'
      +'</div>'
      +'<div class="nav-dd-divider"></div>'
      +'<button class="nav-dd-item danger" onclick="closeNavDD();doLogout()">Sign Out</button>'
      +'</div></div>';
  } else {
    $('nav-auth').innerHTML='<button class="nav-signin" onclick="openModal(\'login\')">Sign In</button>'
      +'<button class="nav-signup" onclick="openModal(\'register\')">Sign Up</button>';
  }
  $('nav-saved').style.display    = a?'':'none';
  $('nav-tracker').style.display  = a?'':'none';
  $('nav-employer').style.display = (a&&CU&&(CU.role==='employer'||CU.role==='admin'))?'':'none';
  $('nav-admin').style.display    = (a&&CU&&CU.email&&CU.email.indexOf('admin')>-1)?'':'none';
  // Sync mobile tabs
  var ms=$('mobt-saved');    if(ms) ms.style.display=a?'':'none';
  var mt=$('mobt-tracker');  if(mt) mt.style.display=a?'':'none';
  var pl=$('mobt-profile-label'); if(pl) pl.textContent=a?(CU.name||'Profile'):'';
  var mp=$('mobt-profile'); if(mp) mp.style.display=a?'':'none';
}
function togNavDD(){ var dd=$('nav-dd'); if(dd) dd.classList.toggle('open'); }
function closeNavDD(){ var dd=$('nav-dd'); if(dd) dd.classList.remove('open'); }
function getSettings(){ try{ return JSON.parse(localStorage.getItem('_jc_settings')||'{"notif":true,"pub":true}'); }catch(e){ return {notif:true,pub:true}; } }
function saveSettings(s){ localStorage.setItem('_jc_settings',JSON.stringify(s)); }
function togNotif(){ var s=getSettings(); s.notif=!s.notif; saveSettings(s); var t=$('notif-tog'); if(t) t.classList.toggle('on',s.notif); toast(s.notif?'Notifications on':'Notifications off'); }
function togPrivacy(){ var s=getSettings(); s.pub=!s.pub; saveSettings(s); var t=$('pub-tog'); if(t) t.classList.toggle('on',s.pub); toast(s.pub?'Profile is now public':'Profile is now private'); }
