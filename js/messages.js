var Messages={
  inited:false,
  init:function(){ if(Messages.inited) return; Messages.inited=true; var c=$('msg-inbox'); if(!c) return; c.innerHTML='<div class="msg-thread"><div class="msg-av">JC</div><div style="flex:1"><div class="msg-name">Job Copilot Team</div><div class="msg-preview">Welcome! Messages will appear here.</div></div><span class="msg-time">Now</span></div>'; }
};

