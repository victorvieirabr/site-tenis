// Catálogo da loja de DEMONSTRAÇÃO (portfólio): marcas, produtos e preços são fictícios.
// Depois de "window.CATALOGO =" o conteúdo precisa ser JSON puro (sem comentários nem vírgula sobrando).
window.CATALOGO = {
  "loja": {
    "nome": "Site Tenis",
    "contato": {
      "whatsapp": "5500000000000",
      "instagram": ""
    },
    "pagamento": {
      "pix": { "chave": "", "nome": "", "cidade": "" }
    },
    "entrega": {
      "regioes": []
    },
    "encomenda": {
      "prazo": "20 a 30 dias"
    }
  },
  "categorias": [
    {
      "id": "tenis",
      "nome": "Tênis",
      "subcategorias": [
        { "id": "futsal", "nome": "Futsal" },
        { "id": "suico", "nome": "Suíço" },
        { "id": "campo", "nome": "Campo" }
      ],
      "tamanhos": ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
      "camposExtras": {
        "modelo": { "rotulo": "Modelo", "obrigatorio": true }
      }
    },
    {
      "id": "camisas",
      "nome": "Camisas",
      "subcategorias": [
        { "id": "times", "nome": "Times" },
        { "id": "selecoes", "nome": "Seleções" }
      ],
      "tamanhos": ["PP", "P", "M", "G", "GG", "XG"],
      "camposExtras": {
        "time": { "rotulo": "Time / Seleção", "obrigatorio": true },
        "temporada": { "rotulo": "Temporada", "obrigatorio": true },
        "versao": { "rotulo": "Versão", "obrigatorio": true, "opcoes": ["Torcedor", "Jogador", "Retrô"] },
        "uniforme": { "rotulo": "Uniforme", "obrigatorio": false, "opcoes": ["Titular", "Reserva", "Terceiro", "Goleiro", "Treino"] }
      }
    }
  ],
  "produtos": [
    {
      "id": "quadra-pro-veloz-futsal-branco",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Quadra Pro Veloz",
      "marca": "Quadra Pro",
      "cor": "Branco",
      "preco": 499.00,
      "precoPromocional": 429.90,
      "tamanhos": [
        { "tamanho": "36", "estoque": 0 },
        { "tamanho": "37", "estoque": 0 },
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 1 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 },
        { "tamanho": "45", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-veloz-futsal-branco-1.jpg",
        "img/produtos/quadra-pro-veloz-futsal-branco-2.jpg",
        "img/produtos/quadra-pro-veloz-futsal-branco-3.jpg"
      ],
      "descricao": "A Quadra Pro Veloz é uma chuteira de futsal leve, pensada para quem gosta de jogo rápido e drible curto. Nesta versão branca com detalhes em coral, o cabedal macio se ajusta ao pé e a sola lisa de borracha segura bem na quadra.\n\nDestaques\n• Cabedal macio, com biqueira reforçada\n• Entressola que amortece as arrancadas\n• Sola lisa de borracha, com ponto de giro\n• Calcanhar firme para mais estabilidade\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Veloz" },
      "destaque": true,
      "fixarNoTopo": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-24"
    },
    {
      "id": "quadra-pro-veloz-futsal-azul",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Quadra Pro Veloz",
      "marca": "Quadra Pro",
      "cor": "Azul-claro",
      "preco": 499.00,
      "precoPromocional": 429.90,
      "tamanhos": [
        { "tamanho": "36", "estoque": 0 },
        { "tamanho": "37", "estoque": 0 },
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 0 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 },
        { "tamanho": "45", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-veloz-futsal-azul-1.jpg",
        "img/produtos/quadra-pro-veloz-futsal-azul-2.jpg",
        "img/produtos/quadra-pro-veloz-futsal-azul-3.jpg"
      ],
      "descricao": "A Quadra Pro Veloz azul-claro, com calcanhar preto e entressola coral, é a mesma chuteira leve e rápida da versão branca, para quem gosta de chamar atenção na quadra.\n\nDestaques\n• Cabedal macio, com biqueira reforçada\n• Entressola que amortece as arrancadas\n• Sola lisa de borracha, com ponto de giro\n• Calcanhar firme para mais estabilidade\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Veloz" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-24"
    },
    {
      "id": "ginga-pivo-futsal-branco",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Ginga Pivô",
      "marca": "Ginga",
      "cor": "Branco e verde",
      "preco": 419.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 0 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 },
        { "tamanho": "45", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/ginga-pivo-futsal-branco-1.jpg",
        "img/produtos/ginga-pivo-futsal-branco-2.jpg",
        "img/produtos/ginga-pivo-futsal-branco-3.jpg"
      ],
      "descricao": "A Ginga Pivô foi pensada para quem joga de costas para o gol: segura a marcação, gira e finaliza. Base branca, entressola verde, calcanhar azul e cadarço amarelo.\n\nDestaques\n• Cabedal resistente, com biqueira reforçada\n• Entressola firme para os giros\n• Sola de borracha com ponto de giro na frente\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Pivô" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-24"
    },
    {
      "id": "ginga-pivo-futsal-preto",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Ginga Pivô",
      "marca": "Ginga",
      "cor": "Preto",
      "preco": 389.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 2 },
        { "tamanho": "40", "estoque": 3 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 1 },
        { "tamanho": "43", "estoque": 2 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/ginga-pivo-futsal-preto-1.jpg",
        "img/produtos/ginga-pivo-futsal-preto-2.jpg",
        "img/produtos/ginga-pivo-futsal-preto-3.jpg"
      ],
      "descricao": "A Ginga Pivô preta, com entressola e calcanhar amarelos, é a versão a pronta entrega do modelo: os mesmos recursos para quem segura a bola, gira e finaliza.\n\nDestaques\n• Cabedal resistente, com biqueira reforçada\n• Entressola firme para os giros\n• Sola de borracha com ponto de giro na frente\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Pivô" },
      "destaque": true,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-24"
    },
    {
      "id": "quadra-pro-veloz-futsal-preto",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Quadra Pro Veloz",
      "marca": "Quadra Pro",
      "cor": "Preto",
      "preco": 499.00,
      "precoPromocional": 429.90,
      "tamanhos": [
        { "tamanho": "36", "estoque": 0 },
        { "tamanho": "37", "estoque": 0 },
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 2 },
        { "tamanho": "40", "estoque": 1 },
        { "tamanho": "41", "estoque": 3 },
        { "tamanho": "42", "estoque": 1 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 },
        { "tamanho": "45", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-veloz-futsal-preto-1.jpg",
        "img/produtos/quadra-pro-veloz-futsal-preto-2.jpg",
        "img/produtos/quadra-pro-veloz-futsal-preto-3.jpg"
      ],
      "descricao": "A Quadra Pro Veloz preta, com calcanhar e gola em coral e entressola branca, é a mesma chuteira leve e rápida das outras cores, num visual discreto que combina com qualquer uniforme.\n\nDestaques\n• Cabedal macio, com biqueira reforçada\n• Entressola que amortece as arrancadas\n• Sola lisa de borracha, com ponto de giro\n• Calcanhar firme para mais estabilidade\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Veloz" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "quadra-pro-veloz-futsal-verde-limao",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Quadra Pro Veloz",
      "marca": "Quadra Pro",
      "cor": "Verde-limão",
      "preco": 469.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "37", "estoque": 0 },
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 0 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-veloz-futsal-verde-limao-1.jpg",
        "img/produtos/quadra-pro-veloz-futsal-verde-limao-2.jpg",
        "img/produtos/quadra-pro-veloz-futsal-verde-limao-3.jpg"
      ],
      "descricao": "A Quadra Pro Veloz verde-limão, com calcanhar, entressola e cadarço pretos, é para quem quer ser visto de longe na quadra. Por dentro, é a mesma chuteira leve e rápida das outras cores.\n\nDestaques\n• Cabedal macio, com biqueira reforçada\n• Entressola que amortece as arrancadas\n• Sola lisa de borracha, com ponto de giro\n• Calcanhar firme para mais estabilidade\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Veloz" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "ginga-pivo-futsal-vermelho",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Ginga Pivô",
      "marca": "Ginga",
      "cor": "Vermelho e preto",
      "preco": 419.90,
      "precoPromocional": 379.90,
      "tamanhos": [
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 1 },
        { "tamanho": "41", "estoque": 1 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/ginga-pivo-futsal-vermelho-1.jpg",
        "img/produtos/ginga-pivo-futsal-vermelho-2.jpg",
        "img/produtos/ginga-pivo-futsal-vermelho-3.jpg"
      ],
      "descricao": "A Ginga Pivô vermelha, com calcanhar e gola pretos e entressola branca, traz os mesmos recursos do modelo para quem segura a marcação, gira e finaliza, com um visual que não passa despercebido.\n\nDestaques\n• Cabedal resistente, com biqueira reforçada\n• Entressola firme para os giros\n• Sola de borracha com ponto de giro na frente\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Pivô" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "ginga-pivo-futsal-azul-marinho",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Ginga Pivô",
      "marca": "Ginga",
      "cor": "Azul-marinho",
      "preco": 419.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 1 },
        { "tamanho": "40", "estoque": 2 },
        { "tamanho": "41", "estoque": 2 },
        { "tamanho": "42", "estoque": 1 },
        { "tamanho": "43", "estoque": 1 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/ginga-pivo-futsal-azul-marinho-1.jpg",
        "img/produtos/ginga-pivo-futsal-azul-marinho-2.jpg",
        "img/produtos/ginga-pivo-futsal-azul-marinho-3.jpg"
      ],
      "descricao": "A Ginga Pivô azul-marinho, com calcanhar e logo em laranja e entressola branca, é a versão mais sóbria do modelo, para quem joga de costas para o gol e decide no giro.\n\nDestaques\n• Cabedal resistente, com biqueira reforçada\n• Entressola firme para os giros\n• Sola de borracha com ponto de giro na frente\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Pivô" },
      "destaque": true,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "quadra-pro-giro-futsal-cinza",
      "categoria": "tenis",
      "subcategoria": "futsal",
      "nome": "Quadra Pro Giro",
      "marca": "Quadra Pro",
      "cor": "Cinza e laranja",
      "preco": 359.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "38", "estoque": 1 },
        { "tamanho": "39", "estoque": 2 },
        { "tamanho": "40", "estoque": 2 },
        { "tamanho": "41", "estoque": 1 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 1 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-giro-futsal-cinza-1.jpg",
        "img/produtos/quadra-pro-giro-futsal-cinza-2.jpg",
        "img/produtos/quadra-pro-giro-futsal-cinza-3.jpg"
      ],
      "descricao": "A Quadra Pro Giro é uma chuteira de futsal para quem gosta de jogo cadenciado: domina, protege e gira. Cinza, com calcanhar, cadarço e logo em laranja.\n\nDestaques\n• Cabedal firme, com biqueira reforçada para o toque\n• Entressola branca que amortece a pisada\n• Sola lisa de borracha clara, que não risca a quadra\n• Calcanhar firme para mais estabilidade\n\nOnde usar: futsal em quadra coberta, com piso de madeira ou sintético.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Giro" },
      "destaque": false,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "ginga-toque-suico-branco",
      "categoria": "tenis",
      "subcategoria": "suico",
      "nome": "Ginga Toque",
      "marca": "Ginga",
      "cor": "Branco e azul",
      "preco": 389.90,
      "precoPromocional": 349.90,
      "tamanhos": [
        { "tamanho": "37", "estoque": 0 },
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 1 },
        { "tamanho": "40", "estoque": 1 },
        { "tamanho": "41", "estoque": 2 },
        { "tamanho": "42", "estoque": 1 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/ginga-toque-suico-branco-1.jpg",
        "img/produtos/ginga-toque-suico-branco-2.jpg",
        "img/produtos/ginga-toque-suico-branco-3.jpg"
      ],
      "descricao": "A Ginga Toque é uma chuteira suíço/society para quem gosta de tocar a bola de primeira e chegar na área. Branca, com calcanhar, cadarço e sola em azul.\n\nDestaques\n• Cabedal macio, para sentir bem a bola\n• Travinhas baixas de borracha, que seguram na grama sintética\n• Entressola leve para as arrancadas curtas\n• Calcanhar firme para mais estabilidade\n\nOnde usar: suíço/society em grama sintética.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Toque" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "ginga-toque-suico-preto",
      "categoria": "tenis",
      "subcategoria": "suico",
      "nome": "Ginga Toque",
      "marca": "Ginga",
      "cor": "Preto e verde-limão",
      "preco": 389.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 0 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/ginga-toque-suico-preto-1.jpg",
        "img/produtos/ginga-toque-suico-preto-2.jpg",
        "img/produtos/ginga-toque-suico-preto-3.jpg"
      ],
      "descricao": "A Ginga Toque preta, com entressola, cadarço e calcanhar em verde-limão, é a mesma chuteira suíço/society de toque rápido da versão branca, com um visual que aparece de longe no campo.\n\nDestaques\n• Cabedal macio, para sentir bem a bola\n• Travinhas baixas de borracha, que seguram na grama sintética\n• Entressola leve para as arrancadas curtas\n• Calcanhar firme para mais estabilidade\n\nOnde usar: suíço/society em grama sintética.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Toque" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "quadra-pro-arranque-suico-laranja",
      "categoria": "tenis",
      "subcategoria": "suico",
      "nome": "Quadra Pro Arranque",
      "marca": "Quadra Pro",
      "cor": "Laranja",
      "preco": 329.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "38", "estoque": 1 },
        { "tamanho": "39", "estoque": 2 },
        { "tamanho": "40", "estoque": 3 },
        { "tamanho": "41", "estoque": 2 },
        { "tamanho": "42", "estoque": 1 },
        { "tamanho": "43", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-arranque-suico-laranja-1.jpg",
        "img/produtos/quadra-pro-arranque-suico-laranja-2.jpg",
        "img/produtos/quadra-pro-arranque-suico-laranja-3.jpg"
      ],
      "descricao": "A Quadra Pro Arranque é uma chuteira suíço/society feita para quem joga pelos lados e vive de velocidade. Laranja, com calcanhar e sola pretos e entressola branca.\n\nDestaques\n• Cabedal leve, com biqueira reforçada\n• Travinhas baixas e numerosas, para frear e sair rápido\n• Entressola que amortece as arrancadas\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: suíço/society em grama sintética.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Arranque" },
      "destaque": true,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "quadra-pro-arranque-suico-azul-marinho",
      "categoria": "tenis",
      "subcategoria": "suico",
      "nome": "Quadra Pro Arranque",
      "marca": "Quadra Pro",
      "cor": "Azul-marinho",
      "preco": 329.90,
      "precoPromocional": 299.90,
      "tamanhos": [
        { "tamanho": "39", "estoque": 1 },
        { "tamanho": "40", "estoque": 1 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 2 },
        { "tamanho": "43", "estoque": 1 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-arranque-suico-azul-marinho-1.jpg",
        "img/produtos/quadra-pro-arranque-suico-azul-marinho-2.jpg",
        "img/produtos/quadra-pro-arranque-suico-azul-marinho-3.jpg"
      ],
      "descricao": "A Quadra Pro Arranque azul-marinho, com calcanhar, gola e travinhas em coral, é a mesma chuteira suíço/society veloz da versão laranja, num tom mais sóbrio.\n\nDestaques\n• Cabedal leve, com biqueira reforçada\n• Travinhas baixas e numerosas, para frear e sair rápido\n• Entressola que amortece as arrancadas\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: suíço/society em grama sintética.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Arranque" },
      "destaque": true,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "quadra-pro-artilheiro-campo-vermelho",
      "categoria": "tenis",
      "subcategoria": "campo",
      "nome": "Quadra Pro Artilheiro",
      "marca": "Quadra Pro",
      "cor": "Vermelho",
      "preco": 549.90,
      "precoPromocional": 489.90,
      "tamanhos": [
        { "tamanho": "38", "estoque": 0 },
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 1 },
        { "tamanho": "41", "estoque": 1 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-artilheiro-campo-vermelho-1.jpg",
        "img/produtos/quadra-pro-artilheiro-campo-vermelho-2.jpg",
        "img/produtos/quadra-pro-artilheiro-campo-vermelho-3.jpg"
      ],
      "descricao": "A Quadra Pro Artilheiro é uma chuteira de campo para quem vive dentro da área: firmeza no apoio e chute forte. Vermelha, com calcanhar e sola brancos e travas vermelhas.\n\nDestaques\n• Cabedal resistente, com biqueira reforçada para o chute\n• Travas altas, que firmam o pé na grama natural\n• Sola firme, que ajuda na hora de finalizar\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: futebol de campo em grama natural.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Artilheiro" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "quadra-pro-artilheiro-campo-preto",
      "categoria": "tenis",
      "subcategoria": "campo",
      "nome": "Quadra Pro Artilheiro",
      "marca": "Quadra Pro",
      "cor": "Preto e dourado",
      "preco": 549.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "39", "estoque": 0 },
        { "tamanho": "40", "estoque": 0 },
        { "tamanho": "41", "estoque": 0 },
        { "tamanho": "42", "estoque": 0 },
        { "tamanho": "43", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/quadra-pro-artilheiro-campo-preto-1.jpg",
        "img/produtos/quadra-pro-artilheiro-campo-preto-2.jpg",
        "img/produtos/quadra-pro-artilheiro-campo-preto-3.jpg"
      ],
      "descricao": "A Quadra Pro Artilheiro preta, com travas, cadarço e detalhes em dourado, é a mesma chuteira de campo da versão vermelha, com um visual mais clássico.\n\nDestaques\n• Cabedal resistente, com biqueira reforçada para o chute\n• Travas altas, que firmam o pé na grama natural\n• Sola firme, que ajuda na hora de finalizar\n• Calcanhar estruturado para segurar o pé\n\nOnde usar: futebol de campo em grama natural.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Artilheiro" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "ginga-raiz-campo-branco",
      "categoria": "tenis",
      "subcategoria": "campo",
      "nome": "Ginga Raiz",
      "marca": "Ginga",
      "cor": "Branco e preto",
      "preco": 299.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "37", "estoque": 1 },
        { "tamanho": "38", "estoque": 2 },
        { "tamanho": "39", "estoque": 2 },
        { "tamanho": "40", "estoque": 3 },
        { "tamanho": "41", "estoque": 2 },
        { "tamanho": "42", "estoque": 1 },
        { "tamanho": "43", "estoque": 1 },
        { "tamanho": "44", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/ginga-raiz-campo-branco-1.jpg",
        "img/produtos/ginga-raiz-campo-branco-2.jpg",
        "img/produtos/ginga-raiz-campo-branco-3.jpg"
      ],
      "descricao": "A Ginga Raiz é uma chuteira de campo de visual clássico: branca, com calcanhar, sola e travas pretos. Simples e resistente, para quem joga todo fim de semana.\n\nDestaques\n• Cabedal resistente e fácil de limpar\n• Travas altas, que firmam o pé na grama natural\n• Biqueira reforçada para o chute\n• Calcanhar firme para mais estabilidade\n\nOnde usar: futebol de campo em grama natural.\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "modelo": "Raiz" },
      "destaque": true,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "camisa-ginga-fc-2026-titular-torcedor",
      "categoria": "camisas",
      "subcategoria": "times",
      "nome": "Camisa Ginga FC Titular 2026",
      "marca": "Ginga",
      "cor": "Verde e amarelo",
      "preco": 249.90,
      "precoPromocional": 219.90,
      "tamanhos": [
        { "tamanho": "P", "estoque": 2 },
        { "tamanho": "M", "estoque": 3 },
        { "tamanho": "G", "estoque": 4 },
        { "tamanho": "GG", "estoque": 2 },
        { "tamanho": "XG", "estoque": 1 }
      ],
      "imagens": [
        "img/produtos/camisa-ginga-fc-2026-titular-torcedor-1.jpg",
        "img/produtos/camisa-ginga-fc-2026-titular-torcedor-2.jpg",
        "img/produtos/camisa-ginga-fc-2026-titular-torcedor-3.jpg"
      ],
      "descricao": "A camisa titular do Ginga FC para 2026 é verde com listras finas em amarelo, gola redonda e punhos amarelos. O tecido leve ajuda a secar o suor, para jogar ou torcer com conforto.\n\nDestaques\n• Tecido leve, que seca rápido\n• Gola redonda e punhos em amarelo\n• Escudo no peito e número 10 nas costas\n• Versão torcedor, com corte mais solto no corpo\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "time": "Ginga FC", "temporada": "2026", "versao": "Torcedor", "uniforme": "Titular" },
      "destaque": true,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "camisa-ginga-fc-2026-reserva-torcedor",
      "categoria": "camisas",
      "subcategoria": "times",
      "nome": "Camisa Ginga FC Reserva 2026",
      "marca": "Ginga",
      "cor": "Branco e verde",
      "preco": 249.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "P", "estoque": 1 },
        { "tamanho": "M", "estoque": 2 },
        { "tamanho": "G", "estoque": 2 },
        { "tamanho": "GG", "estoque": 0 },
        { "tamanho": "XG", "estoque": 1 }
      ],
      "imagens": [
        "img/produtos/camisa-ginga-fc-2026-reserva-torcedor-1.jpg",
        "img/produtos/camisa-ginga-fc-2026-reserva-torcedor-2.jpg",
        "img/produtos/camisa-ginga-fc-2026-reserva-torcedor-3.jpg"
      ],
      "descricao": "A camisa reserva do Ginga FC para 2026 é branca, com uma faixa verde que atravessa o peito do ombro até a cintura. Gola e punhos em verde completam o visual.\n\nDestaques\n• Tecido leve, que seca rápido\n• Faixa transversal em verde, na frente e nas costas\n• Escudo no peito e número 10 nas costas\n• Versão torcedor, com corte mais solto no corpo\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "time": "Ginga FC", "temporada": "2026", "versao": "Torcedor", "uniforme": "Reserva" },
      "destaque": false,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "camisa-ginga-fc-2026-goleiro-jogador",
      "categoria": "camisas",
      "subcategoria": "times",
      "nome": "Camisa Ginga FC Goleiro 2026",
      "marca": "Ginga",
      "cor": "Laranja",
      "preco": 299.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "P", "estoque": 0 },
        { "tamanho": "M", "estoque": 1 },
        { "tamanho": "G", "estoque": 1 },
        { "tamanho": "GG", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/camisa-ginga-fc-2026-goleiro-jogador-1.jpg",
        "img/produtos/camisa-ginga-fc-2026-goleiro-jogador-2.jpg",
        "img/produtos/camisa-ginga-fc-2026-goleiro-jogador-3.jpg"
      ],
      "descricao": "A camisa de goleiro do Ginga FC para 2026 é laranja, com gola e punhos pretos e o número 1 nas costas. Na versão jogador, tem corte mais justo e tecido leve, como a usada em campo.\n\nDestaques\n• Tecido leve, que seca rápido\n• Cor forte, para o goleiro aparecer bem\n• Escudo no peito e número 1 nas costas\n• Versão jogador, com corte mais justo no corpo\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "time": "Ginga FC", "temporada": "2026", "versao": "Jogador", "uniforme": "Goleiro" },
      "destaque": false,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "camisa-ginga-fc-1986-titular-retro",
      "categoria": "camisas",
      "subcategoria": "times",
      "nome": "Camisa Ginga FC Retrô 1986",
      "marca": "Ginga",
      "cor": "Verde e branco",
      "preco": 279.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "M", "estoque": 0 },
        { "tamanho": "G", "estoque": 0 },
        { "tamanho": "GG", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/camisa-ginga-fc-1986-titular-retro-1.jpg",
        "img/produtos/camisa-ginga-fc-1986-titular-retro-2.jpg",
        "img/produtos/camisa-ginga-fc-1986-titular-retro-3.jpg"
      ],
      "descricao": "A camisa retrô do Ginga FC relembra o uniforme de 1986: verde lisa, com gola e punhos em branco e escudo amarelo no peito. Para quem gosta de história e de um visual clássico.\n\nDestaques\n• Reedição do modelo de 1986\n• Verde lisa, com gola e punhos brancos\n• Escudo no peito e número 10 nas costas\n• Corte confortável, para o dia a dia\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "time": "Ginga FC", "temporada": "1986", "versao": "Retrô", "uniforme": "Titular" },
      "destaque": false,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "camisa-varzea-ac-2026-titular-jogador",
      "categoria": "camisas",
      "subcategoria": "times",
      "nome": "Camisa Várzea AC Titular 2026",
      "marca": "Quadra Pro",
      "cor": "Vermelho e preto",
      "preco": 289.90,
      "precoPromocional": 259.90,
      "tamanhos": [
        { "tamanho": "P", "estoque": 0 },
        { "tamanho": "M", "estoque": 2 },
        { "tamanho": "G", "estoque": 3 },
        { "tamanho": "GG", "estoque": 1 },
        { "tamanho": "XG", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/camisa-varzea-ac-2026-titular-jogador-1.jpg",
        "img/produtos/camisa-varzea-ac-2026-titular-jogador-2.jpg",
        "img/produtos/camisa-varzea-ac-2026-titular-jogador-3.jpg"
      ],
      "descricao": "A camisa titular do Várzea AC para 2026 tem as listras grossas em vermelho e preto que são a cara do time. Na versão jogador, o corte é mais justo e o tecido mais leve, como a usada em campo.\n\nDestaques\n• Listras verticais em vermelho e preto\n• Tecido leve, que seca rápido\n• Escudo no peito e número 10 nas costas\n• Versão jogador, com corte mais justo no corpo\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "time": "Várzea AC", "temporada": "2026", "versao": "Jogador", "uniforme": "Titular" },
      "destaque": true,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "camisa-varzea-ac-2026-reserva-torcedor",
      "categoria": "camisas",
      "subcategoria": "times",
      "nome": "Camisa Várzea AC Reserva 2026",
      "marca": "Quadra Pro",
      "cor": "Branco e preto",
      "preco": 229.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "P", "estoque": 2 },
        { "tamanho": "M", "estoque": 2 },
        { "tamanho": "G", "estoque": 2 },
        { "tamanho": "GG", "estoque": 1 }
      ],
      "imagens": [
        "img/produtos/camisa-varzea-ac-2026-reserva-torcedor-1.jpg",
        "img/produtos/camisa-varzea-ac-2026-reserva-torcedor-2.jpg",
        "img/produtos/camisa-varzea-ac-2026-reserva-torcedor-3.jpg"
      ],
      "descricao": "A camisa reserva do Várzea AC para 2026 é metade branca e metade preta, com gola e punhos vermelhos. Na versão torcedor, tem corte mais solto, para o estádio e o dia a dia.\n\nDestaques\n• Frente metade branca, metade preta\n• Gola e punhos em vermelho\n• Escudo no peito e número 10 nas costas\n• Versão torcedor, com corte mais solto no corpo\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "time": "Várzea AC", "temporada": "2026", "versao": "Torcedor", "uniforme": "Reserva" },
      "destaque": false,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    },
    {
      "id": "camisa-tabela-ec-2026-titular-torcedor",
      "categoria": "camisas",
      "subcategoria": "times",
      "nome": "Camisa Tabela EC Titular 2026",
      "marca": "Quadra Pro",
      "cor": "Azul-celeste e branco",
      "preco": 229.90,
      "precoPromocional": null,
      "tamanhos": [
        { "tamanho": "P", "estoque": 1 },
        { "tamanho": "M", "estoque": 3 },
        { "tamanho": "G", "estoque": 2 },
        { "tamanho": "GG", "estoque": 2 },
        { "tamanho": "XG", "estoque": 0 }
      ],
      "imagens": [
        "img/produtos/camisa-tabela-ec-2026-titular-torcedor-1.jpg",
        "img/produtos/camisa-tabela-ec-2026-titular-torcedor-2.jpg",
        "img/produtos/camisa-tabela-ec-2026-titular-torcedor-3.jpg"
      ],
      "descricao": "A camisa titular do Tabela EC para 2026 tem faixas horizontais em azul-celeste e branco, com gola e punhos em azul-marinho. Leve e confortável, para jogar ou torcer.\n\nDestaques\n• Faixas horizontais em azul-celeste e branco\n• Gola e punhos em azul-marinho\n• Escudo no peito e número 10 nas costas\n• Versão torcedor, com corte mais solto no corpo\n\nProduto fictício, criado para esta demonstração.",
      "extras": { "time": "Tabela EC", "temporada": "2026", "versao": "Torcedor", "uniforme": "Titular" },
      "destaque": false,
      "encomenda": true,
      "ativo": true,
      "criadoEm": "2026-10-25"
    }
  ]
};
