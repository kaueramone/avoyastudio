import './app.js';
import { getAuth } from './auth.mjs';
import { products,currency } from './catalogue.mjs';
import { cleanCart,cartTotal } from './cart.mjs';
import { configureShipping,shippingSettings,selectedCurrency,convertedCents,formatMoney,shippingCents,europeanCountries } from './commerce.mjs';
import { escapeHtml as e } from './content.mjs';

const target=document.querySelector('#checkout-content');
const params=new URLSearchParams(location.search);
let country='PT';try{country=localStorage.getItem('avoya-destination')||'PT';}catch{}
if(!['PT','BR',...europeanCountries].includes(country))country='PT';
const lang=document.documentElement.lang.slice(0,2);
const money=cents=>formatMoney(cents/100,selectedCurrency(),lang);
let client,config,user,availability={enabled:false,is_test:true,shipping_cents:0},cart=[],endpoint;
function message(text){const el=document.querySelector('#checkout-status');if(el)el.textContent=text;}
async function showReturn(){
  const id=params.get('pedido');
  if(!user){target.innerHTML='<section class="account-card"><h2>Entra para consultar a encomenda.</h2><p>O resultado do pagamento é confirmado de forma segura no histórico da tua conta.</p><a class="button dark" href="conta.html">Entrar na minha conta ↗</a></section>';return;}
  if(!/^[a-f0-9-]{36}$/i.test(id||'')){target.innerHTML='<p>Esta referência não é válida. Consulta as tuas encomendas na tua conta.</p>';return;}
  let attempts=0;
  async function check(){
    const {data:order,error}=await client.from('orders').select('order_number,payment_status,status,is_test,items').eq('id',id).eq('user_id',user.id).maybeSingle();
    if(error||!order){target.innerHTML='<section class="account-card"><h2>Consulta o teu histórico.</h2><p>Não foi possível obter esta encomenda. Confirma que estás na conta correta.</p><a class="button dark" href="conta.html">As minhas encomendas ↗</a></section>';return;}
    const paid=['paid','partially_refunded','refunded'].includes(order.payment_status);
    const cancelled=params.get('resultado')==='cancelado';
    target.innerHTML=`<section class="account-card"><p class="eyebrow">${e(order.order_number)}${order.is_test?' · Teste':''}</p><h2>${paid?'Obrigada por fazeres parte.':cancelled?'O pagamento foi interrompido.':'A confirmar o teu pagamento.'}</h2><p>${paid?(order.is_test?'O pagamento de teste foi confirmado. Não foi cobrado dinheiro real.':'O pagamento foi confirmado. Podes acompanhar a encomenda na tua conta.'):cancelled?'Voltaste à loja sem concluir este pagamento. Podes verificar o estado nas tuas encomendas.':'O serviço de pagamentos ainda não confirmou a compra. Esta página, por si só, não confirma um pagamento.'}</p><a class="button dark" href="conta.html">As minhas encomendas ↗</a><p class="account-message">O estado apresentado vem do registo privado da tua encomenda.</p></section>`;
    if(paid){try{const current=JSON.parse(localStorage.getItem('avoya-bag-v1')||'[]');if(current.length===order.items.length&&current.every(item=>order.items.some(p=>p.product_id===item.id&&p.quantity===item.quantity))){localStorage.removeItem('avoya-bag-v1');window.dispatchEvent(new Event('avoya-cart-updated'));}sessionStorage.removeItem('avoya-checkout-v1');}catch{}}
    if(!paid&&!cancelled&&order.payment_status!=='failed'&&attempts++<9)setTimeout(()=>void check(),3000);
  }
  await check();
}
function render(){
  if(!cart.length){target.innerHTML='<section class="account-card account-empty"><h2>O teu saco está à espera.</h2><p>Escolhe as tuas próximas velas para continuar.</p><a class="button dark" href="index.html#colecao">Descobrir a coleção ↗</a></section>';return;}
  const freight=convertedCents(shippingCents(country));
  const subtotal=cart.reduce((sum,item)=>sum+convertedCents(Math.round(products.find(p=>p.id===item.id).price*100))*item.quantity,0);
  const overweight=cart.reduce((sum,item)=>sum+(products.find(p=>p.id===item.id).packed_weight_g||600)*item.quantity,0)>shippingSettings.max_weight_g;
  const countries=new Intl.DisplayNames([lang],{type:'region'});
  target.innerHTML=`<div class="account-grid"><section class="account-card"><h2>A tua seleção.</h2><label>País de entrega<select id="shipping-country">${['PT','BR',...europeanCountries].map(code=>`<option value="${code}" ${country===code?'selected':''}>${e(countries.of(code))}</option>`).join('')}</select></label><p class="account-message">Envio manual pelos CTT, a partir de ${e(shippingSettings.origin_postcode)}. Tarifa para encomendas até ${shippingSettings.max_weight_g/1000} kg. ${overweight?'Esta seleção ultrapassa o limite: contacta o estúdio para um orçamento de envio.':''}</p><div class="checkout-items">${cart.map(item=>{const p=products.find(p=>p.id===item.id);return `<div class="checkout-item"><img src="${e(p.image)}" alt="${e(p.name)}" width="55" height="65"><div>${e(p.name)}<small>${item.quantity} × ${currency(p.price)}</small></div><span>${money(convertedCents(Math.round(p.price*100))*item.quantity)}</span></div>`;}).join('')}</div><div class="account-summary"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="account-summary"><span>Entrega</span><strong>${money(freight)}</strong></div><div class="account-summary"><span>Total</span><strong>${money(subtotal+freight)}</strong></div><p class="account-message">${country==='BR'||['GB','NO','IS','LI','CH','AD','MC','SM','VA'].includes(country)?'Podem aplicar-se impostos de importação e encargos de desalfandegamento no destino, não incluídos neste total.':''}</p><div class="checkout-note">${availability.enabled?(availability.is_test?'Modo de teste. Os produtos são ilustrativos. Usa apenas dados de pagamento de teste; não é uma compra real.':'A morada de entrega e os dados de pagamento são introduzidos no checkout seguro da Stripe.'):'As compras online ainda não estão disponíveis. Estamos a preparar os produtos finais, os envios e os pagamentos. Esta seleção não cria uma encomenda nem reserva produtos.'}</div></section><aside class="account-card"><h3>${user?'Tudo no teu espaço.':'A tua próxima história.'}</h3><p>${user?`A comprar com ${e(user.email)}. As encomendas ficam guardadas na tua conta.`:'Entra ou cria uma conta para guardar o histórico das tuas futuras encomendas.'}</p>${!user?'<a class="button dark full" href="conta.html">Entrar ou criar conta ↗</a>':''}<button class="button dark full" id="checkout-submit" ${!availability.enabled||!user||overweight?'disabled':''}>${availability.enabled?(availability.is_test?'Abrir pagamento de teste ↗':'Continuar para pagamento ↗'):'Compras disponíveis em breve'}</button><p id="checkout-status" class="account-message" role="status"></p><div class="account-actions"><a href="index.html#colecao">Continuar a explorar</a><a href="conta.html">A minha conta</a></div></aside></div>`;
  document.querySelector('#shipping-country').addEventListener('change',event=>{country=event.target.value;try{localStorage.setItem('avoya-destination',country);}catch{}render();});
  document.querySelector('#checkout-submit').addEventListener('click',startCheckout);
}
async function startCheckout(event){
  const button=event.currentTarget;button.disabled=true;message('A preparar o pagamento seguro…');
  try{
    const {data,error}=await client.auth.getSession();if(error||!data.session)throw new Error('A sessão terminou. Entra novamente na tua conta.');
    const signature=JSON.stringify({cart,country,currency:selectedCurrency(),language:lang});let saved;
    try{saved=JSON.parse(sessionStorage.getItem('avoya-checkout-v1')||'null');}catch{}
    if(saved?.signature!==signature)saved={signature,key:crypto.randomUUID()};
    try{sessionStorage.setItem('avoya-checkout-v1',JSON.stringify(saved));}catch{}
    const result=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.supabaseKey,Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({items:cart,checkout_key:saved.key,country,currency:selectedCurrency().toLowerCase(),language:lang}),signal:AbortSignal.timeout(30000)});
    const response=await result.json();
    if(!result.ok){if(response.error==='checkout_expired'){try{sessionStorage.removeItem('avoya-checkout-v1');}catch{}}throw new Error(response.message||'Não foi possível abrir o pagamento.');}
    const payment=new URL(response.url);if(payment.protocol!=='https:'||payment.hostname!=='checkout.stripe.com')throw new Error('Não foi possível verificar a ligação ao pagamento.');
    location.assign(payment.href);
  }catch(error){message(error.message||'Não foi possível abrir o pagamento. Tenta novamente.');button.disabled=false;}
}
try{
  ({client,config}=await getAuth());const result=await client.auth.getUser();user=result.data.user;
  endpoint=`${config.supabaseUrl}/functions/v1/commerce`;
  if(params.has('resultado'))await showReturn();
  else{
    try{cart=cleanCart(JSON.parse(localStorage.getItem('avoya-bag-v1')||'[]'));}catch{}
    try{const response=await fetch(endpoint,{headers:{apikey:config.supabaseKey},signal:AbortSignal.timeout(6000)});if(response.ok){availability=await response.json();if(availability.settings)configureShipping(availability.settings);}}catch{}
    render();
  }
}catch{target.innerHTML='<p>Não foi possível abrir o teu saco. Atualiza a página para tentar novamente.</p>';}
