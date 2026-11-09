import { products, currency } from './catalogue.mjs';
import { cleanCart, cartTotal } from './cart.mjs';
import { loadStore, applyContent } from './store.mjs';
import { escapeHtml } from './content.mjs';
const store = await loadStore();

const bagIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7ZM9 8V6a3 3 0 0 1 6 0v2"/></svg>';
const searchIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
const closeButton = '<button class="close-button" data-close aria-label="Fechar">×</button>';
document.querySelector('#site-header').innerHTML = `
  <div class="announcement">O primeiro capítulo da Avoya · Pré-lançamento</div>
  <header class="header section-shell">
    <button id="menu-toggle" class="icon-button menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button>
    <nav id="main-nav" class="main-nav" aria-label="Navegação principal"><a href="index.html#colecao">A coleção</a><a href="simone.html">A artesã</a><a href="cuidados.html">O ritual</a></nav>
    <a class="logo" href="index.html" aria-label="Avoya Studio — início"><img src="assets/logo.svg" alt="Avoya Studio" width="220" height="96"></a>
    <div class="header-actions"><button class="icon-button" data-search aria-label="Pesquisar velas">${searchIcon}</button><button class="bag-button" data-cart aria-label="Abrir saco, 0 artigos">${bagIcon}<span class="bag-word">Saco</span><span id="bag-count">(0)</span></button></div>
  </header>`;
document.querySelector('#site-footer').innerHTML = `
  <footer class="footer section-shell"><div class="footer-main"><div><a class="footer-logo" href="index.html"><img src="assets/logo.svg" alt="Avoya Studio — início" width="220" height="96"></a><p>Raízes brasileiras.<br>Histórias do mundo.<br>Feito com cuidado, em Portugal.</p></div><div><p class="eyebrow">O universo Avoya</p><a href="index.html#colecao">A coleção</a><a href="simone.html">Simone Martins</a><a href="cuidados.html">O ritual e os cuidados</a></div><div><p class="eyebrow">Estamos por aqui</p><a href="mailto:contact@avoyastudio.com">contact@avoyastudio.com</a><p class="social-placeholder">@avoyastudio<br><span>Redes sociais em breve</span></p></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Avoya Studio</span><span>Portugal · EUR €</span><button class="plain-button" data-info>Informações sobre esta loja</button></div></footer>`;
document.querySelector('#overlays').innerHTML = `
  <dialog id="product-dialog" class="product-dialog" aria-label="Detalhes da vela">${closeButton}<div id="product-detail"></div></dialog>
  <dialog id="cart-dialog" class="cart-dialog" aria-labelledby="cart-title"><div class="dialog-heading"><div><p class="eyebrow">Um ritual à tua medida</p><h2 id="cart-title">O teu saco.</h2></div>${closeButton}</div><div id="cart-lines"></div><div id="cart-bottom"></div></dialog>
  <dialog id="search-dialog" class="search-dialog" aria-labelledby="search-title">${closeButton}<p class="eyebrow">Encontra o teu próximo ritual</p><h2 id="search-title">O que procuras?</h2><label class="sr-only" for="search-input">Pesquisar por nome ou aroma</label><input id="search-input" type="search" placeholder="Nome, aroma ou sensação…" autocomplete="off"><div id="search-results" aria-live="polite"></div></dialog>
  <dialog id="info-dialog" class="info-dialog" aria-labelledby="info-title">${closeButton}<p class="eyebrow">Uma loja a ganhar forma</p><h2 id="info-title">O primeiro capítulo.</h2><p>Esta é a versão de apresentação da Avoya Studio. O catálogo, as imagens, os aromas, os pesos e os preços são ilustrativos e serão substituídos pelos produtos finais.</p><p>A compra e o pagamento online ainda não estão disponíveis. Adicionar ao saco não reserva produtos nem cria uma encomenda. Envios, prazos e condições de venda serão publicados antes da abertura das vendas.</p><p>O saco é guardado apenas neste navegador. Não usamos ferramentas de análise nem publicidade nesta versão. Se nos contactares por email, receberemos os dados que decidires incluir na mensagem.</p><a class="text-link" href="mailto:contact@avoyastudio.com">Falar com a Avoya ↗</a></dialog>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>`;

let cart = [];
try { cart = cleanCart(JSON.parse(localStorage.getItem('avoya-bag-v1') || '[]')); } catch { /* An inaccessible store or a corrupt value starts an empty bag. */ }
let family = 'Todas';
let sort = 'featured';
let toastTimer;
const dialogs = [...document.querySelectorAll('dialog')];
function openDialog(id) {
  dialogs.forEach(dialog => { if (dialog.open) dialog.close(); });
  document.querySelector(`#${id}`).showModal();
  document.body.classList.add('modal-open');
}
dialogs.forEach(dialog => {
  dialog.addEventListener('close', () => { if (!dialogs.some(d => d.open)) document.body.classList.remove('modal-open'); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
function notify(message) {
  const element = document.querySelector('#toast');
  element.textContent = message; element.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 3200);
}
function saveCart() {
  cart = cleanCart(cart);
  try { localStorage.setItem('avoya-bag-v1', JSON.stringify(cart)); } catch { /* The bag remains usable in memory if storage is unavailable. */ }
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('#bag-count').textContent = `(${count})`;
  document.querySelector('[data-cart]').setAttribute('aria-label', `Abrir saco, ${count} ${count === 1 ? 'artigo' : 'artigos'}`);
  renderCart();
}
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const item = cart.find(p => p.id === id);
  if (item?.quantity >= 20) { notify('Limite de 20 unidades por artigo nesta apresentação.'); return; }
  if (item) item.quantity++; else cart.push({ id, quantity: 1 });
  saveCart(); notify(`${product.name} adicionado ao saco.`);
}
function productCard(product) {
  product = displayProduct(product);
  return `<article class="product-card product-${product.id}"><div class="product-photo"><button class="product-open" data-product="${product.id}" aria-label="Ver ${product.name}"><img src="${product.image}" alt="Imagem ilustrativa da vela ${product.name}" width="600" height="750" loading="lazy"></button><span class="product-tag">${product.mood}</span><button class="quick-add" data-add="${product.id}" aria-label="Adicionar ${product.name} ao saco">+</button></div><div class="product-line"><button data-product="${product.id}" class="product-name">${product.name}</button><span>${currency(product.price)}</span></div><p class="product-notes">${product.notes}</p><p class="product-meta">Vela artesanal · ${product.size}</p></article>`;
}
function renderProducts() {
  const grid = document.querySelector('#products'); if (!grid) return;
  const filtered = products.filter(p => family === 'Todas' || p.family === family);
  if (sort !== 'featured') filtered.sort((a, b) => sort === 'price-asc' ? a.price - b.price : b.price - a.price);
  grid.innerHTML = filtered.map(productCard).join('');
  if (!filtered.length) grid.innerHTML = `<p class="catalogue-empty">${store.available ? 'A coleção está a ser preparada. Volta em breve para descobrir as novidades.' : 'A coleção está temporariamente indisponível. Tenta novamente dentro de instantes.'}</p>`;
  document.querySelector('#product-count').textContent = `${filtered.length} velas nesta seleção`;
}
function showProduct(id) {
  const raw = products.find(item => item.id === id); if (!raw) return;
  const p = displayProduct(raw);
  document.querySelector('#product-detail').innerHTML = `<div class="detail-layout product-${p.id}"><div class="detail-image"><img src="${p.image}" alt="Imagem ilustrativa da vela ${p.name}" width="700" height="875"></div><div class="detail-copy"><p class="eyebrow">A primeira coleção · ${p.family}</p><h2>${p.name}</h2><p class="detail-subtitle">${p.subtitle}</p><p>${p.description}</p><div class="detail-notes"><span class="eyebrow">Notas imaginadas</span><p>${p.notes}</p></div><div class="detail-price"><span>${currency(p.price)}</span><span>Vela artesanal · ${p.size}</span></div><button class="button dark full" data-add="${p.id}">Adicionar ao saco <span aria-hidden="true">+</span></button><p class="demo-note">Produto de demonstração. Imagem, aroma, peso e preço ilustrativos. As vendas ainda não estão abertas.</p><a class="text-link" href="cuidados.html">Conhecer os cuidados ↗</a></div></div>`;
  document.querySelector('#product-dialog').setAttribute('aria-label', `Detalhes de ${raw.name}`);
  openDialog('product-dialog');
}
function renderCart() {
  const lines = document.querySelector('#cart-lines');
  if (!cart.length) {
    lines.innerHTML = '<div class="empty-cart"><span aria-hidden="true">✳</span><h3>Ainda há espaço<br>para um novo ritual.</h3><p>Descobre a coleção e guarda aqui as tuas velas favoritas.</p><a class="button dark" href="index.html#colecao">Explorar a coleção ↗</a></div>';
    document.querySelector('#cart-bottom').innerHTML = ''; return;
  }
  lines.innerHTML = cart.map(item => {
    const p = displayProduct(products.find(p => p.id === item.id));
    return `<article class="cart-line product-${p.id}"><img src="${p.image}" alt="${p.name}" width="82" height="108"><div><h3>${p.name}</h3><p>${p.size} · ${currency(p.price)}</p><div class="quantity"><button data-change="${p.id}" data-delta="-1" aria-label="Diminuir quantidade de ${p.name}">−</button><span aria-label="Quantidade">${item.quantity}</span><button data-change="${p.id}" data-delta="1" ${item.quantity >= 20 ? 'disabled' : ''} aria-label="Aumentar quantidade de ${p.name}">+</button></div></div><div class="cart-line-end"><span>${currency(p.price * item.quantity)}</span><button class="remove" data-remove="${p.id}" aria-label="Remover ${p.name}">Remover</button></div></article>`;
  }).join('');
  const message = `Olá, Avoya! Gostaria de saber mais sobre esta seleção de apresentação:\n\n${cart.map(item => `${item.quantity} × ${products.find(p => p.id === item.id).name}`).join('\n')}\n\nSei que os produtos são ilustrativos e que esta mensagem não constitui uma encomenda.`;
  const mail = `mailto:contact@avoyastudio.com?subject=${encodeURIComponent('A minha seleção Avoya')}&body=${encodeURIComponent(message)}`;
  document.querySelector('#cart-bottom').innerHTML = `<div class="cart-subtotal"><span>Subtotal ilustrativo</span><strong>${currency(cartTotal(cart))}</strong></div><p class="demo-note">Esta seleção fica guardada no teu navegador. Não cria uma encomenda nem reserva produtos.</p><button class="button unavailable full" disabled>Compras disponíveis em breve</button><a class="text-link cart-contact" href="${mail}">Falar sobre esta seleção ↗</a>`;
}
function search() {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-PT');
  const term = normalize(document.querySelector('#search-input').value.trim());
  const matches = products.filter(p => normalize(`${p.name} ${p.notes} ${p.mood} ${p.family}`).includes(term));
  const target = document.querySelector('#search-results');
  if (!matches.length) { target.innerHTML = '<p class="search-empty">Ainda não encontrámos esse aroma. Experimenta “chá”, “âmbar” ou “Raiz”.</p>'; return; }
  target.innerHTML = matches.map(displayProduct).map(p => `<button class="search-result product-${p.id}" data-product="${p.id}"><img src="${p.image}" alt="" width="60" height="75"><span><strong>${p.name}</strong><small>${p.notes}</small></span><span>${currency(p.price)} ↗</span></button>`).join('');
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-close')) { button.closest('dialog').close(); return; }
  if (button.hasAttribute('data-add')) { addToCart(button.dataset.add); return; }
  if (button.hasAttribute('data-product')) { showProduct(button.dataset.product); return; }
  if (button.hasAttribute('data-cart')) { renderCart(); openDialog('cart-dialog'); return; }
  if (button.hasAttribute('data-search')) { document.querySelector('#search-input').value = ''; search(); openDialog('search-dialog'); document.querySelector('#search-input').focus(); return; }
  if (button.hasAttribute('data-info')) { openDialog('info-dialog'); return; }
  if (button.hasAttribute('data-family')) {
    family = button.dataset.family;
    document.querySelectorAll('[data-family]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    renderProducts(); return;
  }
  if (button.hasAttribute('data-remove')) { cart = cart.filter(p => p.id !== button.dataset.remove); saveCart(); document.querySelector('#cart-title').focus(); return; }
  if (button.hasAttribute('data-change')) {
    const item = cart.find(p => p.id === button.dataset.change); if (!item) return;
    const id = item.id; const delta = button.dataset.delta;
    item.quantity += Number(delta); saveCart();
    const next = document.querySelector(`[data-change="${id}"][data-delta="${delta}"]`);
    if (next && !next.disabled) next.focus(); else document.querySelector('#cart-dialog [data-close]').focus();
  }
});
document.querySelector('#cart-title').tabIndex = -1;
document.querySelector('#search-input').addEventListener('input', search);
document.querySelector('#sort')?.addEventListener('change', event => { sort = event.target.value; renderProducts(); });
document.querySelector('#menu-toggle').addEventListener('click', event => {
  const button = event.currentTarget; const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded)); button.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
  document.querySelector('#main-nav').classList.toggle('is-open', !expanded);
});
document.querySelector('#main-nav').addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  document.querySelector('#main-nav').classList.remove('is-open');
  document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { document.querySelector('#main-nav').classList.remove('is-open'); document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false'); }
});
function displayProduct(product) { return Object.fromEntries(Object.entries(product).map(([key,value]) => [key, typeof value === 'string' ? escapeHtml(value) : value])); }
saveCart(); renderProducts(); applyContent(store.content,store.config);
