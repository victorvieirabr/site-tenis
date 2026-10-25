# Site Tenis — loja virtual de demonstração

Projeto de portfólio: uma loja virtual de tênis de futebol, feita do zero. **A loja é fictícia**: marcas, produtos e preços foram inventados, as imagens são ilustrações e nada está à venda.

**Ver a demonstração:** https://victorvieirabr.github.io/site-tenis/

## O que o site faz

- Página inicial com novidades, promoções e menu que mostra só as categorias com produto
- Vitrine com filtros por marca, modelo, tamanho, promoção e pronta entrega, e ordenação por preço ou novidade
- Página de produto com galeria de fotos, cores do mesmo modelo ligadas entre si e grade de tamanhos
- **Pronta entrega e encomenda**: tamanho em estoque leva à compra; tamanho sem estoque aparece como "sob encomenda", com prazo de entrega
- Pedido pelo WhatsApp com a mensagem pronta (modelo, cor, tamanho e preço). Na demonstração, o botão mostra a mensagem em vez de abrir o WhatsApp
- Tema claro e escuro, que segue o aparelho e lembra a escolha do visitante
- Prévia bonita do link ao compartilhar no WhatsApp e nas redes sociais
- Funciona bem no celular

O código também traz contas de cliente (Google ou e-mail), favoritos, carrinho, pagamento por Pix e área do dono com Firebase. Essa parte fica desligada na demonstração.

## Como é feito

- HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build
- Nenhum produto fica escrito no HTML: as páginas são montadas a partir de um único arquivo de catálogo (`portfolio/dados/catalogo.js`)
- Textos do catálogo entram na página sempre como texto (nunca como HTML), para evitar injeção de código
- Arquivos externos carregados com verificação de integridade (o navegador recusa arquivos alterados)
- Publicado automaticamente no GitHub Pages a cada mudança (`.github/workflows/publicar-site.yml`)

## Rodar no computador

Abra `portfolio/index.html` no navegador. Não precisa de servidor nem de instalar nada.
