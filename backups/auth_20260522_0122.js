// ── AUTH MODAL ──
function openModal(mode){ modalMode=mode; renderModal(); $('auth-modal').classList.add('open'); }
function closeModal(){ $('auth-modal').classList.remove('open'); }
function switchMode(){ modalMode=modalMode==='login'?'register':'login'; renderModal(); }
function renderModal(){
  var isL=modalMode==='login';
  $('m-title').textContent=isL?'Welcome back.':'Create account.';
  $('m-sub').innerHTML=isL?'Don\'t have an account? <span onclick="switchMode()">Sign up free</span>':'Already have an account? <span onclick="switchMode()">Sign in</span>';
  $('m-name-wrap').style.display=isL?'none':'block';
  $('m-submit').textContent=isL?'Sign In':'Create Account';
  $('m-error').classList.remove('show');
}
async function submitAuth(){
  var email=$('m-email').value.trim(), pass=$('m-pass').value;
  var err=$('m-error');
  if(!email||!pass){ err.textContent='Email and password required.'; err.classList.add('show'); return; }
  $('m-submit').disabled=true; $('m-submit').textContent='Please wait…';
  try{
    var res;
    if(modalMode==='login'){
      res=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:email,password:pass})});
    } else {
      var name=$('m-name').value.trim(), role=$('m-role').value;
      res=await api('/api/auth/register',{method:'POST',body:JSON.stringify({email:email,password:pass,full_name:name,role:role})});
      if(res.success){ toast('✉️ Check your email to confirm.'); closeModal(); $('m-submit').disabled=false; renderModal(); return; }
    }
    if(!res.success) throw new Error(res.error||'Authentication failed');
    tok=res.data.session.access_token; CU=res.data.user;
    localStorage.setItem('_jc_tok',tok);
    localStorage.setItem('_jc_user',JSON.stringify(CU));
    closeModal(); updateNav(); toast('Welcome! 👋'); loadSavedIds();
  } catch(e){ err.textContent=e.message; err.classList.add('show'); }
  finally{ $('m-submit').disabled=false; renderModal(); }
}
function doLogout(){
  tok=null; CU=null; savedIds={};
  localStorage.removeItem('_jc_tok'); localStorage.removeItem('_jc_user');
  updateNav(); go('home'); toast('Signed out.');
}
