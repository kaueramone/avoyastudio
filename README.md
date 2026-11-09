# Avoya Studio

Primeira versão da loja de velas de Simone Martins. Português de Portugal, inglês e espanhol; preços em EUR e BRL. A identidade parte do lettering Avoya aprovado na versão 2.

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

Os produtos iniciais são fictícios e estão identificados como ilustrativos. A biografia baseia-se nos factos fornecidos pelo cliente. A imagem de atelier é ilustrativa. O Supabase guarda o catálogo e os conteúdos editados. A área de cliente em `conta.html` usa email e palavra-passe e mostra o histórico privado de encomendas. O checkout Stripe suporta teste e produção, conforme as chaves e os controlos explícitos do servidor. As cobranças continuam desativadas enquanto faltarem os segredos Stripe. Não existem cobranças reais nem stock real. Os links das redes sociais ainda não estão ativos.

A indexação está bloqueada por `robots.txt` e `noindex` enquanto o catálogo for demonstrativo. Antes do lançamento, substituir os produtos e fotografias, validar a biografia e os cuidados de cada modelo, definir pagamentos e envios, preparar informações legais e de privacidade aplicáveis, verificar o funcionamento das encomendas e remover o bloqueio à indexação.

O catálogo público e os conteúdos são lidos do Supabase por `public/store.mjs`. `public/catalogue.mjs` e `public/content.mjs` registam os valores iniciais. A lógica do saco está em `public/cart.mjs`; a interface da loja, em `public/app.js`; o painel, em `public/admin.js`. Os estilos da loja e da administração ficam separados.

## Imagens

As imagens de conceito foram criadas com a ferramenta integrada ImageGen. As instruções e a proveniência estão em `docs/asset-provenance.md`. Não são fotografias de produtos já à venda.

## Clientes e checkout

A migração `supabase/migrations/20261109133442_customer_accounts_orders.sql` instala perfis, encomendas e registos de eventos. Clientes só leem as suas encomendas; apenas o servidor pode criar encomendas ou alterar pagamentos. `tests/customer-rls.sql` verifica o isolamento com dados temporários e faz rollback no fim.

A função `supabase/functions/commerce/index.ts` calcula preços a partir do catálogo e cria sessões Stripe Checkout. O endpoint `?action=webhook` verifica a assinatura Stripe e confirma montantes, moeda e modo de teste antes de atualizar a encomenda. A página de retorno não confirma pagamentos. Os eventos são tratados de forma idempotente. A configuração de JWT da plataforma fica desligada nesta função porque a criação de checkout valida a sessão no Supabase Auth e os webhooks validam a assinatura Stripe.

Os segredos `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` ficam exclusivamente no Supabase Edge Function Secrets. `CHECKOUT_MODE=test` só aceita chaves de teste. Os portes são lidos de `commerce_settings`, nunca do navegador. O antigo segredo `SHIPPING_CENTS` já não é utilizado. Sem chave válida, o servidor recusa iniciar pagamentos. Cobranças reais exigem configuração explícita (`CHECKOUT_MODE=live`, chave live, segredo do webhook de produção e `ALLOW_LIVE_PAYMENTS=true`), além da validação comercial e fiscal antes do lançamento.

Eventos Stripe: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired e charge.refunded. Os testes de lógica do servidor usam pedidos HTTP e simulam os serviços externos; não representam uma compra real concluída.

O registo de clientes mantém confirmação de email. Login por palavra-passe não exige um email em cada entrada; confirmação inicial e recuperação de acesso continuam a precisar de SMTP. O fornecedor padrão do Supabase é limitado e não serve o registo público de clientes. O Resend e o marketing ainda não estão integrados, e criar conta não subscreve uma newsletter.


## Portes, idiomas e moedas

A migração `20261109140404_shipping_locales_brl.sql` instala as configurações públicas, editáveis apenas por administradores. Na área **Loja e conta**, a Simone altera origem, taxas fixas, peso máximo e conversão EUR/BRL. Cada produto tem peso embalado e traduções EN/ES. Os conteúdos editoriais têm seleção de idioma; imagens são comuns.

Referência inicial CTT Encomenda Postal: origem 5340-262; até 1 kg por encomenda; Portugal com ilhas e entrega ao domicílio EUR 15,80, países europeus cobertos EUR 39,70, Brasil EUR 47,50. Peso conservador de cada vela: 600 g com embalagem, conforme pesagem indicada pelo cliente. Não são cotações em tempo real e não incluem embalagem, impostos de importação ou desalfandegamento. Encomendas acima do limite precisam de orçamento: o checkout não cobra a tarifa errada.

Europa coberta: UE, Reino Unido, Noruega, Islândia, Liechtenstein, Suíça, Andorra, Mónaco, São Marino e Vaticano. Outros destinos não são aceites automaticamente. O país escolhido determina a tarifa no servidor e é o único permitido na morada Stripe. Tarifas e conversão ficam registadas na encomenda. Cada valor em BRL é arredondado por unidade aos cêntimos, tal como na Stripe. A referência inicial manual é 6,1449 BRL/EUR, de 6/11/2026 (BCE); o administrador pode alterá-la.

Os métodos apresentados pela Stripe dependem da moeda, país e elegibilidade da conta. Na verificação da configuração live em 9/11/2026, Pix, Klarna e MB WAY estavam disponíveis e ligados; Multibanco estava indisponível. O webhook de produção foi criado com os cinco eventos acima. Não foi feita nenhuma compra real nem inseridas chaves secretas pelo agente.

Fontes: https://www.ctt.pt/particulares/enviar/para-o-estrangeiro/encomenda-postal ; https://www.ctt.pt/particulares/enviar/para-portugal/encomenda-postal ; https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html ; https://docs.stripe.com/payments/pix


A verificação privada `GET ?action=readiness` aceita apenas a credencial de servidor no testador de funções do Supabase. Consulta a conta e o webhook na Stripe com a chave configurada e devolve apenas indicadores de estado. Não cria sessões, encomendas ou cobranças e não devolve segredos nem dados pessoais.
