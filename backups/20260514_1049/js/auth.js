// ============================================================
// js/auth.js â€” Authentication (login/register modal)
// ============================================================
var Auth = {
  openModal: function(mode){
    App.modalMode=mode;
    Auth.render();
    App.$('auth-modal').classList.add('open');
  },
  closeModal: function(){
    App.$('auth-modal').classList.remove('open');
  },
  switchMode: function(){
    App.modalMode=App.modalMode==='login'?'register':'login';
    Auth.render();
  },
  render: function(){
    var isL=App.modalMode==='login';
    App.$('m-title').textContent=isL?'Welcome back.':'Create account.';
    App.$('m-sub').innerHTML=isL?'Don\'t have an account? <span onclick="Auth.switchMode()">Sign up free</span>':'Already have an account? <span onclick="Auth.switchMode()">Sign in</span>';
    App.$('m-name-wrap').classList.toggle('hidden',isL);
    App.$('m-submit').textContent=isL?'Sign In':'Create Account';
    App.$('m-error').classList.remove('show');
  },
  submit: async function(){
    var email=App.$('m-email').value.trim(), pass=App.$('m-pass').value, err=App.$('m-error');
    if(!email||!pass){ err.textContent='Email and password required.'; err.classList.add('show'); return; }
    App.$('m-submit').disabled=true; App.$('m-submit').textContent='Please waitâ€¦';
    try{
      var res;
      if(App.modalMode==='login'){
        res=await App.api('/api/auth/login',{method:'POST',body:JSON.stringify({email:email,password:pass})});
      } else {
        var name=App.$('m-name').value.trim(), role=App.$('m-role').value;
        res=await App.api('/api/auth/register',{method:'POST',body:JSON.stringify({email:email,password:pass,full_name:name,role:role})});
        if(res.success){ App.toast('âœ‰ï¸ Check your email to confirm.'); Auth.closeModal(); App.$('m-submit').disabled=false; Auth.render(); return; }
      }
      if(!res.success) throw new Error(res.error||'Authentication failed');
      App.tok=res.data.session.access_token; App.CU=res.data.user;
      localStorage.setItem('_jc_tok',App.tok); localStorage.setItem('_jc_user',JSON.stringify(App.CU));
      Auth.closeModal(); App.updateNav(); App.toast('Welcome! ðŸ‘‹');
      if(typeof Saved !== 'undefined') Saved.loadIds();
    } catch(e){ err.textContent=e.message; err.classList.add('show'); }
    finally{ App.$('m-submit').disabled=false; Auth.render(); }
  }
};

// Global refs for onclick handlers in HTML
var openModal = Auth.openModal;
var closeModal = Auth.closeModal;
var switchMode = Auth.switchMode;
var submitAuth = Auth.submit;

