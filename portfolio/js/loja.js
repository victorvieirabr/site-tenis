/*
  Monta as páginas da loja a partir de window.CATALOGO (arquivo dados/catalogo.js).

  Nenhum produto, preço ou categoria fica escrito no HTML: tudo vem do catálogo.
  Cada página diz quem ela é em <body data-pagina="inicio | categoria | produto">.
  Textos do catálogo entram sempre com textContent (nunca innerHTML).
*/
(function () {
  'use strict';

  var SEM_FOTO = 'img/sem-foto.svg';
  var MAX_NOVIDADES = 8;
  var MAX_VEJA_TAMBEM = 8;
  var MAX_BOLINHAS = 6; // bolinhas de cor num cartão da vitrine; as outras viram "+N"
  var CONVITE_DEPOIS_MS = 4000; // espera até o balão do WhatsApp aparecer
  var CONVITE_DURACAO_MS = 3000; // quanto tempo o balão fica na tela antes de sumir sozinho
  var CHAVE_CARRINHO = 'carrinho'; // onde o carrinho fica guardado no navegador do visitante

  // O que aparece de leve ao rolar a página (ver revelarAoRolar).
  var ALVOS_REVELAR = [
    '.heroi-texto > *', '.heroi-palco', '.faixa-produtos',
    '.secao-titulo', '.pagina-titulo', '.atalho-grupo', '.cartao', '.aviso',
    '.galeria', '.produto-info', '.descricao'
  ].join(', ');
  var observadorRevelar = null;

  // Tom de cada nome de cor (sem acento), para pintar as bolinhas da vitrine.
  // Nome com duas ou três cores ("Branco e verde", "Preto/Dourado") vira bolinha dividida.
  // Nome que não está aqui ("Cinza-gelo" vira "cinza"; desconhecido de todo) usa a foto do tênis na bolinha.
  var TONS = {
    'branco': '#ffffff', 'off-white': '#f4efe4', 'gelo': '#eef1f4', 'creme': '#f3e9d2',
    'bege': '#d8c3a0', 'areia': '#d9c7a7', 'nude': '#e3c3a8', 'caqui': '#b8a97a',
    'preto': '#1d1f22', 'cinza': '#8b9097', 'cinza-claro': '#c7cbd1', 'cinza-escuro': '#4b5057',
    'grafite': '#3f4349', 'chumbo': '#555a61', 'prata': '#c0c5cb', 'prateado': '#c0c5cb',
    'dourado': '#d4a62a', 'ouro': '#d4a62a', 'bronze': '#a97142', 'cobre': '#b8733d',
    'azul': '#1f5fd1', 'azul-claro': '#9cc6ea', 'azul-bebe': '#a9d1f0', 'celeste': '#8cc8ee',
    'azul-celeste': '#8cc8ee', 'azul-marinho': '#1d2b4f', 'marinho': '#1d2b4f', 'azul-royal': '#2448c4',
    'royal': '#2448c4', 'azul-escuro': '#1e3a8a', 'azul-petroleo': '#1f4e5f', 'petroleo': '#1f4e5f',
    'turquesa': '#2ec4b6', 'azul-turquesa': '#2ec4b6', 'ciano': '#22b8cf',
    'verde': '#1f9d55', 'verde-claro': '#7ed69a', 'verde-escuro': '#1e5631', 'verde-musgo': '#5b6b2f',
    'musgo': '#5b6b2f', 'verde-militar': '#4b5320', 'oliva': '#708238', 'verde-oliva': '#708238',
    'verde-agua': '#8fdcc2', 'menta': '#98e2c6', 'verde-limao': '#b6e51d', 'limao': '#b6e51d',
    'verde-fluor': '#9cff2e', 'verde-neon': '#9cff2e',
    'amarelo': '#f5c518', 'amarelo-fluor': '#e8ff3a', 'amarelo-neon': '#e8ff3a', 'mostarda': '#d4a017',
    'laranja': '#f57c1f', 'laranja-fluor': '#ff6a1a', 'laranja-neon': '#ff6a1a', 'coral': '#ff6f5e',
    'salmao': '#fa8a72', 'pessego': '#f7b58a', 'terracota': '#c0603b',
    'vermelho': '#d62828', 'vinho': '#7b1e2b', 'bordo': '#7b1e2b', 'grena': '#6d1a2a',
    'rosa': '#f48fb1', 'rosa-claro': '#f8c8d8', 'rosa-bebe': '#f8c8d8', 'rosa-choque': '#e6398a',
    'pink': '#e6398a', 'rosa-fluor': '#ff4fa3', 'magenta': '#c2185b', 'fucsia': '#d63384',
    'roxo': '#7b3fb3', 'lilas': '#b39ddb', 'violeta': '#8e44ad', 'lavanda': '#c5b3e6', 'uva': '#5b2a6e',
    'marrom': '#7a4a2a', 'caramelo': '#b5713a', 'chocolate': '#4e2e1e', 'cafe': '#5a3a26', 'castanho': '#6b4226'
  };
  var COLORIDO = ['#d62828', '#f5c518', '#1f9d55', '#1f5fd1'];

  var CAT = window.CATALOGO;
  var loja = (CAT && CAT.loja) || {};
  var contato = loja.contato || {};
  var nomeLoja = texto(loja.nome) || 'Loja';
  var categorias = lista(CAT && CAT.categorias);
  var produtos = produtosVisiveis();

  var topo = document.getElementById('topo');
  var conteudo = document.getElementById('conteudo');
  var rodape = document.getElementById('rodape');
  var pagina = document.body.getAttribute('data-pagina');

  var formatador = null;
  try {
    formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (e) {
    formatador = null;
  }

  iniciar();
  marcarAmbiente();

  /* ================= início ================= */

  function iniciar() {
    var categoriaAtual = '';
    var produtoAtual = null;
    if (pagina === 'categoria') categoriaAtual = parametro('c');
    if (pagina === 'produto') {
      produtoAtual = acharProduto(parametro('id'));
      if (produtoAtual) categoriaAtual = produtoAtual.categoria;
    }

    montarTopo(categoriaAtual);
    montarRodape();
    montarWhatsFlutuante(produtoAtual);
    ligarEfeitos();
    if (pagina === 'texto') return; // páginas de texto (como a de privacidade) já vêm prontas no HTML
    limpar(conteudo);

    if (!CAT) {
      document.title = nomeLoja;
      conteudo.appendChild(caixaAviso(1, 'Loja em manutenção',
        'Não conseguimos carregar os produtos agora. Tente de novo em alguns minutos.'));
      if (window.console) {
        window.console.error('Loja: o arquivo dados/catalogo.js não carregou ou tem um erro de digitação.');
      }
      return;
    }

    if (pagina === 'categoria') paginaCategoria();
    else if (pagina === 'produto') paginaProduto(produtoAtual);
    else if (pagina === 'inicio') paginaInicio();
    // carrinho, finalizar, pedido, conta e dono são montadas por js/pedidos.js
    revelarAoRolar(conteudo);
  }

  /* ================= aparecer ao rolar ================= */

  // Partes da página (ALVOS_REVELAR, no começo do arquivo) que surgem de leve, subindo um pouco,
  // quando entram na tela, uma depois da outra. Sem JavaScript, ou com "reduzir movimento"
  // ligado no aparelho, tudo aparece normal, parado.
  function revelarAoRolar(raiz) {
    var alvos, i;
    if (!raiz || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!observadorRevelar) {
      observadorRevelar = new IntersectionObserver(function (entradas) {
        var n = 0;
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          surgir(e.target, Math.min(n, 8) * 70);
          n++;
        });
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    alvos = raiz.querySelectorAll(ALVOS_REVELAR);
    for (i = 0; i < alvos.length; i++) {
      if (alvos[i].classList.contains('surgir')) continue;
      alvos[i].classList.add('revelar');
      observadorRevelar.observe(alvos[i]);
    }
  }

  /* ================= efeitos: cabeçalho, toque nos botões, luz nos cartões ================= */

  // "Reduzir movimento" ligado no aparelho: nada se mexe sozinho.
  function podeAnimar() {
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function ligarEfeitos() {
    // Cabeçalho vira "vidro" (translúcido e desfocado) depois que a página rola um pouco.
    var rolado = false;
    var agendado = false;
    function olharRolagem() {
      var agora = (window.pageYOffset || document.documentElement.scrollTop) > 8;
      agendado = false;
      if (agora !== rolado) {
        rolado = agora;
        topo.classList.toggle('topo-rolado', agora);
      }
    }
    window.addEventListener('scroll', function () {
      if (!agendado) { agendado = true; window.requestAnimationFrame(olharRolagem); }
    }, { passive: true });
    olharRolagem();

    if (!podeAnimar()) return;

    // Toque ou clique num botão: uma onda sai do ponto tocado.
    document.addEventListener('pointerdown', function (e) {
      var alvo = e.target && e.target.closest ? e.target.closest('.botao, .tamanho, .aba, .chip, .botao-favorito, .faixa-item, .miniatura') : null;
      var r, tam, onda;
      if (!alvo || alvo.disabled) return;
      r = alvo.getBoundingClientRect();
      tam = Math.max(r.width, r.height) * 2.2;
      onda = el('span', { classe: 'onda', 'aria-hidden': 'true' });
      onda.style.width = tam + 'px';
      onda.style.height = tam + 'px';
      onda.style.left = (e.clientX - r.left - tam / 2) + 'px';
      onda.style.top = (e.clientY - r.top - tam / 2) + 'px';
      alvo.classList.add('com-onda');
      alvo.appendChild(onda);
      window.setTimeout(function () { if (onda.parentNode) onda.parentNode.removeChild(onda); }, 700);
    });

    // Cartões: uma luz suave acompanha o mouse (só com mouse; no celular não tem como).
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.addEventListener('pointermove', function (e) {
        var c = e.target && e.target.closest ? e.target.closest('.cartao') : null;
        var r;
        if (!c) return;
        r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
  }

  function surgir(alvo, atrasoMs) {
    observadorRevelar.unobserve(alvo);
    alvo.style.animationDelay = atrasoMs + 'ms';
    alvo.classList.remove('revelar');
    alvo.classList.add('surgir');
    // Terminou: volta ao normal (o cartão volta a subir de leve ao passar o mouse).
    alvo.addEventListener('animationend', function fim(ev) {
      if (ev.target !== alvo) return;
      alvo.removeEventListener('animationend', fim);
      alvo.classList.remove('surgir');
      alvo.style.animationDelay = '';
    });
  }

  /* ================= vendas pelo site: o que está ligado ================= */

  // Contas (login, favoritos) precisam do Firebase configurado em js/firebase-config.js.
  function contasAtivas() {
    var c = window.FIREBASE_CONFIG;
    return !!(c && c.apiKey && c.projectId);
  }

  function configPix() {
    var pagamento = loja.pagamento || {};
    return pagamento.pix || {};
  }

  function regioesEntrega() {
    return lista((loja.entrega || {}).regioes).filter(function (r) {
      return r && texto(r.id) && texto(r.nome) && typeof r.valor === 'number' && r.valor >= 0;
    });
  }

  // Carrinho e pedidos só aparecem com contas, chave Pix e tabela de frete preenchidas.
  function vendasAbertas() {
    return contasAtivas() && !!texto(configPix().chave) && regioesEntrega().length > 0;
  }

  function definirTitulo(t) {
    document.title = (window.AMBIENTE === 'teste' ? '[TESTE] ' : '') + t;
  }

  /* ================= carrinho (fica no navegador do visitante) ================= */

  function lerCarrinho() {
    var itens;
    try { itens = JSON.parse(window.localStorage.getItem(CHAVE_CARRINHO) || '[]'); } catch (e) { itens = []; }
    return lista(itens).filter(function (i) {
      return i && typeof i.id === 'string' && typeof i.tamanho === 'string' && Number(i.quantidade) > 0;
    }).map(function (i) {
      return { id: i.id, tamanho: i.tamanho, quantidade: Math.min(99, Math.floor(Number(i.quantidade))) };
    });
  }

  function salvarCarrinho(itens) {
    try { window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens)); } catch (e) { /* navegador sem armazenamento */ }
    atualizarContadorCarrinho();
  }

  function quantidadeNoCarrinho() {
    return lerCarrinho().reduce(function (soma, i) { return soma + i.quantidade; }, 0);
  }

  // Soma ao carrinho sem passar do estoque do tamanho. Devolve { ok, mensagem }.
  function adicionarAoCarrinho(id, tamanho, quantidade) {
    var p = acharProduto(id);
    var maximo = p ? estoqueDe(p, tamanho) : 0;
    var itens = lerCarrinho();
    var item = null;
    var i;
    if (!p || maximo === 0) return { ok: false, mensagem: 'Este tamanho está esgotado.' };
    for (i = 0; i < itens.length; i++) {
      if (itens[i].id === id && itens[i].tamanho === tamanho) item = itens[i];
    }
    if ((item ? item.quantidade : 0) + quantidade > maximo) {
      return { ok: false, mensagem: 'Você já tem no carrinho todas as unidades disponíveis desse tamanho (' + maximo + ').' };
    }
    if (item) item.quantidade += quantidade;
    else itens.push({ id: id, tamanho: tamanho, quantidade: quantidade });
    salvarCarrinho(itens);
    return { ok: true };
  }

  function atualizarContadorCarrinho() {
    var link = document.getElementById('topo-carrinho');
    var n, contador, rotulo;
    if (!link) return;
    n = quantidadeNoCarrinho();
    contador = link.querySelector('.contador');
    contador.textContent = n > 99 ? '99+' : String(n);
    contador.hidden = n === 0;
    rotulo = n ? 'Carrinho: ' + n + (n === 1 ? ' item' : ' itens') : 'Carrinho vazio';
    link.setAttribute('aria-label', rotulo);
    link.setAttribute('title', rotulo);
  }

  /* ================= ambiente de teste ================= */

  // js/ambiente.js diz em qual cópia do site estamos ('oficial' ou 'teste').
  // Na cópia de teste aparece uma faixa fixa no pé da tela e "[TESTE]" no título da aba,
  // para nunca confundir o teste com o site de verdade.
  function marcarAmbiente() {
    if (window.AMBIENTE === 'demonstracao') { marcarDemonstracao(); return; }
    if (window.AMBIENTE !== 'teste') return;
    document.body.classList.add('em-teste');
    document.body.appendChild(el('p', { classe: 'faixa-teste' }, [
      el('strong', { texto: 'AMBIENTE DE TESTE' }), ' · não é o site oficial'
    ]));
    if (document.title.indexOf('[TESTE]') !== 0) document.title = '[TESTE] ' + document.title;
  }

  // Cópia de demonstração (portfólio, pasta portfolio/): loja fictícia. Mostra uma faixa no pé da tela,
  // e os links do WhatsApp não abrem nada: mostram a mensagem que uma loja de verdade receberia.
  function marcarDemonstracao() {
    var caixa = null;
    var textoMsg = null;

    document.body.classList.add('em-demonstracao');
    document.body.appendChild(el('p', { classe: 'faixa-demonstracao' }, [
      el('strong', { texto: 'Projeto de portfólio' }), ' · loja fictícia, nada está à venda'
    ]));

    function mensagemDoLink(href) {
      var i = href.indexOf('?text=');
      if (i < 0) return '';
      try { return decodeURIComponent(href.slice(i + 6).split('&')[0]); } catch (e) { return ''; }
    }

    function mostrar(msg) {
      var padrao = 'Olá! Vim pelo site e tenho uma dúvida.';
      if (!caixa) {
        textoMsg = el('pre', { classe: 'demo-mensagem' });
        var fechar = el('button', { type: 'button', classe: 'botao', texto: 'Entendi' });
        caixa = el('dialog', { classe: 'demo-dialogo', 'aria-labelledby': 'demo-titulo' }, [
          el('h2', { id: 'demo-titulo', texto: 'Isto é uma demonstração' }),
          el('p', { texto: 'Em uma loja de verdade, este botão abriria o WhatsApp da loja com esta mensagem já escrita:' }),
          textoMsg,
          fechar
        ]);
        fechar.addEventListener('click', function () { caixa.close(); });
        document.body.appendChild(caixa);
      }
      textoMsg.textContent = msg || padrao;
      if (typeof caixa.showModal === 'function') caixa.showModal();
      else window.alert('Isto é uma demonstração.\n\n' + (msg || padrao));
    }

    // Os botões da página tratam o clique primeiro (ex.: pedir o tamanho); se eles barrarem, não mostra nada.
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('a[href^="https://wa.me/"]') : null;
      if (!a || ev.defaultPrevented) return;
      ev.preventDefault();
      mostrar(mensagemDoLink(a.getAttribute('href')));
    });
  }

  /* ================= utilidades ================= */

  function texto(v) {
    return (v === null || v === undefined) ? '' : String(v).trim();
  }

  function lista(v) {
    return (v && typeof v !== 'string' && typeof v.length === 'number') ? v : [];
  }

  // Cria um elemento. props: { texto, classe, ...atributos }. filhos: elementos ou textos.
  function el(tag, props, filhos) {
    var n = document.createElement(tag);
    var k, v, i, f;
    if (props) {
      for (k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        v = props[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'texto') n.textContent = String(v);
        else if (k === 'classe') n.className = v;
        else n.setAttribute(k, v === true ? '' : String(v));
      }
    }
    if (filhos) {
      for (i = 0; i < filhos.length; i++) {
        f = filhos[i];
        if (f === null || f === undefined || f === false) continue;
        n.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
      }
    }
    return n;
  }

  function limpar(n) {
    while (n.firstChild) n.removeChild(n.firstChild);
  }

  function decodificar(s) {
    try {
      return decodeURIComponent(s.replace(/\+/g, ' '));
    } catch (e) {
      return s;
    }
  }

  function parametro(nome) {
    var pares = String(window.location.search || '').replace(/^\?/, '').split('&');
    var i, par;
    for (i = 0; i < pares.length; i++) {
      if (!pares[i]) continue;
      par = pares[i].split('=');
      if (decodificar(par[0]) === nome) return texto(decodificar(par.slice(1).join('=')));
    }
    return '';
  }

  function linkCategoria(cid, sid) {
    return 'categoria.html?c=' + encodeURIComponent(cid) + (sid ? '&s=' + encodeURIComponent(sid) : '');
  }

  function linkProduto(id) {
    return 'produto.html?id=' + encodeURIComponent(id);
  }

  function dinheiro(v) {
    var n = Number(v);
    if (formatador) return formatador.format(n);
    var partes = n.toFixed(2).split('.');
    return 'R$ ' + partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + partes[1];
  }

  function juntarNomes(itens) {
    var nomes = [];
    var i;
    for (i = 0; i < itens.length; i++) {
      if (texto(itens[i].nome)) nomes.push(texto(itens[i].nome));
    }
    if (nomes.length <= 1) return nomes.join('');
    return nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1];
  }

  function definirDescricao(frase) {
    var meta = document.getElementById('meta-descricao');
    if (meta) meta.setAttribute('content', frase);
  }

  function soNumeros(v) {
    return texto(v).replace(/\D/g, '');
  }

  function formatarTelefone(numero) {
    var d = numero;
    var ddd, resto;
    if (d.indexOf('55') === 0 && (d.length === 12 || d.length === 13)) {
      ddd = d.substr(2, 2);
      resto = d.substr(4);
      if (resto.length === 9) return '(' + ddd + ') ' + resto.substr(0, 5) + '-' + resto.substr(5);
      return '(' + ddd + ') ' + resto.substr(0, 4) + '-' + resto.substr(4);
    }
    return '+' + d;
  }

  function usuarioInstagram(v) {
    return texto(v)
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^@/, '')
      .replace(/[\/?#].*$/, '');
  }

  /* ================= catálogo ================= */

  function acharCategoria(id) {
    var i;
    for (i = 0; i < categorias.length; i++) {
      if (categorias[i].id === id) return categorias[i];
    }
    return null;
  }

  function acharSub(cat, sid) {
    var subs = lista(cat && cat.subcategorias);
    var i;
    for (i = 0; i < subs.length; i++) {
      if (subs[i].id === sid) return subs[i];
    }
    return null;
  }

  // Só produtos ativos e com categoria/subcategoria existentes vão para o site.
  function produtosVisiveis() {
    var todos = lista(CAT && CAT.produtos);
    var saida = [];
    var i, p, c;
    for (i = 0; i < todos.length; i++) {
      p = todos[i];
      if (!p || p.ativo === false) continue;
      c = acharCategoria(p.categoria);
      if (!c || !acharSub(c, p.subcategoria)) continue;
      p._ordem = i;
      saida.push(p);
    }
    return saida;
  }

  // Menu, atalhos e abas mostram só categorias e subcategorias que têm produto no site,
  // para o cliente não cair numa página vazia. Elas voltam sozinhas quando ganham produto.
  // Loja ainda sem nenhum produto: mostra tudo, para o site não ficar sem menu.
  // "dividida" diz se a categoria tem mais de uma subcategoria no catálogo (aí o menu lista as que têm produto).
  function categoriasNoMenu() {
    return categorias.map(function (c) {
      var todas = lista(c.subcategorias);
      var comProduto = !produtos.length ? todas : todas.filter(function (s) {
        return produtos.some(function (p) { return p.categoria === c.id && p.subcategoria === s.id; });
      });
      return comProduto.length ? { id: c.id, nome: c.nome, subcategorias: comProduto, dividida: todas.length > 1 } : null;
    }).filter(function (c) { return c !== null; });
  }

  function acharProduto(id) {
    var i;
    if (!id) return null;
    for (i = 0; i < produtos.length; i++) {
      if (produtos[i].id === id) return produtos[i];
    }
    return null;
  }

  function emPromocao(p) {
    return typeof p.precoPromocional === 'number' && p.precoPromocional > 0 && p.precoPromocional < p.preco;
  }

  function precoFinal(p) {
    return emPromocao(p) ? p.precoPromocional : p.preco;
  }

  function desconto(p) {
    return Math.round((1 - p.precoPromocional / p.preco) * 100);
  }

  function estoqueDe(p, tamanho) {
    var tams = lista(p.tamanhos);
    var i, e;
    for (i = 0; i < tams.length; i++) {
      if (String(tams[i].tamanho) === tamanho) {
        e = Number(tams[i].estoque);
        return e > 0 ? e : 0;
      }
    }
    return 0;
  }

  function estoqueTotal(p) {
    var tams = lista(p.tamanhos);
    var total = 0;
    var i, e;
    for (i = 0; i < tams.length; i++) {
      e = Number(tams[i].estoque);
      if (e > 0) total += e;
    }
    return total;
  }

  // Encomenda: com "encomenda": true no produto, os tamanhos listados que estão sem estoque
  // aparecem como "Sob encomenda" e o cliente pede pelo WhatsApp (o dono encomenda o par).
  // Sem WhatsApp na loja não há como encomendar, e esses tamanhos ficam como esgotados.
  function aceitaEncomenda(p) {
    return p.encomenda === true && !!soNumeros(contato.whatsapp);
  }

  function temTamanho(p, tamanho) {
    return lista(p.tamanhos).some(function (t) { return String(t.tamanho) === tamanho; });
  }

  // 'pronta' (tem estoque), 'encomenda' (sem estoque, mas dá para encomendar) ou 'esgotado'.
  function situacaoTamanho(p, tamanho) {
    if (estoqueDe(p, tamanho) > 0) return 'pronta';
    return (aceitaEncomenda(p) && temTamanho(p, tamanho)) ? 'encomenda' : 'esgotado';
  }

  function esgotado(p) {
    return estoqueTotal(p) <= 0 && !aceitaEncomenda(p);
  }

  function soEncomenda(p) {
    return estoqueTotal(p) <= 0 && aceitaEncomenda(p);
  }

  function prazoEncomenda() {
    return texto((loja.encomenda || {}).prazo);
  }

  // Modelo do produto (campo extra "modelo" da categoria, ex.: "Veloz").
  function modeloDe(p) {
    return texto((p.extras || {}).modelo);
  }

  // Nome do modelo com a marca, para o filtro da vitrine (ex.: "Quadra Pro Veloz").
  function rotuloModelo(p) {
    var m = modeloDe(p);
    if (!m) return '';
    return texto(p.marca) && m.toLowerCase().indexOf(texto(p.marca).toLowerCase()) !== 0 ? texto(p.marca) + ' ' + m : m;
  }

  // Mesma marca, mesmo modelo e mesma subcategoria: são cores do mesmo produto.
  function mesmoModelo(a, b) {
    return !!modeloDe(a) && modeloDe(a).toLowerCase() === modeloDe(b).toLowerCase() &&
      texto(a.marca).toLowerCase() === texto(b.marca).toLowerCase() &&
      a.categoria === b.categoria && a.subcategoria === b.subcategoria;
  }

  // Junta as cores do mesmo modelo num grupo só, na posição da primeira que aparece na lista.
  function agruparCores(itens) {
    var grupos = [];
    var i, g, achou;
    for (i = 0; i < itens.length; i++) {
      achou = false;
      for (g = 0; g < grupos.length && !achou; g++) {
        if (mesmoModelo(grupos[g][0], itens[i])) {
          grupos[g].push(itens[i]);
          achou = true;
        }
      }
      if (!achou) grupos.push([itens[i]]);
    }
    return grupos;
  }

  function semAcento(s) {
    return s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
  }

  // Devolve a lista de tons da cor (até 3) ou null se algum pedaço do nome for desconhecido.
  function tonsDaCor(nome) {
    var s = semAcento(texto(nome).toLowerCase());
    var partes = s.split(/\s*[\/,+&]\s*|\s+e\s+|\s+com\s+/);
    var tons = [];
    var i, parte, tom;
    for (i = 0; i < partes.length; i++) {
      parte = partes[i].replace(/^\s+|\s+$/g, '').replace(/\s+/g, '-');
      if (!parte) continue;
      if (/^(multi-?)?colorid[oa]$|^multicor(es)?$/.test(parte)) {
        tons = tons.concat(COLORIDO);
        continue;
      }
      tom = TONS[parte] || TONS[parte.split('-')[0]];
      if (!tom) return null;
      if (tons.indexOf(tom) === -1) tons.push(tom);
    }
    return tons.length ? tons.slice(0, COLORIDO.length) : null;
  }

  function pintarBolinha(tinta, p) {
    var tons = tonsDaCor(p.cor);
    var paradas = [];
    var i, passo;
    if (!tons) {
      tinta.className += ' bolinha-foto';
      tinta.style.backgroundImage = 'url("' + miniatura(imagensDe(p)[0]).replace(/["\\]/g, '\\$&') + '")';
      return;
    }
    if (tons.length === 1) {
      tinta.style.background = tons[0];
      return;
    }
    passo = 100 / tons.length;
    for (i = 0; i < tons.length; i++) {
      paradas.push(tons[i] + ' ' + (i * passo).toFixed(2) + '% ' + ((i + 1) * passo).toFixed(2) + '%');
    }
    tinta.style.background = 'linear-gradient(135deg, ' + paradas.join(', ') + ')';
  }

  function imagensDe(p) {
    var imgs = lista(p.imagens);
    var saida = [];
    var i;
    for (i = 0; i < imgs.length; i++) {
      if (texto(imgs[i])) saida.push(texto(imgs[i]));
    }
    if (!saida.length) saida.push(SEM_FOTO);
    return saida;
  }

  // Tamanhos do produto na ordem definida na categoria.
  function tamanhosOrdenados(p, cat) {
    var ordem = lista(cat && cat.tamanhos);
    var tams = lista(p.tamanhos);
    var saida = [];
    var vistos = {};
    var i, j, t;
    for (i = 0; i < ordem.length; i++) {
      for (j = 0; j < tams.length; j++) {
        t = String(tams[j].tamanho);
        if (t === String(ordem[i]) && !vistos[t]) {
          vistos[t] = true;
          saida.push(t);
        }
      }
    }
    for (j = 0; j < tams.length; j++) {
      t = String(tams[j].tamanho);
      if (!vistos[t]) {
        vistos[t] = true;
        saida.push(t);
      }
    }
    return saida;
  }

  function maisNovoPrimeiro(a, b) {
    var da = texto(a.criadoEm);
    var db = texto(b.criadoEm);
    if (da !== db) return da < db ? 1 : -1;
    return b._ordem - a._ordem;
  }

  // modo: 'novidades' | 'menor' | 'maior'. Preço = o que o cliente paga (promocional, se houver).
  // Em 'novidades', produto com "fixarNoTopo": true vem primeiro; na ordem por preço, vale o preço.
  function ordenar(itens, modo) {
    var copia = itens.slice();
    copia.sort(function (a, b) {
      var dif = 0;
      if (modo === 'menor') dif = precoFinal(a) - precoFinal(b);
      else if (modo === 'maior') dif = precoFinal(b) - precoFinal(a);
      else dif = (b.fixarNoTopo === true ? 1 : 0) - (a.fixarNoTopo === true ? 1 : 0);
      return dif || maisNovoPrimeiro(a, b);
    });
    return copia;
  }

  /* ================= peças comuns ================= */

  function foto(src, alt, classe) {
    var img = el('img', { src: src, alt: alt, loading: 'lazy', decoding: 'async', classe: classe });
    img.onerror = function () {
      if (img.getAttribute('src') !== SEM_FOTO) img.setAttribute('src', SEM_FOTO);
    };
    return img;
  }

  // Foto pequena (img/produtos/mini/<mesmo nome>, feita por ferramentas/gerar-miniaturas.ps1)
  // para cartões, fotinhas de cor e miniaturas da galeria: a página fica bem mais leve no celular.
  // Só JPG e PNG têm versão pequena (WEBP não dá para diminuir nesta máquina).
  function miniatura(src) {
    var i = src.lastIndexOf('/');
    if (!/^img\/produtos\/[^\/]+\.(jpe?g|png)$/i.test(src)) return src;
    return src.slice(0, i + 1) + 'mini/' + src.slice(i + 1);
  }

  // Se a pequena faltar, usa a grande; se a grande faltar, a imagem de "sem foto".
  function fotoPequena(src, alt, classe) {
    var mini = miniatura(src);
    var img = foto(mini, alt, classe);
    if (mini !== src) {
      img.onerror = function () {
        var atual = img.getAttribute('src');
        if (atual === mini) img.setAttribute('src', src);
        else if (atual !== SEM_FOTO) img.setAttribute('src', SEM_FOTO);
      };
    }
    return img;
  }

  function blocoPreco(p, classe) {
    if (emPromocao(p)) {
      return el('p', { classe: 'preco ' + classe }, [
        el('span', { classe: 'preco-de' }, ['de ', el('s', { texto: dinheiro(p.preco) })]),
        ' ',
        el('span', { classe: 'preco-por' }, ['por ', el('strong', { texto: dinheiro(p.precoPromocional) })])
      ]);
    }
    return el('p', { classe: 'preco ' + classe }, [
      el('span', { classe: 'preco-por' }, [el('strong', { texto: dinheiro(p.preco) })])
    ]);
  }

  // Cartão da vitrine. "cores" = as cores do mesmo modelo nesta lista (com p), na ordem do catálogo.
  // Com duas cores ou mais, ganha bolinhas: tocar numa troca foto, cor, preço e link do cartão.
  // O cartão inteiro abre o produto pelo link do nome (que se estica por cima do cartão);
  // as bolinhas ficam por cima desse link para poderem ser tocadas.
  function cartao(p, cores) {
    var li = el('li', { classe: 'cartao' });
    var fotoBox = el('div', { classe: 'cartao-foto' });
    var info = el('div', { classe: 'cartao-info' });
    var bolinhas = null;
    var botoes = [];
    var jaMostrou = false;
    var visiveis, i;

    function mostrar(atual) {
      var semEstoque = esgotado(atual);
      var filhos, k, img;
      li.className = 'cartao' + (semEstoque ? ' cartao-esgotado' : '');
      limpar(fotoBox);
      img = fotoPequena(imagensDe(atual)[0], texto(atual.nome) + (texto(atual.cor) ? ' ' + texto(atual.cor) : ''));
      if (jaMostrou && podeAnimar()) img.classList.add('foto-entra'); // troca de cor: a foto nova entra com movimento
      jaMostrou = true;
      fotoBox.appendChild(img);
      fotoBox.appendChild(el('div', { classe: 'selos' }, [
        emPromocao(atual) ? el('span', { classe: 'selo selo-desconto', texto: '-' + desconto(atual) + '%' }) : null,
        semEstoque ? el('span', { classe: 'selo selo-esgotado', texto: 'Esgotado' }) : null,
        soEncomenda(atual) ? el('span', { classe: 'selo selo-encomenda', texto: 'Sob encomenda' }) : null
      ]));
      // Troca tudo do texto, menos as bolinhas (assim o botão tocado não perde o foco).
      filhos = Array.prototype.slice.call(info.childNodes);
      for (k = 0; k < filhos.length; k++) {
        if (filhos[k] !== bolinhas) info.removeChild(filhos[k]);
      }
      filhos = [
        texto(atual.marca) ? el('span', { classe: 'cartao-marca', texto: atual.marca }) : null,
        el('h3', { classe: 'cartao-nome' }, [el('a', { href: linkProduto(atual.id), classe: 'cartao-link', texto: atual.nome })]),
        texto(atual.cor) ? el('span', { classe: 'cartao-cor', texto: atual.cor }) : null
      ];
      for (k = 0; k < filhos.length; k++) {
        if (filhos[k]) info.insertBefore(filhos[k], bolinhas);
      }
      info.appendChild(blocoPreco(atual, 'cartao-preco'));
      for (k = 0; k < botoes.length; k++) {
        botoes[k].b.setAttribute('aria-pressed', botoes[k].p === atual ? 'true' : 'false');
      }
    }

    function botaoCor(v) {
      var nomeCor = texto(v.cor) || 'Outra cor';
      var tinta = el('span', { classe: 'bolinha-tinta' });
      var b = el('button', { type: 'button', classe: 'bolinha', title: nomeCor, 'aria-label': nomeCor }, [tinta]);
      var carregou = false;
      // Mouse em cima ou dedo encostando: já busca a foto, para a troca ser na hora.
      function preCarregar() {
        if (carregou) return;
        carregou = true;
        new Image().src = miniatura(imagensDe(v)[0]);
      }
      pintarBolinha(tinta, v);
      b.addEventListener('mouseenter', preCarregar);
      b.addEventListener('focus', preCarregar);
      b.addEventListener('touchstart', preCarregar, { passive: true });
      b.addEventListener('click', function () { mostrar(v); });
      botoes.push({ b: b, p: v });
      return b;
    }

    if (cores && cores.length > 1) {
      visiveis = cores.slice(0, MAX_BOLINHAS);
      if (visiveis.indexOf(p) === -1) visiveis[visiveis.length - 1] = p;
      bolinhas = el('div', { classe: 'bolinhas', role: 'group', 'aria-label': 'Cores disponíveis' });
      for (i = 0; i < visiveis.length; i++) bolinhas.appendChild(botaoCor(visiveis[i]));
      if (cores.length > visiveis.length) {
        bolinhas.appendChild(el('span', { classe: 'bolinhas-mais', texto: '+' + (cores.length - visiveis.length) }));
      }
      info.appendChild(bolinhas);
    }

    li.appendChild(fotoBox);
    li.appendChild(info);
    mostrar(p);
    return li;
  }

  // Grade de cartões. As cores do mesmo modelo viram um cartão só (com bolinhas),
  // mostrando primeiro a cor que veio antes na lista. "maximo" limita o número de cartões.
  function grade(itens, maximo) {
    var ul = el('ul', { classe: 'grade' });
    var grupos = agruparCores(itens);
    var i;
    if (maximo) grupos = grupos.slice(0, maximo);
    for (i = 0; i < grupos.length; i++) {
      ul.appendChild(cartao(grupos[i][0], grupos[i].slice().sort(function (a, b) { return a._ordem - b._ordem; })));
    }
    return ul;
  }

  function secao(id, titulo, filhos) {
    return el('section', { id: id, classe: 'secao' }, [
      el('h2', { classe: 'secao-titulo', texto: titulo })
    ].concat(filhos));
  }

  // nivel: nível do título (1 quando o aviso é o título principal da página).
  function caixaAviso(nivel, titulo, frase, linkTexto, linkHref) {
    return el('div', { classe: 'aviso' }, [
      el('h' + nivel, { classe: 'aviso-titulo', texto: titulo }),
      frase ? el('p', { texto: frase }) : null,
      linkHref ? el('a', { href: linkHref, classe: 'botao', texto: linkTexto }) : null
    ]);
  }

  function trilha(itens) {
    var ol = el('ol');
    var i, it;
    for (i = 0; i < itens.length; i++) {
      it = itens[i];
      ol.appendChild(el('li', null, [
        it.href ? el('a', { href: it.href, texto: it.texto }) : el('span', { 'aria-current': 'page', texto: it.texto })
      ]));
    }
    return el('nav', { classe: 'trilha', 'aria-label': 'Você está em' }, [ol]);
  }

  /* ================= cabeçalho e rodapé ================= */

  function montarTopo(categoriaAtual) {
    var listaMenu = el('ul', { classe: 'menu-lista' });
    var cats = categoriasNoMenu();
    var i, j, c, subs, sub;

    for (i = 0; i < cats.length; i++) {
      c = cats[i];
      subs = c.subcategorias;
      sub = null;
      if (c.dividida) {
        sub = el('ul', { classe: 'submenu' });
        for (j = 0; j < subs.length; j++) {
          sub.appendChild(el('li', null, [
            el('a', { href: linkCategoria(c.id, subs[j].id), texto: subs[j].nome })
          ]));
        }
      }
      listaMenu.appendChild(el('li', { classe: 'menu-item' + (c.id === categoriaAtual ? ' menu-item-atual' : '') }, [
        el('a', { href: linkCategoria(c.id), classe: 'menu-categoria', texto: c.nome }),
        sub
      ]));
    }

    var botao = el('button', {
      type: 'button',
      classe: 'menu-botao',
      'aria-expanded': 'false',
      'aria-controls': 'menu-principal'
    }, [
      el('span', { classe: 'menu-icone', 'aria-hidden': 'true' }),
      el('span', { classe: 'menu-rotulo', texto: 'Menu' })
    ]);
    botao.addEventListener('click', function () {
      var aberto = topo.classList.toggle('menu-aberto');
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    limpar(topo);
    topo.appendChild(el('div', { classe: 'topo-interno' }, [
      el('a', { href: 'index.html', classe: 'logo', texto: nomeLoja }),
      el('div', { classe: 'topo-acoes' }, [
        contasAtivas() ? linkTopo('conta.html', 'Minha conta', 'pessoa') : null,
        vendasAbertas() ? linkCarrinho() : null,
        botaoTema(),
        cats.length ? botao : null
      ]),
      el('nav', { id: 'menu-principal', classe: 'menu', 'aria-label': 'Categorias' }, [listaMenu])
    ]));
    atualizarContadorCarrinho();
  }

  function linkTopo(href, rotulo, tipoIcone) {
    return el('a', { href: href, classe: 'tema-botao topo-icone', 'aria-label': rotulo, title: rotulo }, [icone(tipoIcone)]);
  }

  function linkCarrinho() {
    var link = linkTopo('carrinho.html', 'Carrinho', 'sacola');
    link.id = 'topo-carrinho';
    link.appendChild(el('span', { classe: 'contador', 'aria-hidden': 'true', hidden: true }));
    return link;
  }

  /* ================= modo claro / escuro ================= */

  // O tema já é aplicado no <head> de cada página, antes de ela aparecer (assim não pisca).
  // Sem escolha salva, abre no escuro. Aqui fica só o botão de trocar; a escolha fica salva no navegador.

  function temaAtual() {
    return document.documentElement.getAttribute('data-tema') === 'escuro' ? 'escuro' : 'claro';
  }

  function icone(tipo) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    var formas, i, forma, k;
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var desenhos = {
      sol: [['circle', { cx: '12', cy: '12', r: '4' }],
            ['path', { d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' }]],
      lua: [['path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }]],
      pessoa: [['path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }], ['circle', { cx: '12', cy: '7', r: '4' }]],
      sacola: [['path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }], ['path', { d: 'M3 6h18' }], ['path', { d: 'M16 10a4 4 0 0 1-8 0' }]],
      coracao: [['path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' }]]
    };
    formas = desenhos[tipo] || desenhos.lua;
    for (i = 0; i < formas.length; i++) {
      forma = document.createElementNS(ns, formas[i][0]);
      for (k in formas[i][1]) {
        if (Object.prototype.hasOwnProperty.call(formas[i][1], k)) forma.setAttribute(k, formas[i][1][k]);
      }
      svg.appendChild(forma);
    }
    return svg;
  }

  // A loja abre sempre no escuro (identidade dela); o claro fica para quem escolher no botão.
  function botaoTema() {
    var b = el('button', { type: 'button', classe: 'tema-botao' });

    function atualizar() {
      var escuro = temaAtual() === 'escuro';
      var rotulo = escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro';
      limpar(b);
      b.appendChild(icone(escuro ? 'sol' : 'lua'));
      b.setAttribute('aria-label', rotulo);
      b.setAttribute('title', rotulo);
    }

    b.addEventListener('click', function () {
      var novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
      document.documentElement.setAttribute('data-tema', novo);
      try { window.localStorage.setItem('tema', novo); } catch (e) { /* navegador sem armazenamento: troca só nesta página */ }
      atualizar();
    });

    atualizar();
    return b;
  }

  function montarRodape() {
    var itens = [];
    var zap = soNumeros(contato.whatsapp);
    var insta = usuarioInstagram(contato.instagram);

    if (zap) {
      itens.push(el('li', null, [
        el('a', { href: 'https://wa.me/' + zap, target: '_blank', rel: 'noopener', texto: 'WhatsApp ' + formatarTelefone(zap) })
      ]));
    }
    if (insta) {
      itens.push(el('li', null, [
        el('a', { href: 'https://www.instagram.com/' + encodeURIComponent(insta) + '/', target: '_blank', rel: 'noopener', texto: 'Instagram @' + insta })
      ]));
    }
    itens.push(el('li', null, [el('a', { href: 'privacidade.html', texto: 'Aviso de privacidade' })]));

    limpar(rodape);
    rodape.appendChild(el('div', { classe: 'rodape-interno' }, [
      el('a', { href: 'index.html', classe: 'rodape-nome', texto: nomeLoja }),
      itens.length ? el('ul', { classe: 'rodape-contato' }, itens) : null,
      el('p', { classe: 'rodape-copy', texto: '© ' + new Date().getFullYear() + ' ' + nomeLoja })
    ]));
  }

  /* ================= WhatsApp flutuante ================= */

  // Botão redondo do WhatsApp no canto da tela, em todas as páginas (só se a loja tiver WhatsApp).
  // Alguns segundos depois de a página abrir, um balão convida o visitante a puxar conversa.
  // O balão some sozinho depois de alguns segundos (espera enquanto o mouse ou o foco estiver nele)
  // e aparece uma vez por visita (fica anotado no sessionStorage). O botão fica sempre.
  function montarWhatsFlutuante(produtoAtual) {
    var zap = soNumeros(contato.whatsapp);
    if (!zap) return;

    var mensagem = produtoAtual
      ? 'Olá! Vim pelo site e tenho uma dúvida sobre: ' + texto(produtoAtual.nome)
      : 'Olá! Vim pelo site e queria tirar uma dúvida.';
    var link = 'https://wa.me/' + zap + '?text=' + encodeURIComponent(mensagem);
    var rotulo = 'Conversar no WhatsApp';
    var espera = null;
    var fechamento = null;

    var chamar = el('a', { href: link, target: '_blank', rel: 'noopener', classe: 'zap-balao-acao', texto: 'Chamar no WhatsApp' });
    var balao = el('div', { classe: 'zap-balao', role: 'status', hidden: true }, [
      el('p', { classe: 'zap-balao-titulo', texto: 'Precisa de ajuda?' }),
      el('p', { classe: 'zap-balao-texto', texto: 'Tire suas dúvidas sobre produtos e tamanhos direto com a gente.' }),
      chamar
    ]);
    var botao = el('a', { href: link, target: '_blank', rel: 'noopener', classe: 'zap-botao', 'aria-label': rotulo, title: rotulo }, [iconeWhats()]);

    function esconderBalao() {
      window.clearTimeout(espera);
      window.clearTimeout(fechamento);
      marcarConviteMostrado();
      if (balao.hidden) return;
      balao.classList.add('zap-balao-saindo'); // some aos poucos
      window.setTimeout(function () {
        balao.hidden = true;
        balao.classList.remove('zap-balao-saindo');
      }, 250);
    }

    function fecharDepois() {
      window.clearTimeout(fechamento);
      fechamento = window.setTimeout(esconderBalao, CONVITE_DURACAO_MS);
    }

    function segurar() {
      window.clearTimeout(fechamento);
    }

    // Com o mouse ou o foco do teclado no balão, ele espera; ao sair, conta o tempo de novo.
    balao.addEventListener('mouseenter', segurar);
    balao.addEventListener('focusin', segurar);
    balao.addEventListener('mouseleave', fecharDepois);
    balao.addEventListener('focusout', fecharDepois);
    chamar.addEventListener('click', esconderBalao);
    botao.addEventListener('click', esconderBalao);

    document.body.appendChild(el('div', { classe: 'zap-flutuante' }, [balao, botao]));

    if (!conviteJaMostrado()) {
      espera = window.setTimeout(function () {
        balao.hidden = false;
        marcarConviteMostrado();
        fecharDepois();
      }, CONVITE_DEPOIS_MS);
    }
  }

  function conviteJaMostrado() {
    try { return window.sessionStorage.getItem('convite-whatsapp') === '1'; } catch (e) { return false; }
  }

  function marcarConviteMostrado() {
    try { window.sessionStorage.setItem('convite-whatsapp', '1'); } catch (e) { /* sem armazenamento: o convite pode aparecer de novo */ }
  }

  function iconeWhats() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    var forma = document.createElementNS(ns, 'path');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    forma.setAttribute('fill', 'currentColor');
    forma.setAttribute('d', 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z');
    svg.appendChild(forma);
    return svg;
  }

  /* ================= index.html ================= */

  // Banner da página inicial: chamada, botões e o produto em destaque flutuando sobre um "palco" de luz.
  // Com mouse, o produto acompanha o movimento de leve.
  function montarHeroi(resumo, estrela, cats) {
    var palco = null;
    var foto1, nomeEstrela;
    if (estrela) {
      nomeEstrela = texto(estrela.nome) + (texto(estrela.cor) ? ' ' + texto(estrela.cor) : '');
      foto1 = el('img', { src: imagensDe(estrela)[0], alt: nomeEstrela, classe: 'heroi-foto', decoding: 'async', fetchpriority: 'high' });
      palco = el('a', { href: linkProduto(estrela.id), classe: 'heroi-palco', 'aria-label': 'Ver ' + nomeEstrela }, [
        el('span', { classe: 'heroi-anel', 'aria-hidden': 'true' }),
        el('span', { classe: 'heroi-luz', 'aria-hidden': 'true' }),
        el('span', { classe: 'heroi-sombra', 'aria-hidden': 'true' }),
        foto1,
        el('span', { classe: 'heroi-etiqueta', 'aria-hidden': 'true' }, [
          el('span', { texto: texto(estrela.nome) }),
          el('strong', { texto: dinheiro(precoFinal(estrela)) })
        ])
      ]);
      foto1.onerror = function () { palco.hidden = true; };
    }

    var secaoHeroi = el('section', { classe: 'heroi' }, [
      el('div', { classe: 'heroi-fundo', 'aria-hidden': 'true' }),
      el('div', { classe: 'limite heroi-grade' }, [
        el('div', { classe: 'heroi-texto' }, [
          el('p', { classe: 'heroi-selo', texto: nomeLoja }),
          resumo
            ? el('h1', { classe: 'heroi-titulo' }, [resumo + ' ', el('span', { classe: 'heroi-brilho', texto: 'para o seu jogo.' })])
            : el('h1', { classe: 'heroi-titulo', texto: nomeLoja }),
          el('p', { classe: 'heroi-frase', texto: 'Escolha o modelo, a cor e o tamanho.' }),
          el('div', { classe: 'heroi-acoes' }, [
            el('a', { href: '#destaques', classe: 'botao', texto: 'Ver produtos' }),
            cats.length ? el('a', { href: linkCategoria(cats[0].id), classe: 'botao botao-fantasma', texto: 'Ver ' + texto(cats[0].nome) }) : null
          ])
        ]),
        palco
      ])
    ]);

    if (palco && podeAnimar() && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var px = 0, py = 0, agendado = false;
      var aplicar = function () {
        agendado = false;
        palco.style.setProperty('--px', px.toFixed(3));
        palco.style.setProperty('--py', py.toFixed(3));
      };
      secaoHeroi.addEventListener('pointermove', function (e) {
        var r = secaoHeroi.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5;
        py = (e.clientY - r.top) / r.height - 0.5;
        if (!agendado) { agendado = true; window.requestAnimationFrame(aplicar); }
      });
      secaoHeroi.addEventListener('pointerleave', function () { px = 0; py = 0; aplicar(); });
    }
    return secaoHeroi;
  }

  // Faixa com os produtos passando sem parar (um por modelo). São duas cópias seguidas da lista,
  // para a volta não ter emenda. É só enfeite (os mesmos produtos estão logo abaixo), então fica
  // escondida dos leitores de tela e fora da navegação pelo teclado.
  function montarFaixa(itens) {
    var modelos = agruparCores(itens).map(function (g) { return g[0]; })
      .filter(function (p) { return imagensDe(p)[0] !== SEM_FOTO; });
    // Intercala as categorias (um tênis, uma camisa, um tênis...), para a faixa ficar variada.
    var porCategoria = {};
    var ordemCats = [];
    var unicos = [];
    var base, trilho, k, sobrou;
    modelos.forEach(function (p) {
      if (!porCategoria[p.categoria]) { porCategoria[p.categoria] = []; ordemCats.push(p.categoria); }
      porCategoria[p.categoria].push(p);
    });
    do {
      sobrou = false;
      for (k = 0; k < ordemCats.length; k++) {
        if (porCategoria[ordemCats[k]].length) { unicos.push(porCategoria[ordemCats[k]].shift()); sobrou = true; }
      }
    } while (sobrou);
    if (unicos.length < 3) return null;
    base = unicos.slice();
    while (base.length < 10) base = base.concat(unicos);

    function copiaDaLista() {
      var ul = el('ul', { classe: 'faixa-lista' });
      base.forEach(function (p) {
        ul.appendChild(el('li', null, [
          el('a', { href: linkProduto(p.id), classe: 'faixa-item', tabindex: '-1' }, [
            el('span', { classe: 'faixa-foto' }, [fotoPequena(imagensDe(p)[0], '')]),
            el('span', { classe: 'faixa-nome', texto: texto(p.nome) })
          ])
        ]));
      });
      return ul;
    }

    trilho = el('div', { classe: 'faixa-trilho' }, [copiaDaLista(), copiaDaLista()]);
    trilho.style.setProperty('--duracao', (base.length * 4) + 's');
    return el('section', { classe: 'faixa-produtos', 'aria-hidden': 'true' }, [trilho]);
  }

  function paginaInicio() {
    var cats = categoriasNoMenu();
    var resumo = juntarNomes(cats);
    var i, j, c, subs, chips, destaques, tituloDestaques, promocoes, secaoPromo;

    document.title = nomeLoja + (resumo ? ' | ' + resumo : '');
    definirDescricao(resumo ? nomeLoja + ': ' + resumo + '.' : nomeLoja);

    // Banner com o produto em destaque flutuando, e a faixa com os produtos passando
    var vitrine = ordenar(produtos.filter(function (p) { return p.destaque === true; }), 'novidades');
    if (!vitrine.length) vitrine = ordenar(produtos, 'novidades');
    var estrela = null;
    for (i = 0; i < vitrine.length && !estrela; i++) {
      if (imagensDe(vitrine[i])[0] !== SEM_FOTO) estrela = vitrine[i];
    }
    conteudo.appendChild(montarHeroi(resumo, estrela, cats));
    var faixa = montarFaixa(ordenar(produtos, 'novidades'));
    if (faixa) conteudo.appendChild(faixa);

    // Atalhos para as categorias: um cartão por categoria, com a foto de um produto dela
    if (cats.length) {
      var grupos = el('div', { classe: 'atalhos' });
      for (i = 0; i < cats.length; i++) {
        c = cats[i];
        subs = c.subcategorias;
        chips = el('ul', { classe: 'atalho-chips' });
        for (j = 0; j < subs.length; j++) {
          chips.appendChild(el('li', null, [
            el('a', { href: linkCategoria(c.id, subs[j].id), classe: 'chip', texto: subs[j].nome })
          ]));
        }
        var cid = c.id;
        var rep = ordenar(produtos.filter(function (p) { return p.categoria === cid && imagensDe(p)[0] !== SEM_FOTO; }), 'novidades')[0];
        grupos.appendChild(el('div', { classe: 'atalho-grupo' }, [
          el('h3', { classe: 'atalho-titulo' }, [el('a', { href: linkCategoria(c.id), texto: c.nome })]),
          c.dividida ? chips : null,
          rep ? el('span', { classe: 'atalho-disco', 'aria-hidden': 'true' }, [fotoPequena(imagensDe(rep)[0], '')]) : null
        ]));
      }
      conteudo.appendChild(secao('atalhos', 'Compre por categoria', [grupos]));
    }

    // Destaques (ou, sem destaque marcado, os mais recentes)
    destaques = ordenar(produtos.filter(function (p) { return p.destaque === true; }), 'novidades');
    tituloDestaques = 'Destaques';
    if (!destaques.length) {
      destaques = ordenar(produtos, 'novidades');
      tituloDestaques = 'Novidades';
    }
    conteudo.appendChild(secao('destaques', tituloDestaques, [
      destaques.length
        ? grade(destaques, tituloDestaques === 'Novidades' ? MAX_NOVIDADES : 0)
        : caixaAviso(3, 'Em breve novidades por aqui', 'Estamos preparando a vitrine. Volte logo!')
    ]));

    // Promoções (some se não houver)
    promocoes = ordenar(produtos.filter(emPromocao), 'novidades');
    secaoPromo = secao('promocoes', 'Promoções', [grade(promocoes)]);
    secaoPromo.hidden = promocoes.length === 0;
    conteudo.appendChild(secaoPromo);
  }

  /* ================= categoria.html ================= */

  function paginaCategoria() {
    var cid = parametro('c');
    var sid = parametro('s');
    var cat = acharCategoria(cid);
    var sub, subs, base, abas, i, s, titulo;

    if (!cat) {
      document.title = 'Categoria não encontrada | ' + nomeLoja;
      conteudo.appendChild(el('div', { classe: 'secao' }, [
        caixaAviso(1, 'Categoria não encontrada', 'Não achamos essa parte da loja. Que tal começar pela página inicial?',
          'Ir para a página inicial', 'index.html')
      ]));
      return;
    }

    sub = sid ? acharSub(cat, sid) : null;
    if (sid && !sub) {
      document.title = 'Página não encontrada | ' + nomeLoja;
      conteudo.appendChild(el('div', { classe: 'secao' }, [
        caixaAviso(1, 'Não encontramos essa seção', 'Veja todos os produtos de ' + texto(cat.nome) + ' ou volte para a página inicial.',
          'Ver ' + texto(cat.nome), linkCategoria(cat.id)),
        el('p', { classe: 'aviso-extra' }, [el('a', { href: 'index.html', texto: 'Ir para a página inicial' })])
      ]));
      return;
    }

    // Abas só das subcategorias com produto (a página de uma seção vazia continua abrindo pelo link).
    subs = (categoriasNoMenu().filter(function (c) { return c.id === cat.id; })[0] || { subcategorias: [] }).subcategorias;
    titulo = texto(cat.nome) + (sub && texto(sub.nome) !== texto(cat.nome) ? ' · ' + texto(sub.nome) : '');
    document.title = (sub && texto(sub.nome) !== texto(cat.nome) ? texto(sub.nome) + ' - ' + texto(cat.nome) : texto(cat.nome)) + ' | ' + nomeLoja;
    definirDescricao(nomeLoja + ': ' + titulo + '.');

    var cabecalho = el('div', { classe: 'secao secao-topo' }, [
      trilha(sub
        ? [{ texto: 'Início', href: 'index.html' }, { texto: cat.nome, href: linkCategoria(cat.id) }, { texto: sub.nome }]
        : [{ texto: 'Início', href: 'index.html' }, { texto: cat.nome }]),
      el('h1', { classe: 'pagina-titulo', texto: titulo })
    ]);

    // Abas por subcategoria (só se houver mais de uma)
    if (subs.length > 1) {
      abas = el('ul', { classe: 'abas-lista' });
      abas.appendChild(el('li', null, [
        el('a', { href: linkCategoria(cat.id), classe: 'aba' + (sub ? '' : ' aba-ativa'), 'aria-current': sub ? null : 'page', texto: 'Todos' })
      ]));
      for (i = 0; i < subs.length; i++) {
        s = subs[i];
        abas.appendChild(el('li', null, [
          el('a', {
            href: linkCategoria(cat.id, s.id),
            classe: 'aba' + (sub && sub.id === s.id ? ' aba-ativa' : ''),
            'aria-current': sub && sub.id === s.id ? 'page' : null,
            texto: s.nome
          })
        ]));
      }
      cabecalho.appendChild(el('nav', { classe: 'abas', 'aria-label': 'Subcategorias de ' + texto(cat.nome) }, [abas]));
    }
    conteudo.appendChild(cabecalho);

    base = produtos.filter(function (p) {
      return p.categoria === cat.id && (!sub || p.subcategoria === sub.id);
    });

    if (!base.length) {
      conteudo.appendChild(el('div', { classe: 'secao' }, [
        caixaAviso(2, 'Em breve novidades por aqui', 'Ainda não temos produtos nesta seção. Enquanto isso, dê uma olhada no resto da loja.',
          'Voltar para a página inicial', 'index.html')
      ]));
      return;
    }

    montarVitrine(cat, base);
  }

  function montarVitrine(cat, base) {
    var marcas = [];
    var i, j, m, t;

    for (i = 0; i < base.length; i++) {
      m = texto(base[i].marca);
      if (m && marcas.indexOf(m) === -1) marcas.push(m);
    }
    marcas.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

    // Tamanhos da categoria que algum produto desta vitrine tem em estoque ou sob encomenda
    var tamanhos = [];
    var ordemTamanhos = lista(cat.tamanhos);
    if (ordemTamanhos.length > 1) {
      for (i = 0; i < ordemTamanhos.length; i++) {
        t = String(ordemTamanhos[i]);
        for (j = 0; j < base.length; j++) {
          if (situacaoTamanho(base[j], t) !== 'esgotado') {
            tamanhos.push(t);
            break;
          }
        }
      }
    }

    // "Só pronta entrega" só aparece se algum produto desta vitrine aceita encomenda.
    var temEncomenda = base.some(aceitaEncomenda);

    // Modelo: só aparece com 2 ou mais modelos na vitrine. Escolhida uma marca, lista só os modelos dela.
    var todosModelos = [];
    for (i = 0; i < base.length; i++) {
      m = rotuloModelo(base[i]);
      if (m && todosModelos.indexOf(m) === -1) todosModelos.push(m);
    }
    todosModelos.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
    var selModelo = todosModelos.length > 1 ? el('select', { id: 'filtro-modelo' }) : null;

    function preencherModelos() {
      if (!selModelo) return;
      var atual = selModelo.value;
      var marca = selMarca.value;
      var k;
      limpar(selModelo);
      selModelo.appendChild(el('option', { value: '', texto: 'Todos' }));
      for (k = 0; k < todosModelos.length; k++) {
        if (marca && !base.some(function (p) { return texto(p.marca) === marca && rotuloModelo(p) === todosModelos[k]; })) continue;
        selModelo.appendChild(el('option', { value: todosModelos[k], texto: todosModelos[k] }));
      }
      selModelo.value = atual;
      if (selModelo.value !== atual) selModelo.value = '';
    }

    var selMarca = el('select', { id: 'filtro-marca' }, [el('option', { value: '', texto: 'Todas' })]);
    for (i = 0; i < marcas.length; i++) selMarca.appendChild(el('option', { value: marcas[i], texto: marcas[i] }));

    var selTamanho = null;
    if (tamanhos.length) {
      selTamanho = el('select', { id: 'filtro-tamanho' }, [el('option', { value: '', texto: 'Todos' })]);
      for (i = 0; i < tamanhos.length; i++) selTamanho.appendChild(el('option', { value: tamanhos[i], texto: tamanhos[i] }));
    }

    var chkPromo = el('input', { type: 'checkbox', id: 'filtro-promocao' });
    var chkPronta = temEncomenda ? el('input', { type: 'checkbox', id: 'filtro-pronta' }) : null;

    var selOrdem = el('select', { id: 'filtro-ordem' }, [
      el('option', { value: 'novidades', texto: 'Novidades' }),
      el('option', { value: 'menor', texto: 'Menor preço' }),
      el('option', { value: 'maior', texto: 'Maior preço' })
    ]);

    var botaoLimpar = el('button', { type: 'button', classe: 'botao-texto', texto: 'Limpar filtros' });

    var filtros = el('form', { classe: 'filtros', 'aria-label': 'Filtrar produtos' }, [
      el('div', { classe: 'filtro' }, [el('label', { 'for': 'filtro-marca', texto: 'Marca' }), selMarca]),
      selModelo ? el('div', { classe: 'filtro' }, [el('label', { 'for': 'filtro-modelo', texto: 'Modelo' }), selModelo]) : null,
      selTamanho ? el('div', { classe: 'filtro' }, [el('label', { 'for': 'filtro-tamanho', texto: 'Tamanho' }), selTamanho]) : null,
      el('div', { classe: 'filtro' }, [el('label', { 'for': 'filtro-ordem', texto: 'Ordenar por' }), selOrdem]),
      el('div', { classe: 'filtro filtro-check' }, [chkPromo, el('label', { 'for': 'filtro-promocao', texto: 'Só promoções' })]),
      chkPronta ? el('div', { classe: 'filtro filtro-check' }, [chkPronta, el('label', { 'for': 'filtro-pronta', texto: 'Só pronta entrega' })]) : null,
      el('div', { classe: 'filtro filtro-acoes' }, [botaoLimpar])
    ]);

    var contagem = el('p', { classe: 'contagem', 'aria-live': 'polite' });
    var resultado = el('div', { classe: 'resultado' });

    function aplicar() {
      var marca = selMarca.value;
      var tamanho = selTamanho ? selTamanho.value : '';
      var soPromo = chkPromo.checked;
      var soPronta = chkPronta ? chkPronta.checked : false;
      var modelo = selModelo ? selModelo.value : '';
      var itens = base.filter(function (p) {
        if (marca && texto(p.marca) !== marca) return false;
        if (modelo && rotuloModelo(p) !== modelo) return false;
        if (soPromo && !emPromocao(p)) return false;
        if (tamanho && situacaoTamanho(p, tamanho) === 'esgotado') return false;
        if (soPronta && (tamanho ? estoqueDe(p, tamanho) <= 0 : estoqueTotal(p) <= 0)) return false;
        return true;
      });
      itens = ordenar(itens, selOrdem.value);

      // Conta cartões (cada modelo uma vez); se juntou cores, diz quantas são.
      var cartoes = agruparCores(itens).length;
      contagem.textContent = (cartoes === 1 ? '1 produto' : cartoes + ' produtos') +
        (itens.length > cartoes ? ' em ' + itens.length + ' cores' : '');
      limpar(resultado);
      if (itens.length) {
        resultado.appendChild(grade(itens));
        revelarAoRolar(resultado);
      } else {
        var limparAqui = el('button', { type: 'button', classe: 'botao', texto: 'Limpar filtros' });
        limparAqui.addEventListener('click', limparFiltros);
        resultado.appendChild(el('div', { classe: 'aviso' }, [
          el('h2', { classe: 'aviso-titulo', texto: 'Nenhum produto com esses filtros' }),
          el('p', { texto: 'Tente outra marca, outro tamanho ou desmarque as opções de filtro.' }),
          limparAqui
        ]));
      }
    }

    function limparFiltros() {
      selMarca.value = '';
      if (selModelo) { selModelo.value = ''; preencherModelos(); }
      if (selTamanho) selTamanho.value = '';
      selOrdem.value = 'novidades';
      chkPromo.checked = false;
      if (chkPronta) chkPronta.checked = false;
      aplicar();
    }

    selMarca.addEventListener('change', function () { preencherModelos(); aplicar(); });
    if (selModelo) selModelo.addEventListener('change', aplicar);
    preencherModelos();
    if (selTamanho) selTamanho.addEventListener('change', aplicar);
    selOrdem.addEventListener('change', aplicar);
    chkPromo.addEventListener('change', aplicar);
    if (chkPronta) chkPronta.addEventListener('change', aplicar);
    botaoLimpar.addEventListener('click', limparFiltros);
    filtros.addEventListener('submit', function (ev) { ev.preventDefault(); });

    conteudo.appendChild(el('div', { classe: 'secao' }, [filtros, contagem, resultado]));
    aplicar();
  }

  /* ================= produto.html ================= */

  function paginaProduto(p) {
    if (!p) {
      document.title = 'Produto não encontrado | ' + nomeLoja;
      conteudo.appendChild(el('div', { classe: 'secao' }, [
        caixaAviso(1, 'Produto não encontrado', 'Ele pode ter saído da loja ou o link está incompleto.',
          'Ver a loja', 'index.html')
      ]));
      return;
    }

    var cat = acharCategoria(p.categoria);
    var sub = acharSub(cat, p.subcategoria);
    var nome = texto(p.nome);
    var imgs = imagensDe(p);
    var i;

    document.title = nome + ' | ' + nomeLoja;
    definirDescricao(texto(p.descricao).split('\n')[0].substr(0, 160) || nome);

    // Galeria
    var principal = foto(imgs[0], nome, 'galeria-principal');
    var moldura = el('div', { classe: 'galeria-moldura' }, [principal]);
    var galeria = el('div', { classe: 'galeria' }, [moldura]);
    // Com mouse: passar por cima dá zoom na foto, no ponto em que o mouse está.
    if (podeAnimar() && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      moldura.classList.add('com-zoom');
      moldura.addEventListener('pointermove', function (e) {
        var r = moldura.getBoundingClientRect();
        principal.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' +
          ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
      });
    }
    if (imgs.length > 1) {
      var miniaturas = el('ul', { classe: 'galeria-miniaturas' });
      var botoesFoto = [];
      for (i = 0; i < imgs.length; i++) {
        botoesFoto.push(botaoMiniatura(imgs[i], i));
        miniaturas.appendChild(el('li', null, [botoesFoto[i]]));
      }
      galeria.appendChild(miniaturas);
    }

    function botaoMiniatura(src, indice) {
      var b = el('button', {
        type: 'button',
        classe: 'miniatura' + (indice === 0 ? ' miniatura-ativa' : ''),
        'aria-label': 'Ver foto ' + (indice + 1),
        'aria-pressed': indice === 0 ? 'true' : 'false'
      }, [fotoPequena(src, nome)]);
      b.addEventListener('click', function () {
        var k;
        principal.setAttribute('src', src);
        if (podeAnimar()) { // a foto nova entra com movimento
          principal.classList.remove('foto-entra');
          void principal.offsetWidth;
          principal.classList.add('foto-entra');
        }
        for (k = 0; k < botoesFoto.length; k++) {
          botoesFoto[k].classList.remove('miniatura-ativa');
          botoesFoto[k].setAttribute('aria-pressed', 'false');
        }
        b.classList.add('miniatura-ativa');
        b.setAttribute('aria-pressed', 'true');
      });
      return b;
    }

    // Outras cores: produtos da mesma marca, modelo e subcategoria, na ordem do catálogo.
    var variantes = produtos.filter(function (o) { return o === p || mesmoModelo(o, p); })
      .sort(function (a, b) { return a._ordem - b._ordem; });
    var blocoCores = null;
    if (variantes.length > 1) {
      var listaCores = el('ul', { classe: 'cores-lista' });
      for (i = 0; i < variantes.length; i++) {
        var v = variantes[i];
        var miolo = [fotoPequena(imagensDe(v)[0], nome + ' ' + texto(v.cor)), el('span', { classe: 'cor-nome', texto: texto(v.cor) || 'Outra cor' })];
        listaCores.appendChild(el('li', null, [
          v === p
            ? el('span', { classe: 'cor-opcao cor-atual', 'aria-current': 'true' }, miolo)
            : el('a', { href: linkProduto(v.id), classe: 'cor-opcao', 'aria-label': 'Ver na cor ' + (texto(v.cor) || 'outra') }, miolo)
        ]));
      }
      blocoCores = el('div', { classe: 'cores' }, [
        el('p', { classe: 'cores-titulo' }, ['Cor: ', el('span', { classe: 'cor-escolhida', texto: texto(p.cor) })]),
        listaCores
      ]);
    }

    // Dados: cor (quando não há outras cores) + campos extras da categoria, com o rótulo do catálogo
    var dados = el('dl', { classe: 'produto-dados' });
    if (texto(p.cor) && !blocoCores) {
      dados.appendChild(el('div', null, [el('dt', { texto: 'Cor' }), el('dd', { texto: p.cor })]));
    }
    var campos = (cat && cat.camposExtras) || {};
    var extras = p.extras || {};
    var chave, rotulo;
    for (chave in campos) {
      if (!Object.prototype.hasOwnProperty.call(campos, chave)) continue;
      if (!texto(extras[chave])) continue;
      rotulo = texto(campos[chave] && campos[chave].rotulo) || chave;
      dados.appendChild(el('div', null, [el('dt', { texto: rotulo }), el('dd', { texto: extras[chave] })]));
    }

    // Tamanhos: com estoque (pronta entrega), sob encomenda (borda tracejada) ou esgotados (riscados).
    var tamanhoEscolhido = '';
    var escolhidoTexto = el('span', { classe: 'tamanho-escolhido' });
    var situacaoEscolhida = el('span', { classe: 'tamanho-situacao' });
    situacaoEscolhida.hidden = true;
    var avisoTamanho = el('p', { classe: 'aviso-tamanho', role: 'alert' });
    avisoTamanho.hidden = true;
    var botoesTamanho = [];
    var disponiveis = [];
    var qtdPronta = 0;
    var qtdEncomenda = 0;
    var tams = tamanhosOrdenados(p, cat);
    var gradeTamanhos = el('div', { classe: 'tamanhos-lista', role: 'group', 'aria-label': 'Tamanhos' });

    for (i = 0; i < tams.length; i++) {
      gradeTamanhos.appendChild(botaoTamanho(tams[i]));
    }

    function botaoTamanho(t) {
      var situacao = situacaoTamanho(p, t);
      var classes = { pronta: '', encomenda: ' tamanho-encomenda', esgotado: ' tamanho-indisponivel' };
      var rotulos = { pronta: '', encomenda: ', sob encomenda', esgotado: ', esgotado' };
      var b = el('button', {
        type: 'button',
        classe: 'tamanho' + classes[situacao],
        disabled: situacao === 'esgotado',
        'aria-pressed': 'false',
        'aria-label': 'Tamanho ' + t + rotulos[situacao],
        title: situacao === 'encomenda' ? 'Sob encomenda' : null,
        texto: t
      });
      if (situacao !== 'esgotado') {
        disponiveis.push(t);
        if (situacao === 'pronta') qtdPronta++;
        else qtdEncomenda++;
        b.addEventListener('click', function () { escolherTamanho(t); });
      }
      botoesTamanho.push({ tamanho: t, botao: b });
      return b;
    }

    function escolherTamanho(t) {
      var k;
      var encomenda = situacaoTamanho(p, t) === 'encomenda';
      tamanhoEscolhido = t;
      for (k = 0; k < botoesTamanho.length; k++) {
        var ativo = botoesTamanho[k].tamanho === t;
        if (ativo) botoesTamanho[k].botao.classList.add('tamanho-ativo');
        else botoesTamanho[k].botao.classList.remove('tamanho-ativo');
        botoesTamanho[k].botao.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      }
      escolhidoTexto.textContent = t;
      situacaoEscolhida.textContent = encomenda ? 'Sob encomenda' : 'Pronta entrega';
      situacaoEscolhida.className = 'tamanho-situacao ' + (encomenda ? 'situacao-encomenda' : 'situacao-pronta');
      situacaoEscolhida.hidden = false;
      avisoTamanho.hidden = true;
      atualizarCompra();
    }

    // Legenda só quando o produto mistura tamanhos em estoque e sob encomenda.
    var legenda = null;
    if (qtdPronta && qtdEncomenda) {
      legenda = el('p', { classe: 'tamanhos-legenda' }, [
        el('span', { classe: 'legenda-item' }, [el('span', { classe: 'legenda-amostra', 'aria-hidden': 'true' }), 'Pronta entrega']),
        el('span', { classe: 'legenda-item' }, [el('span', { classe: 'legenda-amostra legenda-amostra-encomenda', 'aria-hidden': 'true' }), 'Sob encomenda'])
      ]);
    }

    var blocoTamanhos = el('div', { classe: 'tamanhos' }, [
      el('p', { classe: 'tamanhos-titulo' }, ['Tamanho: ', escolhidoTexto, situacaoEscolhida]),
      gradeTamanhos,
      legenda,
      avisoTamanho
    ]);

    // Compra. Tamanho em estoque: carrinho do site quando as vendas estiverem ligadas; antes disso, WhatsApp.
    // Tamanho sob encomenda: sempre pelo WhatsApp, com modelo, cor e tamanho na mensagem.
    var zap = soNumeros(contato.whatsapp);
    var compra;
    var acaoPronta = null;
    var acaoEncomenda = null;
    var linksWhats = []; // { botao, tipo }: o link muda quando o cliente troca de tamanho

    function mensagemWhatsApp(tipo) {
      var linhas = [
        tipo === 'encomenda' ? 'Olá! Quero encomendar este produto:' : 'Olá! Quero comprar este produto:',
        nome + (texto(p.cor) ? ' (' + texto(p.cor) + ')' : ''),
        'Tamanho: ' + tamanhoEscolhido,
        'Preço: ' + dinheiro(precoFinal(p))
      ];
      if (/^https?:$/.test(window.location.protocol)) linhas.push(window.location.href);
      return linhas.join('\n');
    }

    function botaoWhatsApp(rotulo, tipo, pedirTamanho) {
      var b = el('a', {
        href: 'https://wa.me/' + zap,
        target: '_blank',
        rel: 'noopener',
        classe: 'botao botao-compra botao-whatsapp',
        texto: rotulo
      });
      b.addEventListener('click', function (ev) {
        if (!tamanhoEscolhido) {
          ev.preventDefault();
          avisoTamanho.textContent = pedirTamanho;
          avisoTamanho.hidden = false;
        }
      });
      linksWhats.push({ botao: b, tipo: tipo });
      return b;
    }

    // Põe a mensagem certa nos links do WhatsApp e mostra a ação do tamanho escolhido.
    function atualizarCompra() {
      var k, situacao;
      for (k = 0; k < linksWhats.length; k++) {
        linksWhats[k].botao.setAttribute('href', 'https://wa.me/' + zap +
          (tamanhoEscolhido ? '?text=' + encodeURIComponent(mensagemWhatsApp(linksWhats[k].tipo)) : ''));
      }
      if (!acaoPronta || !acaoEncomenda) return;
      situacao = tamanhoEscolhido ? situacaoTamanho(p, tamanhoEscolhido) : 'pronta';
      acaoPronta.hidden = situacao === 'encomenda';
      acaoEncomenda.hidden = situacao !== 'encomenda';
    }

    if (!disponiveis.length) {
      compra = el('div', { classe: 'compra' }, [
        el('p', { classe: 'compra-esgotado', texto: 'Produto esgotado no momento.' }),
        el('button', { type: 'button', classe: 'botao botao-compra', disabled: true, texto: 'Esgotado' })
      ]);
    } else {
      if (qtdPronta && vendasAbertas()) {
        var botaoCompra = el('button', { type: 'button', classe: 'botao botao-compra', texto: 'Adicionar ao carrinho' });
        var avisoCarrinho = el('p', { classe: 'compra-nota', role: 'status' });
        botaoCompra.addEventListener('click', function () {
          var r;
          if (!tamanhoEscolhido) {
            avisoTamanho.textContent = 'Escolha o tamanho antes de adicionar ao carrinho.';
            avisoTamanho.hidden = false;
            return;
          }
          r = adicionarAoCarrinho(p.id, tamanhoEscolhido, 1);
          limpar(avisoCarrinho);
          if (r.ok) {
            avisoCarrinho.appendChild(document.createTextNode('Adicionado ao carrinho. '));
            avisoCarrinho.appendChild(el('a', { href: 'carrinho.html', texto: 'Ver carrinho' }));
          } else {
            avisoCarrinho.textContent = r.mensagem;
          }
        });
        acaoPronta = el('div', { classe: 'compra-acao' }, [botaoCompra, avisoCarrinho]);
      } else if (qtdPronta && zap) {
        acaoPronta = el('div', { classe: 'compra-acao' }, [
          botaoWhatsApp('Comprar pelo WhatsApp', 'compra', 'Escolha o tamanho antes de comprar.')
        ]);
      } else if (qtdPronta) {
        acaoPronta = el('div', { classe: 'compra-acao' }, [
          el('button', { type: 'button', classe: 'botao botao-compra', disabled: true, texto: 'Compra pelo site em breve' }),
          el('p', { classe: 'compra-nota', texto: 'Em breve você poderá comprar por aqui.' })
        ]);
      }

      if (qtdEncomenda) {
        var prazo = prazoEncomenda();
        acaoEncomenda = el('div', { classe: 'compra-acao' }, [
          botaoWhatsApp('Encomendar pelo WhatsApp', 'encomenda', 'Escolha o tamanho que você quer encomendar.'),
          el('p', { classe: 'compra-nota' }, prazo ? [
            qtdPronta ? 'Este tamanho não está em estoque, mas a gente encomenda para você. '
                      : 'Sem estoque no momento, mas a gente encomenda para você. ',
            'Prazo da encomenda: ' + prazo + '. Dúvidas? ',
            el('a', {
              href: 'https://wa.me/' + zap + '?text=' + encodeURIComponent('Olá! Tenho uma dúvida sobre a encomenda deste produto: ' +
                nome + (texto(p.cor) ? ' (' + texto(p.cor) + ')' : '')),
              target: '_blank',
              rel: 'noopener',
              texto: 'Mande uma mensagem'
            }),
            '.'
          ] : [
            qtdPronta ? 'Este tamanho não está em estoque, mas a gente encomenda para você. '
                      : 'Sem estoque no momento, mas a gente encomenda para você. ',
            'O prazo é combinado pelo WhatsApp.'
          ])
        ]);
      }

      compra = el('div', { classe: 'compra' }, [acaoPronta, acaoEncomenda]);
      atualizarCompra();
    }

    // Favoritar: o botão é ligado por js/pedidos.js (precisa da conta do cliente).
    if (contasAtivas()) {
      compra.appendChild(el('button', {
        type: 'button',
        classe: 'botao-favorito',
        'data-favorito': p.id,
        'aria-pressed': 'false'
      }, [icone('coracao'), el('span', { texto: 'Favoritar' })]));
    }

    // Monta a página
    var info = el('div', { classe: 'produto-info' }, [
      texto(p.marca) ? el('span', { classe: 'produto-marca', texto: p.marca }) : null,
      el('h1', { classe: 'produto-nome', texto: nome }),
      el('div', { classe: 'produto-preco-linha' }, [
        blocoPreco(p, 'produto-preco'),
        emPromocao(p) ? el('span', { classe: 'selo selo-desconto', texto: '-' + desconto(p) + '%' }) : null
      ]),
      dados,
      blocoCores,
      blocoTamanhos,
      compra
    ]);

    var trilhaItens = [{ texto: 'Início', href: 'index.html' }];
    if (cat) trilhaItens.push({ texto: cat.nome, href: linkCategoria(cat.id) });
    if (cat && sub && lista(cat.subcategorias).length > 1) trilhaItens.push({ texto: sub.nome, href: linkCategoria(cat.id, sub.id) });
    trilhaItens.push({ texto: nome });

    conteudo.appendChild(el('div', { classe: 'secao secao-topo' }, [trilha(trilhaItens)]));
    conteudo.appendChild(el('article', { classe: 'secao produto' }, [galeria, info]));

    if (texto(p.descricao)) {
      conteudo.appendChild(secao('descricao', 'Descrição', [el('div', { classe: 'descricao', texto: p.descricao })]));
    }

    // Com um único tamanho disponível (ex.: "Único"), já deixa escolhido.
    if (disponiveis.length === 1) escolherTamanho(disponiveis[0]);

    // Veja também: outros produtos da mesma subcategoria (as outras cores já aparecem lá em cima)
    var parecidos = ordenar(produtos.filter(function (o) {
      return o !== p && !mesmoModelo(o, p) && o.categoria === p.categoria && o.subcategoria === p.subcategoria;
    }), 'novidades');
    if (parecidos.length) {
      conteudo.appendChild(secao('veja-tambem', 'Veja também', [grade(parecidos, MAX_VEJA_TAMBEM)]));
    }
  }

  // Carrinho aberto em outra aba: atualiza o número no topo.
  window.addEventListener('storage', function (e) {
    if (e.key === CHAVE_CARRINHO) atualizarContadorCarrinho();
  });

  // Ferramentas usadas por js/pedidos.js (contas, carrinho e pedidos).
  window.Loja = {
    catalogo: CAT,
    loja: loja,
    contato: contato,
    nomeLoja: nomeLoja,
    pagina: pagina,
    conteudo: conteudo,
    el: el,
    texto: texto,
    lista: lista,
    limpar: limpar,
    parametro: parametro,
    dinheiro: dinheiro,
    soNumeros: soNumeros,
    formatarTelefone: formatarTelefone,
    acharProduto: acharProduto,
    precoFinal: precoFinal,
    estoqueDe: estoqueDe,
    imagensDe: imagensDe,
    foto: foto,
    fotoPequena: fotoPequena,
    grade: grade,
    caixaAviso: caixaAviso,
    linkProduto: linkProduto,
    icone: icone,
    definirTitulo: definirTitulo,
    contasAtivas: contasAtivas,
    vendasAbertas: vendasAbertas,
    configPix: configPix,
    regioesEntrega: regioesEntrega,
    lerCarrinho: lerCarrinho,
    salvarCarrinho: salvarCarrinho
  };
})();
