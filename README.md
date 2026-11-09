# Avoya Studio

Primeira versão da loja de velas de Simone Martins. Português de Portugal e EUR. A identidade parte do lettering Avoya aprovado na versão 2.

## Desenvolvimento

Node.js 20 ou superior. Sem dependências externas nem instalação de pacotes.

```sh
npm run dev
npm test
npm run build
```

Preview: http://127.0.0.1:4173. O build gera `dist/`.

## Publicar no Render

Criar ou usar a conta **contact@avoyastudio.com**. Criar um **Static Site** ligado a este repositório, branch `main`, comando `npm run build`, diretório de publicação `dist`. A configuração equivalente está em `render.yaml` para Blueprints. Um Static Site não é um Free Web Service: não exige tráfego periódico nem cron para evitar suspensão por inatividade.

O domínio avoyastudio.com deve ser associado apenas depois de confirmar a pré-visualização. Não alterar registos MX/TXT do email ao configurar o domínio da loja. Não há segredos nem credenciais no frontend.

## O que funciona

- Catálogo de apresentação com filtros, ordenação, pesquisa e detalhes de produto.
- Saco com quantidades, remoção e subtotal; persistência em localStorage apenas neste navegador.
- Mensagem de contacto através do cliente de email, sem envio automático nem criação de encomenda.
- Página editorial sobre Simone Martins e página de cuidados.
- Navegação responsiva, diálogos nativos, Escape, foco e preferências de movimento reduzido.

## Estado do lançamento

Produtos, aromas, pesos, fotografias e preços são fictícios e estão identificados como ilustrativos. A biografia baseia-se nos factos fornecidos pelo cliente. A imagem de atelier é uma representação do processo artesanal, não um retrato de Simone. Não existem pagamentos, stock real, contas de clientes, base de dados nem gestão de encomendas. Os links das redes sociais ainda não estão ativos.

A indexação está bloqueada por `robots.txt` e `noindex` enquanto o catálogo for demonstrativo. Antes do lançamento, substituir os produtos e fotografias, validar a biografia e os cuidados de cada modelo, definir pagamentos e envios, preparar informações legais e de privacidade aplicáveis, verificar o funcionamento das encomendas e remover o bloqueio à indexação.

Os dados do catálogo ficam em `public/catalogue.mjs`. A lógica do saco está em `public/cart.mjs`; a interface, em `public/app.js`. As páginas HTML contêm o conteúdo editorial; `public/styles.css` contém os estilos.

## Imagens

As imagens de conceito foram criadas com a ferramenta integrada ImageGen. As instruções e a proveniência estão em `docs/asset-provenance.md`. Não são fotografias de produtos já à venda.
