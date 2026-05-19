// ── FAQ ──
function faqToggle(btn){
  var item=btn.closest('.faq-item');
  item.classList.toggle('open');
}
function faqTab(id,btn){
  document.querySelectorAll('.faq-group').forEach(function(g){g.style.display='none';});
  document.querySelectorAll('.faq-tab-btn').forEach(function(b){b.classList.remove('active');});
  document.getElementById('faq-'+id).style.display='block';
  btn.classList.add('active');
}
