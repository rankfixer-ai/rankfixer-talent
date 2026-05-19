// ── CONTACT ──
async function submitContact(){
  var name=$('cf-name').value.trim();
  var email=$('cf-email').value.trim();
  var subject=$('cf-subject').value;
  var message=$('cf-message').value.trim();
  var err=$('cf-error');
  err.classList.remove('show');
  if(!name||!email||!subject||!message){
    err.textContent='Please fill in all fields before sending.';
    err.classList.add('show');
    return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    err.textContent='Please enter a valid email address.';
    err.classList.add('show');
    return;
  }
  var btn=$('cf-submit');
  btn.disabled=true; btn.textContent='Sending…';
  try{
    // Replace the action URL below with your Formspree endpoint, e.g.:
    // https://formspree.io/f/YOUR_FORM_ID
    var res=await fetch('https://formspree.io/f/xzdagqnk',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({name:name,email:email,subject:subject,message:message})
    });
    if(res.ok){
      $('contact-form-body').style.display='none';
      $('contact-success').style.display='block';
    } else {
      err.textContent='Something went wrong. Please try again or email us directly.';
      err.classList.add('show');
      btn.disabled=false; btn.textContent='Send message';
    }
  } catch(e){
    err.textContent='Could not send. Please check your connection and try again.';
    err.classList.add('show');
    btn.disabled=false; btn.textContent='Send message';
  }
}
function resetContact(){
  $('cf-name').value=''; $('cf-email').value=''; $('cf-subject').value=''; $('cf-message').value='';
  $('cf-error').classList.remove('show');
  $('cf-submit').disabled=false; $('cf-submit').textContent='Send message';
  $('contact-form-body').style.display='block';
  $('contact-success').style.display='none';
}
