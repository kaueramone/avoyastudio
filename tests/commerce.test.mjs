import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import { createHmac,randomUUID } from 'node:crypto';

const source=await readFile(new URL('../supabase/functions/commerce/index.ts',import.meta.url),'utf8');
const compiled=(await transform(source.replace(/import \{ createClient \} from '[^']+';/,"const createClient=()=>globalThis.__commerceTestDb;"),{loader:'ts',format:'esm',target:'es2022'})).code;
const orderId='33333333-3333-4333-8333-333333333333';
const userId='11111111-1111-4111-8111-111111111111';
const origin='https://avoyastudio.com';
async function fixture(t,env={}){
  const state={rules:{id:'shop',origin_postcode:'5340-262',portugal_cents:500,europe_cents:3970,brazil_cents:4750,eur_brl:6.1449,max_weight_g:1000,rate_date:'2026-11-06'},orders:[],events:[],updates:[],stripeBodies:[],user:{id:userId,email:'buyer@example.invalid',email_confirmed_at:'2026-11-09T12:00:00Z'}};
  function table(name){
    const filters=[];let operation='select',values;
    const query={
      select(){return query;},eq(key,value){filters.push(row=>row[key]===value);return query;},in(key,values){filters.push(row=>values.includes(row[key]));return query;},lt(key,value){filters.push(row=>row[key]<value);return query;},
      insert(value){operation='insert';values=value;return query;},update(value){operation='update';values=value;return query;},upsert(value){operation='upsert';values=value;return query;},
      single(){return run(true);},maybeSingle(){return run(true);},then(resolve,reject){return run(false).then(resolve,reject);}
    };
    async function run(single){
      let rows=name==='commerce_settings'?[state.rules]:name==='products'?[{id:'vela',name:'Uma vela',price:26,status:'published',packed_weight_g:400}]:name==='orders'?state.orders:state.events;
      if(operation==='insert'){const row={id:orderId,status:'pending',payment_status:'unpaid',refunded_cents:0,...values};rows.push(row);return {data:row,error:null};}
      if(operation==='upsert'){if(!rows.some(row=>row.id===values.id))rows.push(values);return {data:null,error:null};}
      rows=rows.filter(row=>filters.every(match=>match(row)));
      if(operation==='update'){state.updates.push({...values});rows.forEach(row=>Object.assign(row,values));return {data:null,error:null};}
      return {data:single?(rows[0]||null):rows,error:null};
    }
    return query;
  }
  const old={Deno:globalThis.Deno,db:globalThis.__commerceTestDb,fetch:globalThis.fetch};
  const settings={CHECKOUT_MODE:'test',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_ROLE_KEY:'fixture',SHIPPING_CENTS:'500',...env};
  globalThis.__commerceTestDb={from:table,auth:{getUser:async token=>({data:{user:token==='valid-token'?state.user:null},error:token==='valid-token'?null:{}})}};
  globalThis.Deno={env:{get:key=>settings[key]},serve:handler=>{state.handler=handler;}};
  globalThis.fetch=async (url,options)=>{if(String(url).endsWith('/accounts/acct_1UZsoCGemINO4zER'))return Response.json({id:'acct_1UZsoCGemINO4zER',charges_enabled:true,payouts_enabled:true});if(String(url).includes('/webhook_endpoints/'))return Response.json({status:'enabled',livemode:true,url:'https://fixture.invalid/functions/v1/commerce?action=webhook'});assert.match(String(url),/^https:\/\/api.stripe.com\/v1\/checkout\/sessions/);state.stripeBodies.push(options?.body);return Response.json({id:'cs_test_fixture',url:'https://checkout.stripe.com/c/pay/fixture',livemode:false,status:'open'});};
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${randomUUID()}`);
  t.after(()=>{globalThis.Deno=old.Deno;globalThis.__commerceTestDb=old.db;globalThis.fetch=old.fetch;});
  state.request=(body,token='valid-token')=>new Request('https://fixture.invalid/functions/v1/commerce',{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
  state.webhook=(object,type='checkout.session.completed',signed=true)=>{
    const raw=JSON.stringify({id:'evt_fixture',type,data:{object}}),timestamp=Math.floor(Date.now()/1000);
    const signature=createHmac('sha256','whsec_fixture').update(`${timestamp}.${raw}`).digest('hex');
    return new Request('https://fixture.invalid/functions/v1/commerce?action=webhook',{method:'POST',headers:{'stripe-signature':signed?`t=${timestamp},v1=${signature}`:'t=0,v1=wrong'},body:raw});
  };
  state.seedOrder=()=>state.orders.push({id:orderId,stripe_session_id:'cs_test_fixture',user_id:userId,total_cents:3100,currency:'eur',destination_country:'PT',language:'pt',is_test:true,payment_status:'unpaid',status:'pending',refunded_cents:0});
  state.session=(extra={})=>({id:'cs_test_fixture',metadata:{avoya_order:orderId},amount_total:3100,currency:'eur',livemode:false,payment_status:'paid',payment_intent:'pi_fixture',...extra});
  return state;
}
test('checkout defaults to disabled and rejects live keys in test mode',async t=>{
  const s=await fixture(t,{CHECKOUT_MODE:'test',STRIPE_SECRET_KEY:'sk_live_wrong'});
  const res=await s.handler(new Request('https://fixture.invalid/functions/v1/commerce',{headers:{Origin:origin}}));assert.equal((await res.json()).enabled,false);
  assert.equal((await s.handler(s.request({items:[]}))).status,503);assert.equal(s.orders.length,0);
});
test('checkout requires a valid user and rejects duplicate or excessive cart quantities',async t=>{
  const s=await fixture(t);assert.equal((await s.handler(s.request({},'invalid-token'))).status,401);
  for(const items of [[{id:'vela',quantity:21}],[{id:'vela',quantity:1},{id:'vela',quantity:1}]])assert.equal((await s.handler(s.request({checkout_key:randomUUID(),items}))).status,400);
  assert.equal(s.orders.length,0);
});
test('prices and totals come from the database even when the client supplies a fake price',async t=>{
  const s=await fixture(t);const response=await s.handler(s.request({checkout_key:randomUUID(),items:[{id:'vela',quantity:2,price:0.01}]}));
  assert.equal(response.status,200);assert.equal(s.orders[0].subtotal_cents,5200);assert.equal(s.orders[0].total_cents,5700);assert.equal(s.orders[0].payment_status,'unpaid');assert.equal(s.orders[0].is_test,true);
  assert.equal(s.stripeBodies[0].get('line_items[0][price_data][unit_amount]'),'2600');
});
test('forged webhook signatures cannot modify orders',async t=>{
  const s=await fixture(t);s.seedOrder();assert.equal((await s.handler(s.webhook(s.session(),undefined,false))).status,400);assert.equal(s.updates.length,0);
});
test('a valid signature with a mismatched amount cannot mark an order paid',async t=>{
  const s=await fixture(t);s.seedOrder();assert.equal((await s.handler(s.webhook(s.session({amount_total:1})))).status,500);assert.equal(s.updates.length,0);
});
test('an unpaid completed session remains processing until Stripe confirms payment',async t=>{
  const s=await fixture(t);s.seedOrder();assert.equal((await s.handler(s.webhook(s.session({payment_status:'unpaid'})))).status,200);assert.equal(s.orders[0].payment_status,'processing');assert.equal(s.orders[0].status,'payment_processing');
});
test('verified payment confirmation is idempotent',async t=>{
  const s=await fixture(t);s.seedOrder();assert.equal((await s.handler(s.webhook(s.session()))).status,200);assert.equal((await s.handler(s.webhook(s.session()))).status,200);assert.equal(s.orders[0].payment_status,'paid');assert.equal(s.orders[0].status,'confirmed');assert.equal(s.updates.length,1);assert.equal(s.events.length,1);
});


test('Brazil checkout converts trusted prices and postage to BRL and locks destination',async t=>{
 const s=await fixture(t);const response=await s.handler(s.request({checkout_key:randomUUID(),country:'BR',currency:'brl',language:'es',items:[{id:'vela',quantity:1}],shipping_cents:0,eur_brl:1}));assert.equal(response.status,200);
 assert.equal(s.orders[0].subtotal_cents,15977);assert.equal(s.orders[0].shipping_cents,29188);assert.equal(s.orders[0].currency,'brl');
 assert.equal(s.stripeBodies[0].get('shipping_address_collection[allowed_countries][0]'),'BR');assert.equal(s.stripeBodies[0].get('line_items[0][price_data][currency]'),'brl');assert.equal(s.stripeBodies[0].get('locale'),'es');
});
test('unsupported destinations and overweight orders never create a payment',async t=>{
 const s=await fixture(t);
 assert.equal((await s.handler(s.request({checkout_key:randomUUID(),country:'US',items:[{id:'vela',quantity:1}]}))).status,400);
 assert.equal((await s.handler(s.request({checkout_key:randomUUID(),items:[{id:'vela',quantity:3}]}))).status,409);
 assert.equal(s.orders.length,0);assert.equal(s.stripeBodies.length,0);
});
test('checkout key cannot be reused with a cheaper destination or different currency',async t=>{
 const s=await fixture(t),key=randomUUID();const data={checkout_key:key,items:[{id:'vela',quantity:1}],country:'BR',currency:'brl'};
 assert.equal((await s.handler(s.request(data))).status,200);assert.equal((await s.handler(s.request({...data,country:'PT',currency:'eur'}))).status,409);
});
test('BRL webhook must match the order currency',async t=>{
 const s=await fixture(t);s.seedOrder();s.orders[0].currency='brl';assert.equal((await s.handler(s.webhook(s.session()))).status,500);assert.equal(s.orders[0].payment_status,'unpaid');
 assert.equal((await s.handler(s.webhook(s.session({currency:'brl'})))).status,200);assert.equal(s.orders[0].payment_status,'paid');
});

test('a verified refund arriving before checkout confirmation cannot be overwritten as paid',async t=>{
 const s=await fixture(t);s.seedOrder();const refund={id:'ch_fixture',metadata:{avoya_order:orderId},payment_intent:'pi_fixture',amount:3100,amount_refunded:3100,currency:'eur',livemode:false};
 assert.equal((await s.handler(s.webhook(refund,'charge.refunded'))).status,200);assert.equal(s.orders[0].payment_status,'refunded');assert.equal(s.orders[0].status,'cancelled');s.events.length=0;
 assert.equal((await s.handler(s.webhook(s.session()))).status,200);assert.equal(s.orders[0].payment_status,'refunded');assert.equal(s.orders[0].refunded_cents,3100);
});

test('readiness is private and makes only read-only Stripe calls',async t=>{
 const s=await fixture(t,{STRIPE_SECRET_KEY:'rk_live_fixture'});
 const request=token=>new Request('https://fixture.invalid/functions/v1/commerce?action=readiness',{headers:{Authorization:`Bearer ${token}`}});
 assert.equal((await s.handler(request('valid-token'))).status,403);
 const result=await s.handler(request('fixture'));assert.equal(result.status,200);const data=await result.json();assert.equal(data.stripe_authenticated,true);assert.equal(data.key_mode,'live');assert.equal(data.account_matches,true);assert.equal(data.webhook_active,true);assert.equal(data.checkout_enabled,false);assert.equal(s.orders.length,0);assert.equal(s.stripeBodies.length,0);
});

test('readiness also accepts the Supabase dashboard secret-key header',async t=>{
 const s=await fixture(t,{SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_fixture'})});
 const request=key=>new Request('https://fixture.invalid/functions/v1/commerce?action=readiness',{headers:{apikey:key}});
 assert.equal((await s.handler(request('sb_publishable_fixture'))).status,403);assert.equal((await s.handler(request('sb_secret_fixture'))).status,200);assert.equal(s.orders.length,0);
});
