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
      "prazo": "15 a 20 dias"
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
      "destaque": false,
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
      "destaque": false,
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
      "destaque": false,
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
      "destaque": false,
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
      "destaque": false,
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
      "destaque": false,
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
      "destaque": false,
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
      "destaque": false,
      "encomenda": false,
      "ativo": true,
      "criadoEm": "2026-10-25"
    }
  ]
};
