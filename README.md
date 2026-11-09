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

Pré-visualização pública: https://avoyastudio.onrender.com. Administração: https://avoyastudio.onrender.com/admin.html. Os domínios `avoyastudio.com` e `www.avoyastudio.com` estão associados ao serviço. A Cloudflare gere o DNS; os registos de email Hostinger ficam sem proxy. O frontend contém apenas chaves publicáveis, nunca segredos de servidor.

## O que funciona

- Catálogo de apresentação com filtros, ordenação, pesquisa e detalhes de produto.
- Saco com quantidades, remoção e subtotal; persistência em localStorage apenas neste navegador.
- Mensagem de contacto através do cliente de email, sem envio automático nem criação de encomenda.
- Página editorial sobre Simone Martins e página de cuidados.
- Navegação responsiva, diálogos nativos, Escape, foco e preferências de movimento reduzido.
- Painel administrativo responsivo, com acesso por email e Turnstile, catálogo, biblioteca de imagens e edição dos conteúdos. Ver `docs/admin.md`.

## Estado do lançamento

Os produtos iniciais são fictícios e estão identificados como ilustrativos. A biografia baseia-se nos factos fornecidos pelo cliente. A imagem de atelier é ilustrativa. O Supabase guarda o catálogo e os conteúdos editados. Não existem pagamentos, stock real, contas de clientes nem gestão de encomendas. Os links das redes sociais ainda não estão ativos.

A indexação está bloqueada por `robots.txt` e `noindex` enquanto o catálogo for demonstrativo. Antes do lançamento, substituir os produtos e fotografias, validar a biografia e os cuidados de cada modelo, definir pagamentos e envios, preparar informações legais e de privacidade aplicáveis, verificar o funcionamento das encomendas e remover o bloqueio à indexação.

O catálogo público e os conteúdos são lidos do Supabase por `public/store.mjs`. `public/catalogue.mjs` e `public/content.mjs` registam os valores iniciais. A lógica do saco está em `public/cart.mjs`; a interface da loja, em `public/app.js`; o painel, em `public/admin.js`. Os estilos da loja e da administração ficam separados.

## Imagens

As imagens de conceito foram criadas com a ferramenta integrada ImageGen. As instruções e a proveniência estão em `docs/asset-provenance.md`. Não são fotografias de produtos já à venda.
