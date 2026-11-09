import { products } from './catalogue.mjs';
import { defaultContent, validImage } from './content.mjs';
export async function getPublicConfig() {
  const response = await fetch('public-config.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Não foi possível ler a configuração da loja.');
  return response.json();
}
export async function loadStore() {
  let config;
  try { config = await getPublicConfig(); } catch { return { content: defaultContent, available: true }; }
  if (!config.supabaseUrl || !config.supabaseKey) return { content: defaultContent, available: true };
  const headers = { apikey: config.supabaseKey };
  try {
    const responses = await Promise.all([
      fetch(`${config.supabaseUrl}/rest/v1/products?select=*&status=eq.published&order=sort_order.asc,created_at.asc`,{ headers, signal: AbortSignal.timeout(8000) }),
      fetch(`${config.supabaseUrl}/rest/v1/site_content?select=data&id=eq.site`,{ headers, signal: AbortSignal.timeout(8000) })
    ]);
    if (responses.some(r => !r.ok)) throw new Error('Store unavailable');
    const [rows, pages] = await Promise.all(responses.map(r => r.json()));
    products.splice(0, products.length, ...rows.map(p => ({ ...p, price: Number(p.price), image: validImage(p.image, config.supabaseUrl) ? p.image : 'assets/hero.webp' })));
    return { content: { ...defaultContent, ...(pages[0]?.data || {}) }, available: true, config };
  } catch {
    products.splice(0, products.length);
    return { content: defaultContent, available: false, config };
  }
}
function setText(selector, text) {
  const target = document.querySelector(selector); if (!target || typeof text !== 'string') return;
  target.replaceChildren(...text.split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
}
export function applyContent(content, config = {}) {
  const fields = {
    '.announcement':'announcement', '.hero-copy .eyebrow':'heroEyebrow', '.hero h1':'heroTitle', '.hero-description':'heroDescription',
    '#origin-title':'originTitle', '.origin-copy p:nth-of-type(2)':'originP1', '.origin-copy p:nth-of-type(3)':'originP2',
    '.story-top h1':'storyTitle', '.story-intro > p:last-child':'storyIntro', '.story-body > div:last-child > p:nth-child(1)':'storyP1',
    '.story-body > div:last-child > p:nth-child(2)':'storyP2', '.story-body > div:last-child > p:nth-child(3)':'storyP3',
    '.story-body > div:last-child > p:nth-child(4)':'storyP4', '.story-closing':'storyClosing', '.story-image-caption > span:last-child':'storyImageCaption'
  };
  for (const [selector, key] of Object.entries(fields)) setText(selector, content[key]);
  const name = document.querySelector('.story-name');
  if (name) { name.replaceChildren(document.createTextNode(content.storyName),document.createElement('br')); const span = document.createElement('span');span.textContent = content.storyMeta;name.append(span); }
  for (const [selector,key,altKey] of [['.hero-visual > img','heroImage','heroImageAlt'],['.origin-image > img','originImage'],['.story-image > img','storyImage','storyImageAlt']]) {
    const image=document.querySelector(selector);if(image && validImage(content[key],config.supabaseUrl)) { image.src=content[key];if(altKey)image.alt=content[altKey] || ''; }
  }
}
