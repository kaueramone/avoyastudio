# Administração Avoya Studio

Painel em `/admin.html`. O email autorizado é `contact@avoyastudio.com`. O acesso usa links de email do Supabase Auth e Cloudflare Turnstile, validado pelo Supabase. Não há palavra-passe de administração gravada no repositório.

## Conteúdos

Produtos: criar, editar, duplicar, publicar, guardar como rascunho e arquivar. Arquivar preserva o registo e retira-o da loja. Alterações de preço, tamanho, aroma, descrição, fotografia e ordem são carregadas pela loja a cada visita.

Conteúdos: faixa superior, título e apresentação da página inicial, apresentação da artesã, página da Simone e respetivas imagens. A gravação publica a alteração. Alterações concorrentes são detetadas para evitar sobrepor uma edição de outro dispositivo.

Biblioteca: imagens de referência locais e novos uploads em JPEG, PNG, WebP ou AVIF até 5 MB. O bucket é público e destina-se exclusivamente às imagens de divulgação da loja. Cada upload recebe um caminho novo. O painel não permite apagar nem substituir fisicamente ficheiros anteriores.

## Configuração

`public/public-config.json` contém apenas URL e chave publicável do Supabase e site key pública do Turnstile. A chave secreta do Turnstile fica exclusivamente na configuração de proteção de autenticação do Supabase. Nunca colocar `service_role`, chave secreta ou palavra-passe no código público.

O projeto dedicado Supabase é `apxlqpcmyvznmejokfdj`, organização Avoya Studio, região Irlanda. `supabase/schema.sql` regista a estrutura inicial instalada; `supabase/seed.sql` regista os dados iniciais. Os scripts são de instalação e não devem ser executados novamente sobre uma base já configurada sem rever o estado.

RLS está ativa em `products`, `site_content`, `media` e `admin_users`. A lista de administradores não pode ser alterada através da API pública. Apenas o email autenticado que corresponde a essa lista pode editar. A loja lê apenas produtos publicados. A decisão de autorização é aplicada na base de dados, independentemente da interface.

## Envio dos links de acesso

O fornecedor de email padrão do Supabase limita os envios a dois por hora. O painel preserva a mensagem de falha mesmo quando o Turnstile se renova, para não apresentar um pedido recusado como enviado. A configuração de SMTP da Hostinger usa `smtp.hostinger.com`, porta 465, remetente Avoya Studio e utilizador `contact@avoyastudio.com`. A palavra-passe da caixa fica apenas no Supabase, introduzida pelo titular. Não consta do repositório nem das variáveis do frontend.

Os links só podem ser usados uma vez. Um link já utilizado ou expirado exige um novo pedido.

## Verificações

`npm test`: saco, preços, normalização, escape de HTML e validação de imagens.

`node scripts/verify-public-api.mjs`: leitura pública, ocultação de rascunhos, bloqueio de escrita não autenticada, proteção da lista de administradores e recusa de login sem CAPTCHA.

O build agora exige `npm ci && npm run build`, para empacotar o SDK localmente sem depender de um CDN de JavaScript. Os cabeçalhos no Render devem corresponder a `render.yaml`.
