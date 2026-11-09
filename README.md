# Avoya Studio

Primeira versão da loja de velas de Simone Martins. Português de Portugal e EUR. A identidade parte do lettering Avoya aprovado na versão 2.

## Desenvolvimento

Node.js 22 ou superior. O SDK Supabase e o empacotador são instalados com versões fixas no lockfile.

```sh
npm ci
npm run dev
npm test
npm run build
```

Preview: http://127.0.0.1:4173. O build gera `dist/`.

## Publicar no Render

Conta **contact@avoyastudio.com**. Static Site `avoyastudio`, branch `main`, comando `npm ci && npm run build`, diretório de publicação `dist`. A configuração equivalente está em `render.yaml` para Blueprints. Um Static Site não exige tráfego periódico nem cron para evitar suspensão por inatividade. A publicação atual pode ser acionada por Manual Deploy > Deploy latest commit no Render.

Pré-visualização pública: https://avoyastudio.onrender.com. Administração: https://avoyastudio.onrender.com/admin.html. Os domínios `avoyastudio.com` e `www.avoyastudio.com` estão associados ao serviço. A Cloudflare gere o DNS, com proxy ativo no domínio principal e em www e SSL Full (strict); os registos de email Hostinger ficam sem proxy. O frontend contém apenas chaves publicáveis, nunca segredos de servidor.

## O que funciona

- Catálogo de apresentação com filtros, ordenação, pesquisa e detalhes de produto.
- Saco com quantidades, remoção e subtotal; persistência em localStorage apenas neste navegador.
- Mensagem de contacto através do cliente de email, sem envio automático nem criação de encomenda.
- Página editorial sobre Simone Martins e página de cuidados.
- Navegação responsiva, diálogos nativos, Escape, foco e preferências de movimento reduzido.
- Painel administrativo responsivo, com acesso por email, palavra-passe e Turnstile, catálogo, biblioteca de imagens e edição dos conteúdos. Ver `docs/admin.md`.

## Estado do lançamento

Os produtos iniciais são fictícios e estão identificados como ilustrativos. A biografia baseia-se nos factos fornecidos pelo cliente. A imagem de atelier é ilustrativa. O Supabase guarda o catálogo e os conteúdos editados. A área de cliente em `conta.html` usa email e palavra-passe e mostra o histórico privado de encomendas. O checkout Stripe está preparado exclusivamente para testes; a ativação depende das chaves de teste no Supabase. Não existem cobranças reais nem stock real. Os links das redes sociais ainda não estão ativos.

A indexação está bloqueada por `robots.txt` e `noindex` enquanto o catálogo for demonstrativo. Antes do lançamento, substituir os produtos e fotografias, validar a biografia e os cuidados de cada modelo, definir pagamentos e envios, preparar informações legais e de privacidade aplicáveis, verificar o funcionamento das encomendas e remover o bloqueio à indexação.

O catálogo público e os conteúdos são lidos do Supabase por `public/store.mjs`. `public/catalogue.mjs` e `public/content.mjs` registam os valores iniciais. A lógica do saco está em `public/cart.mjs`; a interface da loja, em `public/app.js`; o painel, em `public/admin.js`. Os estilos da loja e da administração ficam separados.

## Imagens

As imagens de conceito foram criadas com a ferramenta integrada ImageGen. As instruções e a proveniência estão em `docs/asset-provenance.md`. Não são fotografias de produtos já à venda.

## Clientes e checkout

A migração `supabase/migrations/20261109133442_customer_accounts_orders.sql` instala perfis, encomendas e registos de eventos. Clientes só leem as suas encomendas; apenas o servidor pode criar encomendas ou alterar pagamentos. `tests/customer-rls.sql` verifica o isolamento com dados temporários e faz rollback no fim.

A função `supabase/functions/commerce/index.ts` calcula preços a partir do catálogo e cria sessões Stripe Checkout. O endpoint `?action=webhook` verifica a assinatura Stripe e confirma montantes, moeda e modo de teste antes de atualizar a encomenda. A página de retorno não confirma pagamentos. Os eventos são tratados de forma idempotente. A configuração de JWT da plataforma fica desligada nesta função porque a criação de checkout valida a sessão no Supabase Auth e os webhooks validam a assinatura Stripe.

Os segredos `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` ficam exclusivamente no Supabase Edge Function Secrets. `CHECKOUT_MODE=test` só aceita chaves de teste. `SHIPPING_CENTS=0` é o valor de entrega fictício para os testes. Sem chave válida, o servidor recusa iniciar pagamentos. Cobranças reais exigem configuração explícita (`CHECKOUT_MODE=live`, chave live, portes definidos e `ALLOW_LIVE_PAYMENTS=true`), além da validação comercial e fiscal antes do lançamento.

Eventos Stripe: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired e charge.refunded. Os testes de lógica do servidor usam pedidos HTTP e simulam os serviços externos; não representam uma compra real concluída.

O registo de clientes mantém confirmação de email. Login por palavra-passe não exige um email em cada entrada; confirmação inicial e recuperação de acesso continuam a precisar de SMTP. O fornecedor padrão do Supabase é limitado e não serve o registo público de clientes. O Resend e o marketing ainda não estão integrados, e criar conta não subscreve uma newsletter.
