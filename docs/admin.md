# Administração Avoya Studio

Painel em `/admin.html`. O email autorizado é `contact@avoyastudio.com`. O acesso usa email e palavra-passe através do Supabase Auth, com Cloudflare Turnstile validado pelo Supabase. Não há palavra-passe de administração gravada no repositório.

## Conteúdos

Produtos: criar, editar, duplicar, publicar, guardar como rascunho e arquivar. Arquivar preserva o registo e retira-o da loja. Alterações de preço, tamanho, aroma, descrição, fotografia e ordem são carregadas pela loja a cada visita.

Conteúdos: faixa superior, título e apresentação da página inicial, apresentação da artesã, página da Simone e respetivas imagens. A gravação publica a alteração. Alterações concorrentes são detetadas para evitar sobrepor uma edição de outro dispositivo.

Biblioteca: imagens de referência locais e novos uploads em JPEG, PNG, WebP ou AVIF até 5 MB. O bucket é público e destina-se exclusivamente às imagens de divulgação da loja. Cada upload recebe um caminho novo. O painel não permite apagar nem substituir fisicamente ficheiros anteriores.

## Configuração

`public/public-config.json` contém apenas URL e chave publicável do Supabase e site key pública do Turnstile. A chave secreta do Turnstile fica exclusivamente na configuração de proteção de autenticação do Supabase. Nunca colocar `service_role`, chave secreta ou palavra-passe no código público.

O projeto dedicado Supabase é `apxlqpcmyvznmejokfdj`, organização Avoya Studio, região Irlanda. `supabase/schema.sql` regista a estrutura inicial instalada; `supabase/seed.sql` regista os dados iniciais. Os scripts são de instalação e não devem ser executados novamente sobre uma base já configurada sem rever o estado.

RLS está ativa em `products`, `site_content`, `media` e `admin_users`. A lista de administradores não pode ser alterada através da API pública. Apenas o email autenticado que corresponde a essa lista pode editar. A loja lê apenas produtos publicados. A decisão de autorização é aplicada na base de dados, independentemente da interface.

## Palavra-passe e emails de confirmação

O fornecedor de email padrão do Supabase limita os envios a dois por hora. O login habitual usa palavra-passe e não envia um link. A confirmação de novas contas e a recuperação de palavra-passe continuam a necessitar de envio de email. A configuração de SMTP da Hostinger usa `smtp.hostinger.com`, porta 465, remetente Avoya Studio e utilizador `contact@avoyastudio.com`. A palavra-passe da caixa fica apenas no Supabase, introduzida pelo titular. Não consta do repositório nem das variáveis do frontend.

Os links de confirmação e recuperação só podem ser usados uma vez. A palavra-passe é definida diretamente pela titular e nunca guardada no repositório. Uma sessão já autenticada pode aceder a `conta.html#seguranca` para definir a primeira palavra-passe.

## Verificações

`npm test`: saco, preços, normalização, escape de HTML e validação de imagens.

`node scripts/verify-public-api.mjs`: leitura pública, ocultação de rascunhos, bloqueio de escrita não autenticada, proteção da lista de administradores e recusa de login sem CAPTCHA.

O build agora exige `npm ci && npm run build`, para empacotar o SDK localmente sem depender de um CDN de JavaScript. Os cabeçalhos no Render devem corresponder a `render.yaml`.

## Encomendas

O painel mostra as últimas 50 encomendas, identificando as de teste. A cliente consulta apenas as suas na área pessoal. O estado de pagamento é atualizado pelo webhook verificado da Stripe; o painel não permite marcar um pagamento como concluído manualmente.


## Envios e traduções

A secção Loja e conta permite configurar portes para Portugal, Europa coberta e Brasil, código postal de origem, peso máximo e conversão manual EUR/BRL. O peso embalado de cada produto começa em 600 g. Aumentar o peso máximo exige rever as tarifas CTT. Os valores guardados são usados pelo servidor de pagamentos.

No editor de produtos, os blocos English e Español permitem personalizar nome, subtítulo, notas, sensação e descrição. Em Conteúdos, escolhe o idioma antes de editar. Textos sem tradução própria usam a versão portuguesa; os textos iniciais têm traduções da loja.
