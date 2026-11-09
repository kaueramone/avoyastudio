import './app.js';
import { getAuth,createCaptcha,authError } from './auth.mjs';
import { escapeHtml as e } from './content.mjs';
import { currency } from './catalogue.mjs';

const content=document.querySelector('#account-content');
const initialHash=new URLSearchParams(location.hash.slice(1));
const callbackError=initialHash.get('error_code');
let recovery=initialHash.get('type')==='recovery';
let client,config,user,view=location.hash==='#seguranca'?'security':'orders',mode='login',captcha,authBusy=false,loading=false,loginEpoch=0;
const states={pending:'A aguardar pagamento',payment_processing:'Pagamento em processamento',confirmed:'Confirmada',preparing:'Em preparação',shipped:'Enviada',delivered:'Entregue',cancelled:'Cancelada'};
const paymentStates={unpaid:'Por pagar',processing:'Em processamento',paid:'Pago',failed:'Falhou',partially_refunded:'Parcialmente reembolsado',refunded:'Reembolsado'};
function status(text,kind='') { const target=document.querySelector('#account-status');if(target){target.textContent=text;target.className=`account-message ${kind}`;} }
function loginForm() {
  captcha?.destroy();const epoch=++loginEpoch;
  const signup=mode==='signup',reset=mode==='reset';
  content.innerHTML=`<div class="account-auth"><section class="account-card"><div class="account-tabs" role="tablist" aria-label="Acesso à conta"><button role="tab" data-mode="login" aria-selected="${!signup}">Entrar</button><button role="tab" data-mode="signup" aria-selected="${signup}">Criar conta</button></div><h2>${reset?'Recuperar acesso':signup?'Começa uma nova história.':'Que bom ter-te por aqui.'}</h2><form id="customer-auth-form">${signup?'<label>O teu nome<input name="name" autocomplete="name" required maxlength="120"></label>':''}<label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label>${!reset?`<label>Palavra-passe<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" ${signup?'minlength="12"':''} required maxlength="128"></label>${signup?'<p class="account-password-help">Pelo menos 12 caracteres. Usa uma palavra-passe exclusiva para a Avoya.</p>':''}`:''}${signup?'<label class="check-label"><input name="privacy" type="checkbox" required><span>Li a <a href="privacidade.html" target="_blank" rel="noopener">informação sobre privacidade</a>. A criação de conta não subscreve comunicações de marketing.</span></label>':''}${reset?'<p>Enviamos um email para definires uma nova palavra-passe. O acesso habitual continua a ser por email e palavra-passe.</p>':''}<div id="turnstile"></div><button class="button dark full" id="customer-submit" type="submit" disabled>${reset?'Enviar instruções':signup?'Criar a minha conta':'Entrar'}</button><p id="account-status" class="account-message" role="status">A preparar o acesso seguro…</p></form>${!reset?'<button class="text-link" data-mode="reset">Esqueci-me da palavra-passe</button>':'<button class="text-link" data-mode="login">Voltar ao início de sessão</button>'}</section><aside class="account-aside"><span aria-hidden="true">✳</span><h2>Um espaço para<br>os teus pequenos rituais.</h2><p>Acompanha as tuas encomendas e mantém os teus dados num só lugar. Estamos a preparar o primeiro capítulo da loja: os produtos continuam ilustrativos e os pagamentos reais ainda não estão ativos.</p></aside></div>`;
  captcha=undefined;
  void createCaptcha(config,'#turnstile',()=>{if(epoch!==loginEpoch)return;document.querySelector('#customer-submit').disabled=authBusy;if(!authBusy&&document.querySelector('#account-status').textContent==='A preparar o acesso seguro…')status(callbackError?authError({code:callbackError}):'');},message=>{if(epoch!==loginEpoch)return;document.querySelector('#customer-submit').disabled=true;if(!authBusy)status(message);}).then(value=>{if(epoch!==loginEpoch)value.destroy();else captcha=value;}).catch(()=>{if(epoch===loginEpoch)status('A verificação de segurança não carregou. Atualiza a página.','error');});
}
function passwordForm() {
  return `<section class="account-card"><h2>${recovery?'Define a nova palavra-passe.':'Segurança da conta.'}</h2><p>A palavra-passe fica protegida pelo serviço de autenticação. Não a partilhes com ninguém.</p><form id="password-form"><label>Nova palavra-passe<input name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></label><label>Repetir palavra-passe<input name="confirmation" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></label><p class="account-password-help">Pelo menos 12 caracteres. Usa uma palavra-passe exclusiva.</p><button class="button dark" type="submit">Guardar palavra-passe</button><p id="account-status" class="account-message" role="status"></p></form></section>`;
}
function shell() {
  content.innerHTML=`<nav class="customer-nav" aria-label="A minha conta">${[['orders','Encomendas'],['profile','Os meus dados'],['security','Segurança']].map(([key,label])=>`<button data-account-view="${key}" ${view===key?'aria-current="page"':''}>${label}</button>`).join('')}<button class="account-logout" id="customer-logout">Terminar sessão ↗</button></nav><p class="customer-note">${e(user.email)}</p><div id="customer-view"></div>`;
}
async function renderAccount() {
  shell();const target=document.querySelector('#customer-view');
  if(recovery||view==='security'){target.innerHTML=passwordForm();return;}
  target.innerHTML='<p>A carregar…</p>';
  try {
    if(view==='profile') {
      const result=await client.from('customer_profiles').select('full_name,phone').eq('user_id',user.id).maybeSingle();if(result.error)throw result.error;
      const profile=result.data||{};
      target.innerHTML=`<div class="account-grid"><section class="account-card"><h2>Os meus dados.</h2><form id="profile-form"><label>Nome<input name="full_name" autocomplete="name" maxlength="120" required value="${e(profile.full_name||user.user_metadata?.full_name||'')}"></label><label>Telemóvel <span>(opcional)</span><input name="phone" type="tel" autocomplete="tel" maxlength="30" value="${e(profile.phone||'')}"></label><label>Email<input type="email" disabled value="${e(user.email)}"></label><button class="button dark" type="submit">Guardar dados</button><p id="account-status" class="account-message" role="status"></p></form></section><aside class="account-card"><h3>Os teus dados, com cuidado.</h3><p>A morada de entrega será pedida no pagamento, quando as compras estiverem disponíveis. A tua conta não está inscrita em marketing.</p><a class="text-link" href="privacidade.html">Privacidade ↗</a></aside></div>`;
    } else {
      const result=await client.from('orders').select('id,order_number,status,payment_status,total_cents,shipping_cents,items,is_test,created_at,refunded_cents').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(result.error)throw result.error;
      target.innerHTML=result.data.length?`<section class="account-orders" aria-label="Histórico de encomendas">${result.data.map(orderCard).join('')}</section>`:`<section class="account-card account-empty"><span aria-hidden="true">✳</span><h2>A tua história começa aqui.</h2><p>Ainda não tens encomendas. Quando fizeres a primeira compra, os detalhes e o acompanhamento ficam guardados neste espaço.</p><a class="button dark" href="index.html#colecao">Descobrir a coleção ↗</a></section>`;
    }
  } catch {target.innerHTML='<section class="account-card"><h2>O teu espaço está a ser preparado.</h2><p>Não foi possível carregar os dados. Tenta novamente dentro de instantes.</p><button class="text-link" data-account-view="orders">Voltar a tentar ↗</button></section>';}
}
function orderCard(order) {
  return `<article class="account-order"><div class="order-heading"><div><h3>${e(order.order_number)}</h3><small>${new Date(order.created_at).toLocaleDateString('pt-PT',{day:'numeric',month:'long',year:'numeric'})} · ${e(paymentStates[order.payment_status]||'A verificar')}</small></div><span class="order-state">${e(states[order.status]||'A acompanhar')}</span></div>${order.is_test?'<span class="order-test">Encomenda de teste · sem cobrança real</span>':''}<div class="order-items">${(order.items||[]).map(item=>`<div class="order-item"><span>${Number(item.quantity)} × ${e(item.name)}</span><span>${currency(Number(item.unit_amount)*Number(item.quantity)/100)}</span></div>`).join('')}</div><div class="order-item"><span>Entrega</span><span>${currency(order.shipping_cents/100)}</span></div><div class="order-total"><strong>Total</strong><strong>${currency(order.total_cents/100)}</strong></div>${order.refunded_cents?`<p class="account-message">Reembolsado: ${currency(order.refunded_cents/100)}</p>`:''}</article>`;
}
async function loadUser() {
  if(loading)return;loading=true;
  try{const result=await client.auth.getUser();user=result.data.user;if(user){++loginEpoch;captcha?.destroy();captcha=undefined;await renderAccount();}else loginForm();}catch{content.innerHTML='<p>Não foi possível abrir a conta. Atualiza a página e tenta novamente.</p>';}finally{loading=false;}
}
document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.mode){if(authBusy)return;mode=button.dataset.mode;loginForm();}
  if(button.dataset.accountView){recovery=false;view=button.dataset.accountView;await renderAccount();}
  if(button.id==='customer-logout'){button.disabled=true;const {error}=await client.auth.signOut();if(error){button.disabled=false;return;}user=null;recovery=false;mode='login';loginForm();}
});
document.addEventListener('submit',async event=>{
  const form=event.target;
  if(!['customer-auth-form','profile-form','password-form'].includes(form.id))return;event.preventDefault();
  const button=form.querySelector('[type=submit]');button.disabled=true;const data=new FormData(form);
  try {
    if(form.id==='customer-auth-form'){
      if(!captcha?.token){status('Aguarda a verificação de segurança.');return;}authBusy=true;status(mode==='login'?'A entrar…':'A enviar…');
      const email=String(data.get('email')).trim().toLowerCase(),password=String(data.get('password')||'');
      let result;
      if(mode==='login')result=await client.auth.signInWithPassword({email,password,options:{captchaToken:captcha.token}});
      else if(mode==='signup')result=await client.auth.signUp({email,password,options:{captchaToken:captcha.token,emailRedirectTo:`${location.origin}/conta.html`,data:{full_name:String(data.get('name')).trim()}}});
      else result=await client.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/conta.html`,captchaToken:captcha.token});
      if(result.error)throw result.error;
      if(mode==='signup')status('Se a conta puder ser criada, receberás um email de confirmação. Confirma o endereço e entra com a tua palavra-passe.','success');
      if(mode==='reset')status('Se existir uma conta com este email, receberás as instruções de recuperação.','success');
      if(mode==='login')await loadUser();
    } else if(form.id==='profile-form'){
      const values={full_name:String(data.get('full_name')).trim(),phone:String(data.get('phone')).trim()};
      const existing=await client.from('customer_profiles').select('user_id').eq('user_id',user.id).maybeSingle();if(existing.error)throw existing.error;
      const result=existing.data?await client.from('customer_profiles').update(values).eq('user_id',user.id):await client.from('customer_profiles').insert({user_id:user.id,...values});if(result.error)throw result.error;status('Os teus dados foram guardados.','success');
    } else {
      const password=String(data.get('password'));if(password!==data.get('confirmation')){status('As palavras-passe não coincidem.','error');return;}
      const result=await client.auth.updateUser({password});if(result.error)throw result.error;recovery=false;form.reset();status('Palavra-passe guardada. Já podes usá-la para entrar.','success');
    }
  } catch(error){status(authError(error),'error');}
  finally{authBusy=false;if(form.isConnected){button.disabled=false;if(form.id==='customer-auth-form'){button.disabled=true;captcha?.reset();}}}
});
try {
  ({client,config}=await getAuth());
  client.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY'){recovery=true;view='security';setTimeout(()=>void loadUser(),0);}else if(event==='SIGNED_IN')setTimeout(()=>void loadUser(),0);});
  await loadUser();
}catch{content.innerHTML='<p>Não foi possível preparar o acesso. Atualiza a página e tenta novamente.</p>';}
