const eye='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg>';
function enhance(){
  document.querySelectorAll('input[type="password"]:not([data-password-ready])').forEach(input=>{
    input.dataset.passwordReady='true';
    if(!input.id)input.id=`password-${crypto.randomUUID()}`;
    const wrap=document.createElement('span');wrap.className='password-control';
    input.before(wrap);wrap.append(input);
    const button=document.createElement('button');button.type='button';button.className='password-toggle';button.setAttribute('aria-controls',input.id);button.setAttribute('aria-label','Mostrar palavra-passe');button.setAttribute('aria-pressed','false');button.innerHTML=eye;wrap.append(button);
    button.addEventListener('click',()=>{const show=input.type==='password';input.type=show?'text':'password';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',show?'Ocultar palavra-passe':'Mostrar palavra-passe');});
    input.form?.addEventListener('reset',()=>{input.type='password';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Mostrar palavra-passe');});
  });
}
enhance();new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
