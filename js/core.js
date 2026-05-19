var API = 'https://jobcopilot-api-zeuk.onrender.com';
var tok = localStorage.getItem('_jc_tok') || null;
var CU  = (function(){ try{ return JSON.parse(localStorage.getItem('_jc_user') || 'null'); } catch(e){ localStorage.removeItem('_jc_user'); return null; } })();
var savedIds = {};
var curPage = 1, totPages = 1, remOnly = false, prevPg = 'home';
var modalMode = 'login', newSkillProf = 3;
var sugTimer = null, trkFilter = 'all', allApps = [];
var adminLoaded = false;

// ── UTILS ──
function $(id){ return document.getElementById(id); }
function esc(s){ if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function ago(d){ if(!d)return''; var diff=Math.floor((Date.now()-new Date(d))/86400000); if(diff===0)return'Today'; if(diff===1)return'Yesterday'; if(diff<7)return diff+'d ago'; if(diff<30)return Math.floor(diff/7)+'w ago'; return Math.floor(diff/30)+'mo ago'; }
function fmtSal(mn,mx,c){ if(!mn&&!mx)return null; c=c||'₱'; var f=function(n){return n>=1000?Math.round(n/1000)+'k':n;}; if(mn&&mx)return c+f(mn)+'–'+f(mx); if(mx)return'Up to '+c+f(mx); return c+f(mn)+'+'; }
function ini(n){ return(n||'?').trim()[0].toUpperCase(); }
function toast(m,d){ var t=$('toast'); t.textContent=m; t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); },d||3000); }
function starsHtml(n){
  var h=''; for(var i=1;i<=5;i++){
    if(i<=n) h+='<span class="stars"><span class="on">★</span></span>';
    else h+='<span class="stars"><span class="off">★</span></span>';
  }
  return '<div class="stars">'+h+'</div>';
}
function starsHtmlInline(n){
  var h='<div class="stars">';
  for(var i=1;i<=5;i++) h+='<span class="'+(i<=n?'on':'off')+'">★</span>';
  return h+'</div>';
}

async function api(path,opts,auth){
  var h={'Content-Type':'application/json'};
  if(auth&&tok) h['Authorization']='Bearer '+tok;
  opts=opts||{};
  var r=await fetch(API+path,Object.assign({},opts,{headers:Object.assign({},h,opts.headers||{})}));
  if(r.status===401&&auth){ doLogout(); throw new Error('Session expired'); }
  return r.json();
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', function () {
  updateNav();
  go('home');

  if (tok && CU) {
    loadSavedIds();
  }
});

