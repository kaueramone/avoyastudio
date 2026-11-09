import { createClient } from './vendor/supabase.js';
import { getPublicConfig } from './store.mjs';
import { defaultContent, escapeHtml as e, validImage } from './content.mjs';
import { currency } from './catalogue.mjs';

const icons = {
  overview:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  products:'<path d="m3 7 9-4 9 4v11l-9 4-9-4Z M3 7l9 4 9-4 M12 11v11 M7.5 5l9 4"/>',
  content:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8 M8 12h8 M8 16h5"/>',
  media:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-7 5 8"/>',
  settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M9 3l1-1h4l1 3 3 1 3 3-1 3 1 3-3 3-3 1-1 3h-4l-1-3-3-1-3-3 1-3-1-3 3-3 3-1Z"/>',
  check:'<path d="m5 12 4 4 10-10"/>',draft:'<path d="M6 3h10l3 3v15H6Z M10 10h5 M10 14h5"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.overview}</svg>`;
const views = [['overview','Visão geral'],['products','Produtos'],['content','Conteúdos'],['media','Imagens'],['settings','Conta']];
const labels = { published:'Publicado', draft:'Rascunho', archived:'Arquivado' };
const builtinMedia = ['hero','matcha','amber','raiz','mare','atelier'].map(name=>({url:`assets/${name}.webp`,name:({hero:'Imagem principal',matcha:'Jardim de Lisboa',amber:'Sol de Marrakech',raiz:'Raiz',mare:'Maré Serena',atelier:'O atelier'})[name]}));
const ui = { view:'overview', filter:'all', search:'', contentTab:'home', products:[], media:[], content:{...defaultContent}, contentVersion:null, productVersion:null, pickerTarget:null, dirty:false, formBaseline:'', pendingClose:null };
let config, client, user, toastTimer, captchaToken='', widgetId, refreshing=false;
const main = document.querySelector('#admin-main');
const productDialog = document.querySelector('#editor-dialog');
const mediaDialog = document.querySelector('#media-dialog');
const productForm = document.querySelector('#product-form');
const loginStatus = document.querySelector('#login-status');
const loginButton = document.querySelector('#login-submit');

function toast(message) {
  const target=document.querySelector('#admin-toast');document.querySelector('#media-status').textContent=message;target.textContent=message;target.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>target.classList.remove('visible'),4000);
}
function imageUrl(value) { return validImage(value,config?.supabaseUrl) ? value : 'assets/hero.webp'; }
function badge(status) { return `<span class="badge ${e(status)}">${labels[status] || 'Rascunho'}</span>`; }
function errorMessage(error) {
  if(error?.message?.includes('JWT') || error?.status===401) return 'A sessão expirou. Volta a entrar para continuar.';
  if(error?.code==='23505') return 'Este registo já existe. Atualiza a página e tenta novamente.';
  return 'Não foi possível concluir. Verifica a ligação e tenta novamente. As alterações do formulário foram mantidas.';
}
function title(heading,description,action='') { return `<div class="page-title"><div><h1>${heading}</h1><p>${description}</p></div>${action}</div>`; }
function stats() {
  return [['products',ui.products.length,'Produtos no estúdio'],['check',ui.products.filter(p=>p.status==='published').length,'Publicados na loja'],['draft',ui.products.filter(p=>p.status==='draft').length,'Em rascunho'],['media',ui.media.length,'Imagens carregadas']].map(([icon,count,label])=>`<article class="stat-card"><span class="stat-icon">${svg(icon)}</span><div class="stat-number">${count}</div><p class="stat-label">${label}</p></article>`).join('');
}
function renderOverview() {
  main.innerHTML=`<div class="page-title"><div><span class="welcome-label">O TEU ESTÚDIO, COM CALMA</span><h1>Olá, Simone.</h1><p>Vamos dar forma às tuas próximas ideias?</p></div><button class="primary" data-new>+ Novo produto</button></div><section class="stats" aria-label="Resumo do catálogo">${stats()}</section><div class="dashboard-columns"><section class="panel"><div class="panel-heading"><h2>As tuas criações</h2><button data-view="products">Ver todas ↗</button></div>${ui.products.slice(0,4).map(p=>`<button class="mini-product" data-edit="${e(p.id)}"><img src="${e(imageUrl(p.image))}" alt="${e(p.name)}" width="45" height="53"><span class="mini-product-copy"><strong>${e(p.name)}</strong><small>${currency(Number(p.price))} · ${e(p.family)}</small></span>${badge(p.status)}</button>`).join('') || '<div class="loading-message">O primeiro produto começa contigo.<br>Escolhe “Novo produto” para começar.</div>'}</section><div><section class="panel"><div class="panel-heading"><h2>Um gesto de cada vez</h2></div><div class="quick-links"><button class="quick-link" data-view="content"><span>✎</span><span><strong>Conta a tua história</strong><small>Atualiza os textos e a página da Simone.</small></span><span>›</span></button><button class="quick-link" data-view="media"><span>▧</span><span><strong>Dá uma nova imagem à loja</strong><small>Carrega as fotografias das tuas peças.</small></span><span>›</span></button><a class="quick-link" href="index.html" target="_blank" rel="noopener"><span>↗</span><span><strong>Vê como está a ficar</strong><small>Abre a loja numa nova janela.</small></span><span>›</span></a></div></section><aside class="studio-note"><h3>O primeiro capítulo.</h3><p>A loja está em apresentação. Os pagamentos ainda não estão ativos. Este painel acompanha o catálogo e os conteúdos; as métricas de vendas chegam quando houver encomendas reais.</p></aside></div></div>`;
}
function renderProducts() {
  main.innerHTML=title('Produtos','As tuas ideias, prontas para ganhar forma.','<button class="primary" data-new>+ Novo produto</button>')+`<div class="catalogue-toolbar"><input type="search" id="admin-search" class="admin-search" aria-label="Pesquisar produtos" placeholder="Pesquisar no teu catálogo" value="${e(ui.search)}"><div class="segmented" role="group" aria-label="Visibilidade dos produtos">${[['all','Todos'],['published','Publicados'],['draft','Rascunhos'],['archived','Arquivo']].map(([key,label])=>`<button class="segment ${ui.filter===key?'active':''}" data-filter="${key}" aria-pressed="${ui.filter===key}">${label}</button>`).join('')}</div></div><section id="admin-product-grid" class="admin-products" aria-live="polite"></section>`;
  renderProductGrid();
}
function renderProductGrid() {
  const term=ui.search.toLocaleLowerCase('pt-PT');
  const list=ui.products.filter(p=>(ui.filter==='all'||p.status===ui.filter)&&`${p.name} ${p.notes}`.toLocaleLowerCase('pt-PT').includes(term));
  document.querySelector('#admin-product-grid').innerHTML=list.map(p=>`<article class="admin-product"><button class="admin-product-photo" data-edit="${e(p.id)}" aria-label="Editar ${e(p.name)}"><img src="${e(imageUrl(p.image))}" alt="${e(p.name)}" width="350" height="280">${badge(p.status)}</button><div class="admin-product-info"><div><h2>${e(p.name)}</h2><span>${currency(Number(p.price))}</span></div><p>${e(p.notes||'Ainda sem notas aromáticas.')}</p><div class="product-actions"><button data-edit="${e(p.id)}">Editar</button><button data-duplicate="${e(p.id)}">Duplicar</button></div></div></article>`).join('')||'<div class="admin-empty"><h2>Ainda não há produtos por aqui.</h2><p>Experimenta outra pesquisa ou cria um novo produto.</p></div>';
}
const homeFields=[['announcement','Faixa superior'],['heroEyebrow','Pequena introdução'],['heroTitle','Título principal','textarea'],['heroDescription','Texto de apresentação','textarea'],['heroImageAlt','Descrição da imagem principal'],['originTitle','Título de apresentação da artesã','textarea'],['originP1','Apresentação da artesã — primeiro parágrafo','textarea'],['originP2','Apresentação da artesã — segundo parágrafo','textarea']];
const storyFields=[['storyName','Nome'],['storyMeta','Origem e percurso'],['storyTitle','Título da página','textarea'],['storyIntro','Introdução','textarea'],['storyP1','As raízes','textarea'],['storyP2','As viagens','textarea'],['storyP3','A descoberta','textarea'],['storyP4','A Avoya','textarea'],['storyClosing','Frase de encerramento','textarea'],['storyImageAlt','Descrição da fotografia'],['storyImageCaption','Legenda da fotografia','textarea']];
function contentField([key,label,type]) { return `<label>${label}${type==='textarea'?`<textarea name="${key}" rows="${key.includes('P')?5:3}" maxlength="6000">${e(ui.content[key])}</textarea>`:`<input name="${key}" value="${e(ui.content[key])}" maxlength="400">`}</label>`; }
function renderContent() {
  const story=ui.contentTab==='story';
  main.innerHTML=title('Conteúdos','As palavras e as imagens que contam a tua história.')+`<div class="content-tabs" role="group" aria-label="Conteúdos da loja"><button class="content-tab ${!story?'active':''}" data-content-tab="home" aria-pressed="${!story}">Página inicial</button><button class="content-tab ${story?'active':''}" data-content-tab="story" aria-pressed="${story}">A história da Simone</button></div><form id="content-form"><div class="content-layout"><div><div class="form-card"><h3>${story?'A tua história':'A primeira impressão'}</h3>${(story?storyFields:homeFields).map(contentField).join('')}</div><button class="primary" type="submit">Guardar alterações</button><p class="inline-status">Ao guardar, os novos conteúdos ficam visíveis na loja.</p><p id="content-error" class="error-text" role="alert"></p></div><aside><div class="content-photo-card"><h3>${story?'Fotografia da página':'Imagem principal'}</h3><img id="content-photo-preview" src="${e(imageUrl(ui.content[story?'storyImage':'heroImage']))}" alt="Pré-visualização da imagem"><input type="hidden" id="content-image" name="${story?'storyImage':'heroImage'}" value="${e(ui.content[story?'storyImage':'heroImage'])}"><button type="button" class="secondary" data-pick-target="content-image">Escolher imagem</button><p class="form-hint">Usa fotografias da tua autoria ou com autorização de utilização. A imagem de atelier atual é ilustrativa.</p></div>${!story?`<div class="content-photo-card"><h3>Imagem da artesã na página inicial</h3><img id="origin-photo-preview" src="${e(imageUrl(ui.content.originImage))}" alt="Pré-visualização da secção da artesã"><input type="hidden" id="origin-image" name="originImage" value="${e(ui.content.originImage)}"><button type="button" class="secondary" data-pick-target="origin-image">Escolher imagem</button></div>`:''}</aside></div></form>`;
  ui.dirty=false;ui.formBaseline=JSON.stringify([...new FormData(document.querySelector('#content-form'))]);
}
function libraryTiles(picker=false) {
  return [...ui.media,...builtinMedia].map((image,index)=>`<button class="media-tile" ${picker?`data-media-index="${index}"`:`data-media-preview="${index}"`} aria-label="${picker?'Escolher':'Ver'} ${e(image.name)}"><img src="${e(imageUrl(image.url))}" alt="${e(image.alt||image.name)}" loading="lazy" width="250" height="250"><span>${e(image.name)}</span></button>`).join('');
}
function renderMedia() { main.innerHTML=title('Imagens','As fotografias que dão vida ao teu estúdio.','<label class="primary file-label">+ Carregar imagem<input type="file" data-upload accept="image/jpeg,image/png,image/webp,image/avif" hidden></label>')+`<p class="form-hint">JPEG, PNG, WebP ou AVIF, até 5 MB. As imagens da biblioteca destinam-se à publicação na loja.</p><section class="media-grid">${libraryTiles()}</section>`; }
function renderSettings() { main.innerHTML=title('A tua conta','Um espaço só teu, ligado à Avoya Studio.')+`<section class="form-card"><div class="settings-row"><div><strong>Simone Martins</strong><small>Administradora do estúdio</small></div><span>Conta autorizada</span></div><div class="settings-row"><div><strong>Email de acesso</strong><small>O link de início de sessão chega a este endereço.</small></div><span>${e(user?.email)}</span></div><div class="settings-row"><div><strong>Acesso seguro</strong><small>Verificação Cloudflare Turnstile e link pessoal por email.</small></div><span>Ativo</span></div><div class="settings-row"><div><strong>A tua loja</strong><small>Abre a loja para confirmar as alterações.</small></div><a class="secondary" href="index.html" target="_blank" rel="noopener">Abrir ↗</a></div><div class="settings-row"><div><strong>Terminar sessão</strong><small>Recomendado ao usar um dispositivo partilhado.</small></div><button class="secondary" data-logout>Sair</button></div></section>`; }
function render() {
  document.querySelectorAll('[data-view]').forEach(button=>{button.classList.toggle('active',button.dataset.view===ui.view);if(button.dataset.view===ui.view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  document.querySelector('#breadcrumb-current').textContent=views.find(([id])=>id===ui.view)?.[1]||'';
  ({overview:renderOverview,products:renderProducts,content:renderContent,media:renderMedia,settings:renderSettings}[ui.view]||renderOverview)();
}
async function refresh() {
  const [catalogue,content,media]=await Promise.all([client.from('products').select('*').order('sort_order').order('created_at'),client.from('site_content').select('*').eq('id','site').single(),client.from('media').select('*').order('created_at',{ascending:false})]);
  const error=catalogue.error||content.error||media.error;if(error)throw error;
  ui.products=catalogue.data;ui.media=media.data;ui.content={...defaultContent,...content.data.data};ui.contentVersion=content.data.updated_at;
}
async function authorize() {
  if(refreshing)return;refreshing=true;
  try {
    const result=await client.auth.getUser();
    if(result.error||!result.data.user){showLogin();return;}
    user=result.data.user;
    const permission=await client.from('admin_users').select('email').eq('email',user.email.toLowerCase()).maybeSingle();
    if(permission.error||!permission.data){await client.auth.signOut();showLogin();loginStatus.textContent='Esta conta não tem acesso ao painel da Avoya.';return;}
    document.querySelector('#login-screen').hidden=true;document.querySelector('#admin-app').hidden=false;
    main.innerHTML='<p class="loading-message">A abrir o teu estúdio…</p>';
    await refresh();render();
  } catch(error){main.innerHTML=`<div class="page-error">${errorMessage(error)} <button class="secondary" data-retry>Voltar a tentar</button></div>`;}
  finally{refreshing=false;}
}
function showLogin() { user=null;document.querySelector('#admin-app').hidden=true;document.querySelector('#login-screen').hidden=false; }
async function discardCheck() {
  if(!ui.dirty)return true;
  return new Promise(resolve=>{ui.pendingClose=resolve;document.querySelector('#unsaved-dialog').showModal();});
}
async function switchView(view) { if(!views.some(([id])=>id===view)||!await discardCheck())return;ui.dirty=false;ui.view=view;render();main.focus();window.scrollTo({top:0}); }
function openProduct(id,duplicate=false) {
  const p=ui.products.find(p=>p.id===id);
  productForm.reset();ui.productVersion=p&&!duplicate?p.updated_at:null;
  const values=p?{...p,id:duplicate?'':p.id,name:duplicate?`${p.name} — cópia`:p.name,status:duplicate?'draft':p.status}:{id:'',name:'',subtitle:'',price:'',size:'',description:'',family:'Frescas',mood:'',notes:'',status:'draft',sort_order:ui.products.length,image:'assets/hero.webp'};
  for(const [name,value] of Object.entries(values)){const field=productForm.elements.namedItem(name);if(field)field.value=value??'';}
  document.querySelector('#product-image-preview').src=imageUrl(values.image);
  document.querySelector('#editor-title').textContent=p&&!duplicate?'Editar produto':'Novo produto';
  document.querySelector('#product-error').textContent='';ui.dirty=false;ui.formBaseline=JSON.stringify([...new FormData(productForm)]);productDialog.showModal();
}
async function saveProduct(event) {
  event.preventDefault();const button=productForm.querySelector('[type="submit"]');button.disabled=true;
  const data=Object.fromEntries(new FormData(productForm));data.price=Number(data.price);data.sort_order=Number(data.sort_order);data.name=data.name.trim();
  if(!data.name||!Number.isFinite(data.price)||data.price<0||data.price>99999||!Number.isInteger(data.sort_order)||!validImage(data.image,config.supabaseUrl)){document.querySelector('#product-error').textContent='Revê o nome, o preço, a ordem e a imagem do produto.';button.disabled=false;return;}
  try {
    const exists=Boolean(data.id);if(!exists)data.id=crypto.randomUUID();
    const result=exists?await client.from('products').update(data).eq('id',data.id).eq('updated_at',ui.productVersion).select().maybeSingle():await client.from('products').insert(data).select().single();
    if(result.error)throw result.error;if(!result.data)throw new Error('conflict');
    ui.dirty=false;productDialog.close();await refresh();render();toast('Produto guardado.');
  } catch(error){document.querySelector('#product-error').textContent=error.message==='conflict'?'Este produto foi alterado noutro dispositivo. Fecha e volta a abri-lo para carregar a versão atual.':errorMessage(error);}
  finally{button.disabled=false;}
}
async function saveContent(event) {
  event.preventDefault();const form=event.target;const button=form.querySelector('[type="submit"]');button.disabled=true;
  const next={...ui.content,...Object.fromEntries(new FormData(form))};
  for(const key of ['heroImage','originImage','storyImage'])if(!validImage(next[key],config.supabaseUrl)){document.querySelector('#content-error').textContent='Escolhe uma imagem válida da biblioteca.';button.disabled=false;return;}
  try {
    const result=await client.from('site_content').update({data:next}).eq('id','site').eq('updated_at',ui.contentVersion).select().maybeSingle();
    if(result.error)throw result.error;if(!result.data)throw new Error('conflict');
    ui.dirty=false;await refresh();render();toast('Conteúdos guardados na loja.');
  }catch(error){document.querySelector('#content-error').textContent=error.message==='conflict'?'Os conteúdos foram alterados noutro dispositivo. Guarda uma cópia do teu texto e atualiza antes de continuar.':errorMessage(error);}
  finally{button.disabled=false;}
}
function openPicker(target) {document.querySelector('#media-status').textContent='';ui.pickerTarget=target;document.querySelector('#media-picker-grid').innerHTML=libraryTiles(true);mediaDialog.showModal();}
function pickMedia(index) {
  const image=[...ui.media,...builtinMedia][index];if(!image||!ui.pickerTarget)return;
  const input=document.getElementById(ui.pickerTarget);if(!input)return;
  input.value=image.url;
  const preview=ui.pickerTarget==='product-image'?'product-image-preview':ui.pickerTarget==='origin-image'?'origin-photo-preview':'content-photo-preview';
  document.getElementById(preview).src=imageUrl(image.url);ui.dirty=true;mediaDialog.close();
}
async function upload(file) {
  if(!file)return;
  const extensions={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'};
  if(!extensions[file.type]||file.size>5242880){toast('Escolhe uma imagem JPEG, PNG, WebP ou AVIF até 5 MB.');return;}
  toast('A carregar a imagem…');
  try {
    const path=`${user.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const uploaded=await client.storage.from('avoya-media').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'31536000'});if(uploaded.error)throw uploaded.error;
    const {data:{publicUrl}}=client.storage.from('avoya-media').getPublicUrl(path);
    const inserted=await client.from('media').insert({path,url:publicUrl,name:file.name.slice(0,200),alt:''}).select().single();if(inserted.error)throw inserted.error;
    ui.media.unshift(inserted.data);
    if(mediaDialog.open)document.querySelector('#media-picker-grid').innerHTML=libraryTiles(true);else if(ui.view==='media')renderMedia();
    toast('Imagem carregada. Já podes escolhê-la para a loja.');
  }catch(error){toast(errorMessage(error));}
}
async function logout() {if(!await discardCheck())return;ui.dirty=false;await client.auth.signOut();user=null;productDialog.close();mediaDialog.close();showLogin();if(widgetId===undefined)await initCaptcha();else window.turnstile?.reset(widgetId);loginStatus.textContent='Sessão terminada. Podes voltar a entrar por email.';}
document.querySelectorAll('#desktop-nav,#mobile-nav').forEach(nav=>nav.innerHTML=views.map(([id,label])=>`<button class="nav-item" data-view="${id}">${svg(id)}<span>${label}</span></button>`).join(''));
document.addEventListener('click',async event=>{
  const target=event.target.closest('button,[data-view]');if(!target)return;
  if(target.dataset.view){await switchView(target.dataset.view);return;}
  if(target.hasAttribute('data-new')){if(await discardCheck())openProduct();return;}
  if(target.hasAttribute('data-edit')){if(await discardCheck())openProduct(target.dataset.edit);return;}
  if(target.hasAttribute('data-duplicate')){if(await discardCheck())openProduct(target.dataset.duplicate,true);return;}
  if(target.hasAttribute('data-filter')){ui.filter=target.dataset.filter;renderProducts();return;}
  if(target.hasAttribute('data-content-tab')){if(!await discardCheck())return;ui.contentTab=target.dataset.contentTab;renderContent();return;}
  if(target.hasAttribute('data-pick-target')){openPicker(target.dataset.pickTarget);return;}
  if(target.hasAttribute('data-media-index')){pickMedia(Number(target.dataset.mediaIndex));return;}
  if(target.hasAttribute('data-media-preview')){const image=[...ui.media,...builtinMedia][Number(target.dataset.mediaPreview)];if(image){document.querySelector('#preview-title').textContent=image.name;document.querySelector('#preview-image').src=imageUrl(image.url);document.querySelector('#preview-image').alt=image.alt||image.name;document.querySelector('#preview-dialog').showModal();}return;}
  if(target.hasAttribute('data-close')){const dialog=target.closest('dialog');if(dialog===productDialog&&!await discardCheck())return;if(dialog===productDialog)ui.dirty=false;dialog.close();return;}
  if(target.hasAttribute('data-logout')||target.id==='logout'){await logout();return;}
  if(target.hasAttribute('data-retry'))await authorize();
});
document.addEventListener('input',event=>{
  if(event.target.id==='admin-search'){ui.search=event.target.value;renderProductGrid();return;}
  if(event.target.closest('#content-form')||event.target.closest('#product-form'))ui.dirty=true;
});
document.addEventListener('change',event=>{if(event.target.matches('[data-upload]')){void upload(event.target.files[0]);event.target.value='';}else if(event.target.closest('#content-form')||event.target.closest('#product-form'))ui.dirty=true;});
document.addEventListener('submit',event=>{if(event.target.id==='content-form')void saveContent(event);});
productForm.addEventListener('submit',saveProduct);
productDialog.addEventListener('cancel',async event=>{event.preventDefault();if(await discardCheck()){ui.dirty=false;productDialog.close();}});
document.querySelector('#unsaved-dialog').addEventListener('cancel',()=>{ui.pendingClose?.(false);ui.pendingClose=null;});
document.querySelector('#keep-editing').addEventListener('click',()=>{document.querySelector('#unsaved-dialog').close();ui.pendingClose?.(false);ui.pendingClose=null;});
document.querySelector('#discard-editing').addEventListener('click',()=>{document.querySelector('#unsaved-dialog').close();ui.dirty=false;ui.pendingClose?.(true);ui.pendingClose=null;});
window.addEventListener('beforeunload',event=>{if(ui.dirty){event.preventDefault();event.returnValue='';}});

async function initCaptcha() {
  if(!config.turnstileSiteKey){loginStatus.textContent='A configuração de segurança ainda está a ser concluída.';return;}
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;
  script.onload=()=>{widgetId=window.turnstile.render('#turnstile',{sitekey:config.turnstileSiteKey,theme:'light','size':'flexible',callback:token=>{captchaToken=token;loginButton.disabled=false;loginStatus.textContent='Enviamos um link pessoal para o teu email. Não precisas de palavra-passe.';},'expired-callback':()=>{captchaToken='';loginButton.disabled=true;},'error-callback':()=>{captchaToken='';loginButton.disabled=true;loginStatus.textContent='Não foi possível verificar o acesso. Atualiza a página para tentar novamente.';}});};
  script.onerror=()=>{loginStatus.textContent='A verificação de segurança não carregou. Verifica a ligação e atualiza a página.';};document.head.append(script);
}
document.querySelector('#login-form').addEventListener('submit',async event=>{
  event.preventDefault();if(!client||!captchaToken)return;loginButton.disabled=true;
  const email=document.querySelector('#login-email').value.trim().toLowerCase();
  try {
    const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:`${location.origin}/admin.html`,captchaToken}});
    if(error)throw error;loginStatus.textContent='Se o email estiver autorizado, receberás um link de acesso. Abre-o neste dispositivo para continuar.';
  }catch(error){loginStatus.textContent=error?.message?.includes('rate')?'Aguarda um pouco antes de pedir outro link.':'Não foi possível enviar o link. Confirma o email e tenta novamente.';}
  finally{captchaToken='';if(widgetId!==undefined)window.turnstile?.reset(widgetId);}
});
try {
  config=await getPublicConfig();
  if(!config.supabaseUrl||!config.supabaseKey){loginStatus.textContent='O teu espaço está a ser preparado. O acesso estará disponível assim que a configuração terminar.';}
  else {
    client=createClient(config.supabaseUrl,config.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
    client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')showLogin();if(event==='SIGNED_IN')setTimeout(()=>void authorize(),0);});
    await authorize();if(!user)await initCaptcha();
  }
} catch {loginStatus.textContent='Não foi possível preparar o acesso. Atualiza a página para tentar novamente.';}
