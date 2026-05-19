var Faq={
  toggle:function(btn){ btn.closest('.faq-item').classList.toggle('open'); },
  tab:function(id,btn){ document.querySelectorAll('.faq-group').forEach(function(g){g.style.display='none';}); document.querySelectorAll('.faq-tab-btn').forEach(function(b){b.classList.remove('active');}); var el=document.getElementById('faq-'+id); if(el) el.style.display='block'; btn.classList.add('active'); }
};
var faqToggle=Faq.toggle, faqTab=Faq.tab;

