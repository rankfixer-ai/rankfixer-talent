var Contact={
  submit:async function(){
    var name=App.$('cf-name').value.trim(), email=App.$('cf-email').value.trim(), msg=App.$('cf-message').value.trim();
    if(!name||!email||!msg){ App.toast('All fields required.'); return; }
    try{
      var r=await fetch('https://formspree.io/f/xzdagqnk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,message:msg})});
      if(r.ok){ App.$('contact-form-body').style.display='none'; App.$('contact-success').style.display='block'; } else App.toast('Error sending.');
    } catch(e){ App.toast('Could not send.'); }
  },
  reset:function(){ App.$('cf-name').value=''; App.$('cf-email').value=''; App.$('cf-message').value=''; App.$('contact-form-body').style.display='block'; App.$('contact-success').style.display='none'; }
};
var submitContact=Contact.submit, resetContact=Contact.reset;

