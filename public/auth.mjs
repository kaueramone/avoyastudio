import { createClient } from './vendor/supabase.js';
import { getPublicConfig } from './store.mjs';

let clientPromise,captchaScript;
export function getAuth() {
  return clientPromise ||= getPublicConfig().then(config => ({config, client:createClient(config.supabaseUrl,config.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}})}));
}
export function authError(error) {
  const messages={
    invalid_credentials:'O email ou a palavra-passe não estão corretos.',
    email_not_confirmed:'Confirma o teu email antes de entrar. Abre a mensagem de confirmação recebida.',
    user_already_exists:'Não foi possível criar a conta. Se já tens conta, experimenta entrar ou recuperar a palavra-passe.',
    signup_disabled:'Os novos registos ainda estão a ser preparados. Volta em breve.',
    weak_password:'Escolhe uma palavra-passe mais forte, com pelo menos 12 caracteres.',
    same_password:'Escolhe uma palavra-passe diferente da atual.',
    captcha_failed:'A verificação de segurança expirou. Aguarda a nova verificação e tenta novamente.',
    over_email_send_rate_limit:'O envio de email atingiu o limite temporário. Tenta mais tarde.',
    over_request_rate_limit:'Foram feitas demasiadas tentativas. Aguarda um pouco e tenta novamente.',
    email_address_not_authorized:'O envio de email ainda está a ser configurado. Contacta contact@avoyastudio.com.',
    otp_expired:'Este link de confirmação ou recuperação já foi usado ou expirou. Pede um novo.',
    session_not_found:'A sessão terminou. Entra novamente para continuar.'
  };
  return messages[error?.code] || (error?.status===429 ? messages.over_request_rate_limit : 'Não foi possível concluir. Verifica a ligação e tenta novamente.');
}
export async function createCaptcha(config,selector,onReady,onError) {
  let token='',widget;
  const container=document.querySelector(selector);
  if(!captchaScript)captchaScript=new Promise((resolve,reject)=>{
    if(window.turnstile){resolve();return;}
    const script=document.createElement('script');
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
    script.onload=resolve;script.onerror=()=>{captchaScript=undefined;reject(new Error('Captcha unavailable'));};document.head.append(script);
  });
  await captchaScript;if(!container?.isConnected)throw new Error('Captcha view closed');
  widget=window.turnstile.render(container,{sitekey:config.turnstileSiteKey,theme:'light',size:'flexible',callback:value=>{token=value;onReady();},'expired-callback':()=>{token='';onError('A verificar o acesso…');},'error-callback':()=>{token='';onError('Não foi possível verificar o acesso. Atualiza a página.');}});
  return {get token(){return token;},reset(){token='';window.turnstile.reset(widget);},destroy(){token='';window.turnstile.remove(widget);}};
}
