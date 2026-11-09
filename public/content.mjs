export const defaultContent = {
  announcement: 'O primeiro capítulo da Avoya · Pré-lançamento',
  heroEyebrow: 'Feito com tempo. Sentido com calma.',
  heroTitle: 'Pequenos rituais.\nNovos sentidos.',
  heroDescription: 'Velas que guardam lugares, despertam memórias e tornam o quotidiano um pouco mais nosso.',
  heroImage: 'assets/hero.webp', heroImageAlt: 'Velas Avoya em tons de matcha e marfim, à luz natural',
  originTitle: 'De tantos lugares,\num caminho\nfeito à mão.',
  originP1: 'Do Brasil trouxe as raízes. Das viagens pela Europa e por África, um olhar atento às cores, aos aromas e às pequenas coisas que ficam.',
  originP2: 'Em Portugal, encontrou espaço para escutar uma nova vontade: criar com as mãos. A Avoya nasceu desse encontro entre descoberta, coragem e cuidado.',
  originImage: 'assets/atelier.webp',
  storyTitle: 'Criar também é\numa forma de\nnos encontrarmos.',
  storyName: 'Simone Martins', storyMeta: 'Brasil, 1991 · Portugal, desde 2023',
  storyIntro: 'A Avoya começa muito antes da primeira vela. Começa numa mulher que aprendeu a olhar para os recomeços como um lugar de possibilidade.',
  storyImage: 'assets/atelier.webp', storyImageAlt: 'Representação ilustrativa do trabalho artesanal com velas, sem retratar Simone',
  storyImageCaption: 'Uma imagem do universo artesanal.\nO retrato da Simone chega em breve.',
  storyP1: 'Brasileira, nascida em 1991, Simone Martins chegou a Portugal em 2023. Com ela vieram as raízes, as memórias e uma maneira calorosa de sentir o mundo. Vieram também perguntas, vontades e a curiosidade de descobrir quem poderia ser neste novo lugar.',
  storyP2: 'As viagens pela Europa e por África ampliaram esse olhar. A luz de uma rua, a textura de uma parede, um aroma que atravessa um mercado: pequenos encontros tornaram-se matéria de inspiração. Mais do que guardar destinos, Simone começou a guardar sensações.',
  storyP3: 'Entre a descoberta pessoal e a escuta interior, surgiu a coragem de dar forma a uma vontade: dedicar tempo ao trabalho das mãos. No artesanato de velas, encontrou um ritmo mais atento e uma linguagem para aquilo que nem sempre se explica em palavras.',
  storyP4: 'A Avoya Studio nasce desse percurso. Um estúdio em Portugal, com alma brasileira e o mundo como inspiração. Um lugar para criar velas especiais, pensadas com cuidado para acompanhar os momentos de quem as recebe.',
  storyClosing: 'Porque há coisas que criamos para a casa.\nE outras que acabam por nos fazer sentir em casa.'
};
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function validImage(value, supabaseUrl = '') {
  if (typeof value !== 'string') return false;
  if (/^assets\/[a-zA-Z0-9_./-]+\.(webp|png|jpg|jpeg|avif)$/i.test(value) && !value.includes('..')) return true;
  try { const u = new URL(value); return u.protocol === 'https:' && u.origin === new URL(supabaseUrl).origin && u.pathname.startsWith('/storage/v1/object/public/avoya-media/'); } catch { return false; }
}
