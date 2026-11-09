// Supabase Edge Function. JWT validation is performed below; Stripe webhooks use signatures.
import { createClient } from 'npm:@supabase/supabase-js@2.119.0';

const origins=new Set(['https://avoyastudio.com','https://www.avoyastudio.com','https://avoyastudio.onrender.com']);
if(Deno.env.get('ALLOW_LOCAL_PREVIEW')==='true')origins.add('http://127.0.0.1:4173');
const mode=Deno.env.get('CHECKOUT_MODE')||'disabled';
const stripeKey=Deno.env.get('STRIPE_SECRET_KEY')||'';
const validMode=mode==='test'?/^(sk|rk)_test_/.test(stripeKey):mode==='live'&&Deno.env.get('ALLOW_LIVE_PAYMENTS')==='true'&&/^(sk|rk)_live_/.test(stripeKey);
const enabled=Boolean(validMode)&&/^whsec_/.test(Deno.env.get('STRIPE_WEBHOOK_SECRET')||'');
const europeanCountries=['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','RO','SK','SI','ES','SE','GB','NO','IS','LI','CH','AD','MC','SM','VA'];
async function settings(){const result=await admin.from('commerce_settings').select('*').eq('id','shop').single();if(result.error||!result.data)throw new Error('Shipping configuration unavailable');return result.data;}
const url=Deno.env.get('SUPABASE_URL')!;
const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
class RequestError extends Error {constructor(public status:number,public code:string,message:string){super(message);}}
function response(origin:string,data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}:{})}});}
async function stripe(path:string,body?:URLSearchParams,idempotency?:string){
  const res=await fetch(`https://api.stripe.com/v1/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${stripeKey}`,...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body,signal:AbortSignal.timeout(15000)});
  const data=await res.json();if(!res.ok)throw new RequestError(502,'payment_unavailable','Não foi possível abrir o pagamento. Tenta novamente dentro de instantes.');return data;
}
async function checkout(req:Request,origin:string){
  if(!enabled)throw new RequestError(503,'checkout_unavailable','Estamos a preparar as compras online. Não foi feita qualquer cobrança.');
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer /i,'');if(!token)throw new RequestError(401,'sign_in_required','Entra na tua conta para continuar.');
  const auth=await admin.auth.getUser(token);const user=auth.data.user;
  if(auth.error||!user)throw new RequestError(401,'sign_in_required','A sessão terminou. Entra novamente.');
  if(!user.email_confirmed_at)throw new RequestError(403,'email_not_confirmed','Confirma o teu email antes de comprar.');
  const raw=await req.text();if(raw.length>8192)throw new RequestError(400,'invalid_cart','O saco não é válido.');
  let data;try{data=JSON.parse(raw);}catch{throw new RequestError(400,'invalid_cart','O saco não é válido.');}
  if(!uuid.test(data.checkout_key)||!Array.isArray(data.items)||data.items.length<1||data.items.length>30)throw new RequestError(400,'invalid_cart','O saco não é válido.');
  const quantities=new Map<string,number>();
  for(const item of data.items){if(!item||typeof item.id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20||quantities.has(item.id))throw new RequestError(400,'invalid_cart','O saco não é válido.');quantities.set(item.id,item.quantity);}
  if([...quantities.values()].reduce((a,b)=>a+b,0)>100)throw new RequestError(400,'invalid_cart','O saco excede o limite de unidades.');
  const country=data.country||'PT', currency=data.currency||'eur', language=['pt','en','es'].includes(data.language)?data.language:'pt';
  if(!['PT','BR',...europeanCountries].includes(country)||!['eur','brl'].includes(currency))throw new RequestError(400,'invalid_destination','Escolhe um destino e uma moeda disponíveis.');
  const rules=await settings();
  const factor=currency==='brl'?Number(rules.eur_brl):1;
  const shipping= Math.round((country==='PT'?rules.portugal_cents:country==='BR'?rules.brazil_cents:rules.europe_cents)*factor);
  const existing=await admin.from('orders').select('*').eq('user_id',user.id).eq('checkout_key',data.checkout_key).maybeSingle();if(existing.error)throw existing.error;
  let order=existing.data;
  if(order){
    const same=order.is_test===(mode==='test')&&order.currency===currency&&order.destination_country===country&&order.language===language&&order.items.length===quantities.size&&order.items.every((p:any)=>quantities.get(p.product_id)===p.quantity);
    if(!same)throw new RequestError(409,'checkout_expired','O saco foi alterado. Tenta novamente.');
    if(order.stripe_session_id){const session=await stripe(`checkout/sessions/${encodeURIComponent(order.stripe_session_id)}`);if(session.status==='open'&&session.url)return {url:session.url};throw new RequestError(409,'checkout_expired','Este pagamento já terminou ou expirou. Consulta as tuas encomendas.');}
  } else {
    const catalogue=await admin.from('products').select('id,name,price,status,packed_weight_g,translations').in('id',[...quantities.keys()]).eq('status','published');if(catalogue.error)throw catalogue.error;
    if(catalogue.data.length!==quantities.size)throw new RequestError(409,'catalogue_changed','Um produto já não está disponível. Atualiza o saco.');
    const weight=catalogue.data.reduce((sum,p)=>sum+(p.packed_weight_g||1000)*quantities.get(p.id)!,0);
    if(weight>rules.max_weight_g)throw new RequestError(409,'shipping_quote_required','Esta encomenda excede o peso previsto para a tarifa. Contacta o estúdio para um orçamento de envio.');
    const items=catalogue.data.map(p=>({product_id:p.id,name:p.translations?.[language]?.name||p.name,quantity:quantities.get(p.id)!,unit_amount:Math.round(Math.round(Number(p.price)*100)*factor)})).sort((a,b)=>a.product_id.localeCompare(b.product_id));
    if(items.some(p=>!Number.isSafeInteger(p.unit_amount)||p.unit_amount<1))throw new RequestError(409,'catalogue_changed','Um produto ainda não está disponível para compra.');
    const subtotal=items.reduce((sum,p)=>sum+p.unit_amount*p.quantity,0);
    const inserted=await admin.from('orders').insert({user_id:user.id,customer_email:user.email,checkout_key:data.checkout_key,items,currency,destination_country:country,language,shipping_quote:{origin_postcode:rules.origin_postcode,weight_g:weight,max_weight_g:rules.max_weight_g,eur_brl:Number(rules.eur_brl),rate_date:rules.rate_date},subtotal_cents:subtotal,shipping_cents:shipping,total_cents:subtotal+shipping,is_test:mode==='test'}).select().single();
    if(inserted.error){if(inserted.error.code==='23505')throw new RequestError(409,'checkout_in_progress','O pagamento está a ser preparado. Tenta novamente dentro de instantes.');throw inserted.error;}order=inserted.data;
  }
  const body=new URLSearchParams({mode:'payment',customer_email:user.email!,client_reference_id:order.id,success_url:`${origin}/checkout.html?resultado=sucesso&pedido=${order.id}`,cancel_url:`${origin}/checkout.html?resultado=cancelado&pedido=${order.id}`,'metadata[avoya_order]':order.id,'payment_intent_data[metadata][avoya_order]':order.id,billing_address_collection:'required','shipping_address_collection[allowed_countries][0]':order.destination_country,locale:order.language});
  order.items.forEach((item:any,i:number)=>{body.set(`line_items[${i}][price_data][currency]`,order.currency);body.set(`line_items[${i}][price_data][product_data][name]`,item.name);body.set(`line_items[${i}][price_data][unit_amount]`,String(item.unit_amount));body.set(`line_items[${i}][quantity]`,String(item.quantity));});
  body.set('shipping_options[0][shipping_rate_data][type]','fixed_amount');body.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]',String(order.shipping_cents));body.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]',order.currency);body.set('shipping_options[0][shipping_rate_data][display_name]',order.language==='en'?'CTT delivery':order.language==='es'?'Envío CTT':'Entrega CTT');
  const session=await stripe('checkout/sessions',body,`avoya-${mode}-${order.id}`);
  if(!session.url||session.livemode!==(mode==='live'))throw new Error('Unexpected checkout mode');
  const saved=await admin.from('orders').update({stripe_session_id:session.id}).eq('id',order.id);if(saved.error)throw saved.error;
  return {url:session.url};
}
async function verifySignature(raw:string,header:string,secret:string){
  const parts=header.split(',').map(v=>v.split('='));const timestamp=parts.find(p=>p[0]==='t')?.[1];
  if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signature=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${raw}`)));
  return parts.filter(p=>p[0]==='v1'&&/^[a-f0-9]{64}$/i.test(p[1])).some(p=>{const bytes=p[1].match(/../g)!.map(v=>parseInt(v,16));let diff=0;for(let i=0;i<signature.length;i++)diff|=signature[i]^bytes[i];return diff===0;});
}
async function webhook(req:Request){
  const secret=Deno.env.get('STRIPE_WEBHOOK_SECRET');if(!secret)throw new RequestError(503,'webhook_unavailable','Webhook not configured');
  const raw=await req.text();if(raw.length>1048576||!await verifySignature(raw,req.headers.get('stripe-signature')||'',secret))throw new RequestError(400,'invalid_signature','Invalid signature');
  const event=JSON.parse(raw);if(typeof event.id!=='string'||typeof event.type!=='string')throw new RequestError(400,'invalid_event','Invalid event');
  const object=event.data?.object;if(!object)return {received:true};
  const known=await admin.from('payment_events').select('id').eq('id',event.id).maybeSingle();if(known.error)throw known.error;if(known.data)return {received:true};
  if(event.type==='charge.refunded'){
    const charge=object;
    const found=await admin.from('orders').select('id,total_cents,is_test,currency').eq('stripe_payment_intent_id',charge.payment_intent).maybeSingle();if(found.error)throw found.error;
    let order=found.data;
    if(!order){let candidate=charge.metadata?.avoya_order;if(!candidate&&typeof charge.payment_intent==='string'){const intent=await stripe(`payment_intents/${encodeURIComponent(charge.payment_intent)}`);candidate=intent.metadata?.avoya_order;}if(candidate&&uuid.test(candidate)){const match=await admin.from('orders').select('*').eq('id',candidate).maybeSingle();if(match.error)throw match.error;order=match.data;}}
    if(order&&charge.amount===order.total_cents&&(!order.stripe_payment_intent_id||order.stripe_payment_intent_id===charge.payment_intent)&&charge.livemode===!order.is_test&&charge.currency===order.currency&&Number.isInteger(charge.amount_refunded)&&charge.amount_refunded>0&&charge.amount_refunded<=order.total_cents){
      const result=await admin.from('orders').update({status:charge.amount_refunded===order.total_cents?'cancelled':'confirmed',stripe_payment_intent_id:charge.payment_intent,refunded_cents:charge.amount_refunded,payment_status:charge.amount_refunded===order.total_cents?'refunded':'partially_refunded'}).eq('id',order.id).lt('refunded_cents',charge.amount_refunded);if(result.error)throw result.error;
    }
  } else if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type)){
    const orderId=object.metadata?.avoya_order;if(!orderId||!uuid.test(orderId))return {received:true};
    const found=await admin.from('orders').select('*').eq('id',orderId).single();if(found.error)throw found.error;const order=found.data;
    if(object.id!==order.stripe_session_id||object.livemode===order.is_test||object.currency!==order.currency||object.amount_total!==order.total_cents)throw new Error('Payment does not match order');
    const paid=object.payment_status==='paid'&&['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type);
    const failed=['checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type);
    if(['unpaid','processing'].includes(order.payment_status)){
      const result=await admin.from('orders').update({payment_status:paid?'paid':failed?'failed':'processing',status:paid?'confirmed':failed?'cancelled':'payment_processing',stripe_payment_intent_id:typeof object.payment_intent==='string'?object.payment_intent:object.payment_intent?.id,shipping_details:object.collected_information?.shipping_details||object.shipping_details||null}).eq('id',order.id).in('payment_status',['unpaid','processing']);if(result.error)throw result.error;
    }
  } else return {received:true};
  const recorded=await admin.from('payment_events').upsert({id:event.id,event_type:event.type},{onConflict:'id',ignoreDuplicates:true});if(recorded.error)throw recorded.error;
  return {received:true};
}
// Read-only deployment check, callable only with the server credential in the
// Supabase function tester. It never creates orders, sessions or payments.
async function readiness(req:Request){
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!serviceKey||req.headers.get('Authorization')!==`Bearer ${serviceKey}`)throw new RequestError(403,'forbidden','Acesso reservado ao servidor.');
  const account=await stripe('accounts/acct_1UZsoCGemINO4zER');
  const destination=await stripe('webhook_endpoints/we_1UZtZaGemINO4zERVG2tvOwZ');
  return {stripe_authenticated:true,key_mode:/^(sk|rk)_live_/.test(stripeKey)?'live':/^(sk|rk)_test_/.test(stripeKey)?'test':'unknown',account_matches:account.id==='acct_1UZsoCGemINO4zER',charges_enabled:account.charges_enabled===true,payouts_enabled:account.payouts_enabled===true,webhook_active:destination.status==='enabled'&&destination.livemode===true&&destination.url===`${url}/functions/v1/commerce?action=webhook`,checkout_enabled:enabled};
}
Deno.serve(async req=>{
  const origin=req.headers.get('Origin')||'';
  try{
    const action=new URL(req.url).searchParams.get('action');
    if(action==='readiness'&&req.method==='GET')return response('',await readiness(req));
    if(action==='webhook'&&req.method==='POST')return response('',await webhook(req));
    if(!origins.has(origin))return response('',{error:'origin_not_allowed',message:'Origem não autorizada.'},403);
    if(req.method==='OPTIONS')return response(origin,{ok:true});
    if(req.method==='GET')return response(origin,{enabled,is_test:mode!=='live',settings:await settings(),countries:['PT','BR',...europeanCountries]});
    if(req.method==='POST')return response(origin,await checkout(req,origin));
    return response(origin,{error:'method_not_allowed'},405);
  }catch(error){
    const expected=error instanceof RequestError;
    // Do not log request bodies, addresses, tokens or provider error payloads.
    if(!expected)console.error('Commerce request failed');
    return response(origin,{error:expected?error.code:'temporarily_unavailable',message:expected?error.message:'Não foi possível concluir. Tenta novamente dentro de instantes.'},expected?error.status:500);
  }
});
