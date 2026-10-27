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

## Cadastro de produtos (área do dono)

A página `cadastro.html` (no site publicado: `/cadastro.html`) é onde o dono cadastra, muda, tira do site e exclui produtos, com fotos, pelo computador ou pelo celular. Não precisa mexer em código.

- Cada "Salvar" grava o catálogo e as fotos direto no GitHub, e o site é publicado sozinho em 1 ou 2 minutos. A tela avisa quando já está no ar.
- O login é uma chave de acesso do GitHub que só pode mexer nos arquivos deste repositório. A própria tela tem o passo a passo e um link que abre a criação da chave já preenchida.
- As fotos são diminuídas no navegador antes de enviar (grande com até 1000 px e miniatura com até 600 px, em JPG).
- "Cadastrar outra cor deste modelo" copia um produto já cadastrado, para só trocar a cor, as fotos e o estoque.
- O catálogo continua sendo o arquivo `portfolio/dados/catalogo.js`, gravado no mesmo formato de sempre. Toda mudança fica no histórico do GitHub e pode ser desfeita.
- Para usar com outro repositório (outra cópia do site), mude `portfolio/js/cadastro-config.js`.

## Como é feito

- HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build
- Nenhum produto fica escrito no HTML: as páginas são montadas a partir de um único arquivo de catálogo (`portfolio/dados/catalogo.js`)
- Textos do catálogo entram na página sempre como texto (nunca como HTML), para evitar injeção de código
- Arquivos externos carregados com verificação de integridade (o navegador recusa arquivos alterados)
- Publicado automaticamente no GitHub Pages a cada mudança (`.github/workflows/publicar-site.yml`)

## Rodar no computador

Abra `portfolio/index.html` no navegador. Não precisa de servidor nem de instalar nada.
