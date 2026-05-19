// ============================================================
// js/app.js â€” Core application shell
// ============================================================
var App = {
  API: 'https://jobcopilot-api-zeuk.onrender.com',
  tok: localStorage.getItem('_jc_tok') || null,
  CU: (function(){ try{ return JSON.parse(localStorage.getItem('_jc_user')||'null'); } catch(e){ localStorage.removeItem('_jc_user'); return null; } })(),
  savedIds: {},
  curPage: 1,
  totPages: 1,
  remOnly: false,
  prevPage: 'home',
  modalMode: 'login',

  // â”€â”€ UTILS â”€â”€
  $: function(id){ return document.getElementById(id); },
  esc: function(s){ if(!s)return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },
  ago: function(d){ if(!d)return ''; var diff=Math.floor((Date.now()-new Date(d))/86400000); if(diff===0)return 'Today'; if(diff===1)return 'Yesterday'; if(diff<7)return diff+'d ago'; if(diff<30)return Math.floor(diff/7)+'w ago'; return Math.floor(diff/30)+'mo ago'; },
  fmtSal: function(mn,mx,c){ if(!mn&&!mx)return null; c=c||'â‚±'; var f=function(n){return n>=1000?Math.round(n/1000)+'k':n;}; if(mn&&mx)return c+f(mn)+'â€“'+f(mx); if(mx)return 'Up to '+c+f(mx); return c+f(mn)+'+'; },
  ini: function(n){ return (n||'?').trim()[0].toUpperCase(); },
  toast: function(m,d){ var t=App.$('toast'); t.textContent=m; t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); },d||3000); },
  starsHtml: function(n){ var h='<div class="stars">'; for(var i=1;i<=5;i++)h+='<span class="'+(i<=n?'on':'off')+'">â˜…</span>'; return h+'</div>'; },

  // â”€â”€ API â”€â”€
  api: async function(path,opts,auth){
    var h={'Content-Type':'application/json'};
    if(auth&&App.tok) h['Authorization']='Bearer '+App.tok;
    opts=opts||{};
    var r=await fetch(App.API+path,Object.assign({},opts,{headers:Object.assign({},h,opts.headers||{})}));
    if(r.status===401&&auth){ App.doLogout(); throw new Error('Session expired'); }
    return r.json();
  },

  // â”€â”€ AUTH BRIDGE â”€â”€
  openModal: function(mode){ if(typeof Auth !== 'undefined') Auth.openModal(mode); },
  closeModal: function(){ if(typeof Auth !== 'undefined') Auth.closeModal(); },

  // â”€â”€ NAV UPDATE â”€â”€
  updateNav: function(){
    var a=!!App.CU;
    if(a){
      var letter=App.ini(App.CU.name||App.CU.email||'U'), sets=App.getSettings();
      App.$('nav-auth').innerHTML='<div class="nav-user-wrap"><button class="nav-av-btn" onclick="App.togNavDD()">'+letter+'</button><div class="nav-dropdown" id="nav-dd"><button class="nav-dd-item" onclick="App.closeNavDD();App.go(\'profile\')">ðŸ‘¤ My Profile</button><button class="nav-dd-item" onclick="App.closeNavDD();App.go(\'saved\')">ðŸ”– Saved Jobs</button><button class="nav-dd-item" onclick="App.closeNavDD();App.go(\'tracker\')">ðŸ“‹ Applications</button><div class="nav-dd-divider"></div><button class="nav-dd-item danger" onclick="App.closeNavDD();App.doLogout()">Sign Out</button></div></div>';
    } else {
      App.$('nav-auth').innerHTML='<button class="nav-signin" onclick="App.openModal(\'login\')">Sign In</button><button class="nav-signup" onclick="App.openModal(\'register\')">Sign Up</button>';
    }
    App.$('nav-saved').classList.toggle('hidden',!a);
    App.$('nav-tracker').classList.toggle('hidden',!a);
    App.$('nav-employer').classList.toggle('hidden',!(a&&App.CU&&(App.CU.role==='employer'||App.CU.role==='admin')));
    App.$('nav-admin').classList.toggle('hidden',!(a&&App.CU&&App.CU.email&&App.CU.email.indexOf('admin')>-1));
  },
  togNavDD: function(){ App.$('nav-dd').classList.toggle('open'); },
  closeNavDD: function(){ App.$('nav-dd').classList.remove('open'); },
  getSettings: function(){ try{ return JSON.parse(localStorage.getItem('_jc_settings')||'{"notif":true,"pub":true}'); }catch(e){ return {notif:true,pub:true}; } },

  // â”€â”€ PAGES â”€â”€
  go: function(name){
    document.querySelectorAll('.mob-tab').forEach(function(b){ b.classList.remove('active'); });
    var tabId=name;
    if(['saved','tracker','profile','pub-profile','employer','admin'].includes(name)) tabId='profile';
    if(name==='detail') tabId=(App.prevPage==='home'?'home':'search');
    if(['explore','courses','salary','trends','employers-featured','tips','messages'].includes(name)) tabId='explore';
    var mb=App.$('mobt-'+tabId); if(mb) mb.classList.add('active');
    App.prevPage=name!=='detail'?name:App.prevPage;
    var loader = App.pageLoaders && App.pageLoaders[name];
    if(loader) loader();
    window.scrollTo(0,0);
  },

  doLogout: function(){
    App.tok=null; App.CU=null; App.savedIds={};
    localStorage.removeItem('_jc_tok'); localStorage.removeItem('_jc_user');
    App.updateNav(); App.go('home'); App.toast('Signed out.');
  },

  // â”€â”€ INIT â”€â”€
  init: function(){
    App.updateNav();
    if(typeof Home !== 'undefined') Home.init();
    if(App.tok&&App.CU && typeof Saved !== 'undefined') Saved.loadIds();
    // Analytics
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','G-9Y99CJ20H4');
    document.addEventListener('click',function(e){
      var el=e.target.closest('.apply-btn');
      if(el){gtag('event','click_apply',{event_category:'engagement'});return;}
      el=e.target.closest('.outline-btn');
      if(el){
        if(el.textContent.includes('Save'))gtag('event','click_save',{event_category:'engagement'});
        if(el.textContent.includes('Track'))gtag('event','click_track',{event_category:'engagement'});
      }
    });
  }
};

// Close dropdown on outside click
document.addEventListener('click',function(e){
  if(!e.target.closest('#nav-user-wrap')){ var dd=App.$('nav-dd'); if(dd)dd.classList.remove('open'); }
});

