/*
  Cadastro de produtos (cadastro.html): a tela do dono para criar, editar, tirar do site e excluir produtos.

  Como funciona
  - O catálogo continua sendo o arquivo dados/catalogo.js. Esta tela lê e grava esse arquivo direto
    no GitHub, junto com as fotos (repositório, ramo e pasta em js/cadastro-config.js).
  - Cada "Salvar" vira um commit no ramo do site, e o GitHub Pages publica sozinho em 1 ou 2 minutos.
  - O "login" é uma chave de acesso do GitHub (fine-grained token) que só mexe nos arquivos deste
    repositório. Ela fica guardada só no navegador de quem entrou.
  - O navegador diminui as fotos antes de enviar: a grande com até 1000 px e a miniatura
    (img/produtos/mini/, usada nos cartões da vitrine) com até 600 px, as duas em JPG.
  - Na hora de salvar, a tela lê o catálogo de novo no GitHub e aplica só a mudança deste produto.
    Assim uma mudança feita em outro aparelho, no meio-tempo, não se perde.
  Textos entram sempre com textContent (nunca innerHTML).
*/
(function () {
  'use strict';

  var API = 'https://api.github.com';
  var CFG = window.CADASTRO || {};
  var REPO = texto(CFG.repositorio);
  var RAMO = texto(CFG.ramo) || 'main';
  var PASTA = texto(CFG.pasta).replace(/^\/+|\/+$/g, '');
  var ARQ_CATALOGO = 'dados/catalogo.js';
  var DIR_FOTOS = 'img/produtos/';
  var SEM_FOTO = 'img/sem-foto.svg';
  var FOTO_GRANDE = 1000;          // maior lado da foto grande, em pixels (igual às fotos que já estão no site)
  var FOTO_MINI = 600;             // maior lado da miniatura
  var QUALIDADE_JPG = 0.82;
  var MAX_FOTOS = 8;
  var LARGURA_LINHA = 140;         // ao gravar o catálogo, listas e objetos curtos ficam numa linha só (como no arquivo)
  var DUAS_CASAS = { preco: true, precoPromocional: true, valor: true }; // gravados como 499.00, e não 499
  var CHAVE_TOKEN = 'cadastro-chave-github';
  var ESPERA_PUBLICACAO_MS = 6000; // de quanto em quanto tempo pergunta ao GitHub se o site já foi publicado
  var LIMITE_PUBLICACAO_MS = 8 * 60 * 1000;

  var topo = document.getElementById('topo');
  var conteudo = document.getElementById('conteudo');

  var estado = {
    token: '',
    usuario: '',
    catalogo: null,     // catálogo lido do GitHub
    arquivos: {},       // arquivos do site no GitHub (caminho dentro da pasta do site -> true)
    lidoEm: null,       // hora da última leitura
    previas: {},        // fotos enviadas nesta visita (caminho -> endereço blob:), para aparecerem antes de publicar
    sujo: false,        // formulário com mudança ainda não salva
    rotaAtual: '',
    filtros: { busca: '', categoria: '', situacao: '' },
    aviso: null,        // faixa no alto da lista: { fase, produto, link, excluido }
    avisoEl: null,
    vigia: null         // timer que acompanha a publicação do site
  };

  var formatador = null;
  try {
    formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (e) {
    formatador = null;
  }

  iniciar();

  /* ================= início ================= */

  function iniciar() {
    montarTopo();
    if (!/^[\w.-]+\/[\w.-]+$/.test(REPO)) {
      telaAviso('Cadastro sem repositório', 'Falta dizer em js/cadastro-config.js em qual repositório do GitHub está o site.');
      return;
    }
    if (!window.fetch || !window.Promise || !window.TextDecoder || !window.FileReader) {
      telaAviso('Navegador antigo', 'Abra o cadastro num navegador atualizado (Chrome, Edge, Firefox ou Safari).');
      return;
    }
    window.addEventListener('hashchange', aoMudarHash);
    window.addEventListener('beforeunload', function (ev) {
      if (!estado.sujo) return;
      ev.preventDefault();
      ev.returnValue = '';
    });
    estado.token = lerToken();
    if (!estado.token) {
      telaEntrar('');
      return;
    }
    abrirCatalogo();
  }

  function abrirCatalogo() {
    telaCarregando('Abrindo o catálogo...');
    Promise.all([lerDoGitHub(), quemSou()]).then(function (r) {
      aplicarLeitura(r[0]);
      estado.usuario = r[1];
      montarTopo();
      desenharRota();
    }).catch(tratarErroGeral);
  }

  function aplicarLeitura(lido) {
    estado.catalogo = lido.catalogo;
    estado.arquivos = lido.arquivos;
    estado.lidoEm = new Date();
  }

  function quemSou() {
    return api('GET', '/user').then(function (u) {
      return texto(u && u.login);
    }, function () {
      return '';
    });
  }

  function tratarErroGeral(e) {
    if (e && e.status === 401) {
      sair(mensagemErro(e));
      return;
    }
    limpar(conteudo);
    var tentar = el('button', { type: 'button', classe: 'botao', texto: 'Tentar de novo' });
    var botaoSair = el('button', { type: 'button', classe: 'botao botao-fantasma', texto: 'Sair' });
    tentar.addEventListener('click', abrirCatalogo);
    botaoSair.addEventListener('click', function () { sair(''); });
    conteudo.appendChild(el('section', { classe: 'limite secao-topo' }, [
      el('div', { classe: 'aviso' }, [
        el('h1', { classe: 'aviso-titulo', texto: 'Não consegui abrir o catálogo' }),
        el('p', { texto: mensagemErro(e) }),
        el('div', { classe: 'botoes cad-botoes-centro' }, [tentar, botaoSair])
      ])
    ]));
  }

  /* ================= navegação (#novo, #editar/<id>, #cor/<id>) ================= */

  function rota() {
    var h = String(window.location.hash || '').replace(/^#\/?/, '');
    var m;
    try { h = decodeURIComponent(h); } catch (e) { /* endereço quebrado: vai para a lista */ }
    if (h === 'novo') return { tela: 'novo' };
    m = /^(editar|cor)\/(.+)$/.exec(h);
    if (m) return { tela: m[1], id: m[2] };
    return { tela: 'lista' };
  }

  function aoMudarHash() {
    if (estado.sujo && !window.confirm('Sair sem salvar? O que você mudou neste produto vai ser perdido.')) {
      // Fica no formulário (troca o endereço de volta sem disparar outra mudança)
      window.history.replaceState(null, '', estado.rotaAtual || '#');
      return;
    }
    estado.sujo = false;
    desenharRota();
  }

  function irPara(destino) {
    var atual = String(window.location.hash || '').replace(/^#/, '');
    if (atual === destino) {
      desenharRota();
      return;
    }
    window.location.hash = destino; // dispara aoMudarHash
  }

  function desenharRota() {
    var r = rota();
    var p;
    if (!estado.catalogo) return;
    estado.rotaAtual = window.location.hash || '#';
    estado.avisoEl = null;
    if (r.tela === 'novo') {
      telaFormulario('novo', null);
    } else if (r.tela === 'editar' || r.tela === 'cor') {
      p = acharProduto(r.id);
      if (!p) {
        estado.aviso = { fase: 'nao-achou' };
        irPara('');
        return;
      }
      telaFormulario(r.tela, p);
    } else {
      telaLista();
    }
    window.scrollTo(0, 0);
  }

  /* ================= cabeçalho ================= */

  function montarTopo() {
    var nome = estado.catalogo && estado.catalogo.loja ? texto(estado.catalogo.loja.nome) : '';
    var sairBotao = null;
    if (estado.token && estado.catalogo) {
      sairBotao = el('button', { type: 'button', classe: 'cad-sair', texto: 'Sair' });
      sairBotao.addEventListener('click', function () {
        if (estado.sujo && !window.confirm('Sair sem salvar? O que você mudou neste produto vai ser perdido.')) return;
        sair('');
      });
    }
    limpar(topo);
    topo.appendChild(el('div', { classe: 'topo-interno' }, [
      el('a', { href: '#', classe: 'logo cad-logo' }, nome
        ? [nome, el('span', { classe: 'cad-logo-sub', texto: 'Cadastro' })]
        : ['Área do dono']),
      el('div', { classe: 'topo-acoes' }, [
        el('a', { href: 'index.html', target: '_blank', rel: 'noopener', classe: 'tema-botao', title: 'Abrir a loja', 'aria-label': 'Abrir a loja (em outra aba)' }, [icone('loja')]),
        botaoTema(),
        sairBotao
      ])
    ]));
  }

  function temaAtual() {
    return document.documentElement.getAttribute('data-tema') === 'escuro' ? 'escuro' : 'claro';
  }

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
      try { window.localStorage.setItem('tema', novo); } catch (e) { /* sem armazenamento: troca só nesta página */ }
      atualizar();
    });
    atualizar();
    return b;
  }

  function icone(tipo) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    var desenhos = {
      sol: [['circle', { cx: '12', cy: '12', r: '4' }],
            ['path', { d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' }]],
      lua: [['path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }]],
      loja: [['path', { d: 'M3 9l1.5-5h15L21 9' }], ['path', { d: 'M4 9v11h16V9' }], ['path', { d: 'M3 9h18' }], ['path', { d: 'M9 20v-6h6v6' }]]
    };
    var formas = desenhos[tipo] || desenhos.lua;
    var i, k, forma;
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    for (i = 0; i < formas.length; i++) {
      forma = document.createElementNS(ns, formas[i][0]);
      for (k in formas[i][1]) {
        if (Object.prototype.hasOwnProperty.call(formas[i][1], k)) forma.setAttribute(k, formas[i][1][k]);
      }
      svg.appendChild(forma);
    }
    return svg;
  }

  /* ================= entrar e sair ================= */

  function lerToken() {
    var t = '';
    try { t = window.sessionStorage.getItem(CHAVE_TOKEN) || ''; } catch (e) { t = ''; }
    if (!t) {
      try { t = window.localStorage.getItem(CHAVE_TOKEN) || ''; } catch (e) { t = ''; }
    }
    return t;
  }

  function guardarToken(t, lembrar) {
    apagarToken();
    try {
      if (lembrar) window.localStorage.setItem(CHAVE_TOKEN, t);
      else window.sessionStorage.setItem(CHAVE_TOKEN, t);
    } catch (e) { /* navegador sem armazenamento: vale só enquanto a página estiver aberta */ }
  }

  function apagarToken() {
    try { window.localStorage.removeItem(CHAVE_TOKEN); } catch (e) { /* nada a apagar */ }
    try { window.sessionStorage.removeItem(CHAVE_TOKEN); } catch (e) { /* nada a apagar */ }
  }

  function sair(motivo) {
    pararVigia();
    apagarToken();
    estado.token = '';
    estado.usuario = '';
    estado.catalogo = null;
    estado.sujo = false;
    estado.aviso = null;
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
    telaEntrar(motivo);
  }

  // Link que abre a criação da chave no GitHub já preenchida (nome, validade de 1 ano e permissões).
  // O GitHub não deixa preencher o repositório: isso a pessoa escolhe na tela.
  function linkNovaChave() {
    var partes = REPO.split('/');
    return 'https://github.com/settings/personal-access-tokens/new?' + [
      'name=' + encodeURIComponent(('Cadastro ' + partes[1]).slice(0, 40)),
      'description=' + encodeURIComponent('Tela de cadastro de produtos do site (' + REPO + ').'),
      'target_name=' + encodeURIComponent(partes[0]),
      'expires_in=366',
      'contents=write',
      'actions=read'
    ].join('&');
  }

  function telaEntrar(erro) {
    var campo = el('input', {
      id: 'chave', type: 'password', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off',
      placeholder: 'github_pat_...', 'aria-describedby': 'chave-dica'
    });
    var lembrar = el('input', { id: 'lembrar', type: 'checkbox', checked: true });
    var msg = el('p', { classe: 'mensagem mensagem-erro', role: 'alert', hidden: !erro, texto: erro || '' });
    var botao = el('button', { type: 'submit', classe: 'botao botao-largo', texto: 'Entrar' });
    var nomeRepo = REPO.split('/')[1];
    var form = el('form', { classe: 'formulario', novalidate: true }, [
      msg,
      el('div', { classe: 'campo' }, [
        el('label', { for: 'chave', texto: 'Chave de acesso do GitHub' }),
        campo,
        el('p', { id: 'chave-dica', classe: 'campo-dica', texto: 'Ela só deixa mexer nos arquivos do site, e fica guardada só neste navegador.' })
      ]),
      el('div', { classe: 'campo-check' }, [lembrar, el('label', { for: 'lembrar', texto: 'Lembrar neste aparelho' })]),
      botao
    ]);

    form.addEventListener('submit', function (ev) {
      var chave = campo.value.replace(/\s+/g, '');
      ev.preventDefault();
      if (!chave) {
        msg.textContent = 'Cole a sua chave de acesso.';
        msg.hidden = false;
        campo.focus();
        return;
      }
      botao.disabled = true;
      botao.textContent = 'Entrando...';
      estado.token = chave;
      api('GET', rotaRepo('')).then(function () {
        guardarToken(chave, lembrar.checked);
        abrirCatalogo();
      }).catch(function (e) {
        estado.token = '';
        botao.disabled = false;
        botao.textContent = 'Entrar';
        msg.textContent = e && e.status === 401
          ? 'O GitHub não aceitou esta chave. Confira se copiou ela inteira (começa com github_pat_) ou crie uma nova.'
          : mensagemErro(e);
        msg.hidden = false;
      });
    });

    montarTopo();
    limpar(conteudo);
    conteudo.appendChild(el('section', { classe: 'limite secao-topo cad-entrar' }, [
      el('div', { classe: 'grupo' }, [
        el('h1', { classe: 'pagina-titulo', texto: 'Cadastro de produtos' }),
        el('p', { classe: 'grupo-texto', texto: 'Área do dono da loja. Aqui você cadastra, muda e tira produtos do site. Cada mudança vai para o ar sozinha em 1 ou 2 minutos.' }),
        form
      ]),
      el('details', { classe: 'grupo cad-ajuda' }, [
        el('summary', { texto: 'Ainda não tenho a chave: como criar' }),
        el('ol', { classe: 'cad-passos' }, [
          el('li', null, [
            el('a', { href: linkNovaChave(), target: '_blank', rel: 'noopener', texto: 'Abra a criação da chave no GitHub' }),
            ' e entre na sua conta, se ele pedir. O nome, a validade e as permissões já vêm preenchidos.'
          ]),
          el('li', null, ['Em ', el('strong', { texto: 'Repository access' }), ', escolha ', el('strong', { texto: 'Only select repositories' }), ' e marque ', el('strong', { texto: nomeRepo }), '.']),
          el('li', null, ['Em ', el('strong', { texto: 'Permissions' }), ', confira: ', el('strong', { texto: 'Contents' }), ' em "Read and write" e ', el('strong', { texto: 'Actions' }), ' em "Read-only".']),
          el('li', null, ['Clique em ', el('strong', { texto: 'Generate token' }), ' e copie a chave (ela começa com github_pat_).']),
          el('li', null, ['Cole a chave aqui em cima e clique em ', el('strong', { texto: 'Entrar' }), '.'])
        ]),
        el('p', { classe: 'campo-dica', texto: 'A chave vale por 1 ano. Quando vencer, crie outra do mesmo jeito. Se perder o aparelho, apague a chave no GitHub, em Settings › Developer settings › Personal access tokens.' })
      ])
    ]));
    if (!erro) campo.focus();
  }

  /* ================= telas simples ================= */

  function telaCarregando(frase) {
    limpar(conteudo);
    conteudo.appendChild(el('section', { classe: 'limite secao-topo' }, [
      el('p', { classe: 'carregando', role: 'status', texto: frase })
    ]));
  }

  function telaAviso(titulo, frase) {
    limpar(conteudo);
    conteudo.appendChild(el('section', { classe: 'limite secao-topo' }, [
      el('div', { classe: 'aviso' }, [
        el('h1', { classe: 'aviso-titulo', texto: titulo }),
        el('p', { texto: frase })
      ])
    ]));
  }

  /* ================= lista de produtos ================= */

  function telaLista() {
    var cat = estado.catalogo;
    var produtos = lista(cat.produtos);
    var f = estado.filtros;
    var busca = el('input', { type: 'search', id: 'busca', placeholder: 'Buscar por nome, marca ou cor', autocomplete: 'off', value: f.busca });
    var selCat = el('select', { id: 'filtro-categoria' }, [el('option', { value: '', texto: 'Todas' })].concat(
      lista(cat.categorias).map(function (c) { return el('option', { value: c.id, texto: texto(c.nome) || c.id }); })
    ));
    var selSit = el('select', { id: 'filtro-situacao' }, [
      ['', 'Todos'], ['site', 'No site'], ['fora', 'Fora do site'], ['promo', 'Em promoção'], ['sem', 'Sem estoque']
    ].map(function (o) { return el('option', { value: o[0], texto: o[1] }); }));
    var contagem = el('p', { classe: 'cad-contagem', role: 'status' });
    var listaEl = el('ul', { classe: 'cad-lista' });
    var atualizar = el('button', { type: 'button', classe: 'botao-texto', texto: 'Ler de novo do GitHub' });

    selCat.value = f.categoria;
    selSit.value = f.situacao;

    function passa(p) {
      var termo = semAcento(f.busca.toLowerCase()).trim();
      var alvo;
      if (f.categoria && p.categoria !== f.categoria) return false;
      if (f.situacao === 'site' && p.ativo === false) return false;
      if (f.situacao === 'fora' && p.ativo !== false) return false;
      if (f.situacao === 'promo' && !emPromocao(p)) return false;
      if (f.situacao === 'sem' && estoqueTotal(p) > 0) return false;
      if (!termo) return true;
      alvo = semAcento([p.nome, p.marca, p.cor, p.id].concat(valoresDe(p.extras)).map(texto).join(' ').toLowerCase());
      return termo.split(/\s+/).every(function (t) { return alvo.indexOf(t) >= 0; });
    }

    function desenhar() {
      var visiveis = produtos.filter(passa);
      limpar(listaEl);
      visiveis.forEach(function (p) { listaEl.appendChild(linhaProduto(p)); });
      if (!produtos.length) contagem.textContent = 'Nenhum produto cadastrado ainda.';
      else if (visiveis.length === produtos.length) contagem.textContent = produtos.length + (produtos.length === 1 ? ' produto' : ' produtos');
      else contagem.textContent = visiveis.length + ' de ' + produtos.length + ' produtos';
    }

    busca.addEventListener('input', function () { f.busca = busca.value; desenhar(); });
    selCat.addEventListener('change', function () { f.categoria = selCat.value; desenhar(); });
    selSit.addEventListener('change', function () { f.situacao = selSit.value; desenhar(); });
    atualizar.addEventListener('click', function () {
      telaCarregando('Lendo o catálogo do GitHub...');
      lerDoGitHub().then(function (lido) {
        aplicarLeitura(lido);
        telaLista();
      }).catch(tratarErroGeral);
    });

    limpar(conteudo);
    estado.avisoEl = el('div', { classe: 'cad-aviso-lugar', 'aria-live': 'polite' });
    conteudo.appendChild(el('section', { classe: 'limite secao-topo cad-pagina' }, [
      estado.avisoEl,
      el('div', { classe: 'cad-cabeca' }, [
        el('h1', { classe: 'pagina-titulo', texto: 'Produtos' }),
        el('a', { href: '#novo', classe: 'botao', texto: '+ Novo produto' })
      ]),
      el('div', { classe: 'cad-filtros' }, [
        el('div', { classe: 'campo cad-filtro-busca' }, [el('label', { for: 'busca', texto: 'Buscar' }), busca]),
        el('div', { classe: 'campo' }, [el('label', { for: 'filtro-categoria', texto: 'Categoria' }), selCat]),
        el('div', { classe: 'campo' }, [el('label', { for: 'filtro-situacao', texto: 'Situação' }), selSit])
      ]),
      contagem,
      listaEl,
      el('p', { classe: 'cad-rodape' }, [
        (estado.usuario ? 'Você entrou como ' + estado.usuario + '. ' : '') +
          'Catálogo lido do GitHub às ' + hora(estado.lidoEm) + '. ',
        atualizar
      ])
    ]));
    desenharAviso();
    desenhar();
  }

  function linhaProduto(p) {
    var imgs = lista(p.imagens);
    var selos = [];
    if (p.ativo === false) selos.push(el('span', { classe: 'cad-selo cad-selo-fora', texto: 'Fora do site' }));
    if (emPromocao(p)) selos.push(el('span', { classe: 'cad-selo cad-selo-promo', texto: '-' + desconto(p) + '%' }));
    if (p.destaque === true) selos.push(el('span', { classe: 'cad-selo', texto: 'Destaque' }));
    if (p.fixarNoTopo === true) selos.push(el('span', { classe: 'cad-selo', texto: 'Fixado no topo' }));
    return el('li', null, [
      el('a', { href: '#editar/' + encodeURIComponent(p.id), classe: 'cad-item' + (p.ativo === false ? ' cad-item-fora' : '') }, [
        el('span', { classe: 'cad-item-foto' }, [imgs.length ? fotoPrevia(texto(imgs[0]), true) : el('img', { src: SEM_FOTO, alt: '' })]),
        el('span', { classe: 'cad-item-info' }, [
          el('strong', { classe: 'cad-item-nome', texto: texto(p.nome) || '(sem nome)' }),
          el('span', { classe: 'cad-item-detalhe', texto: [texto(p.cor), nomeCategoria(p)].filter(Boolean).join(' · ') }),
          el('span', { classe: 'cad-item-detalhe', texto: resumoEstoque(p) }),
          selos.length ? el('span', { classe: 'cad-selos' }, selos) : null
        ]),
        el('span', { classe: 'cad-item-preco' }, blocoPreco(p))
      ])
    ]);
  }

  function blocoPreco(p) {
    if (emPromocao(p)) {
      return [el('s', { texto: dinheiro(p.preco) }), el('strong', { texto: dinheiro(p.precoPromocional) })];
    }
    return [el('strong', { texto: typeof p.preco === 'number' ? dinheiro(p.preco) : 'Sem preço' })];
  }

  function resumoEstoque(p) {
    var total = estoqueTotal(p);
    var tams = lista(p.tamanhos).length;
    var base = tams + (tams === 1 ? ' tamanho' : ' tamanhos') + ' · ';
    if (total > 0) return base + total + ' em estoque';
    return base + (p.encomenda === true ? 'sem estoque (sob encomenda)' : 'sem estoque');
  }

  /* ================= faixa de aviso (salvo / publicando / no ar) ================= */

  function desenharAviso() {
    var a = estado.aviso;
    var lugar = estado.avisoEl;
    var titulo = '';
    var frase = '';
    var erro = false;
    var links = [];
    var fechar;
    if (!lugar || !lugar.isConnected) return;
    limpar(lugar);
    if (!a) return;

    if (a.fase === 'nao-achou') {
      titulo = 'Produto não encontrado';
      frase = 'Ele pode ter sido excluído. Confira na lista abaixo.';
      erro = true;
    } else if (a.fase === 'no-ar') {
      titulo = a.excluido ? 'Pronto, o produto saiu do site.' : 'Pronto, já está no site.';
      frase = 'Se a loja ainda mostrar o que era antes, atualize a página dela.';
    } else if (a.fase === 'falhou') {
      titulo = 'Salvo, mas a publicação do site deu erro.';
      frase = 'A mudança está gravada no GitHub, mas o site não atualizou. Salve qualquer produto de novo para tentar outra vez; se continuar, veja o erro no GitHub.';
      erro = true;
    } else if (a.fase === 'demorando') {
      titulo = 'Salvo! A publicação está demorando mais que o normal.';
      frase = 'Ela continua no GitHub. Confira daqui a pouco na loja.';
    } else if (a.fase === 'sem-acompanhar') {
      titulo = a.excluido ? 'Produto excluído.' : 'Salvo!';
      frase = 'O site atualiza sozinho em 1 ou 2 minutos.';
    } else {
      titulo = a.excluido ? 'Produto excluído. Tirando do site...' : 'Salvo! Publicando no site...';
      frase = 'Leva 1 ou 2 minutos. Pode continuar cadastrando enquanto isso.';
    }
    if (a.produto && !a.excluido && a.fase !== 'nao-achou') {
      links.push(el('a', { href: 'produto.html?id=' + encodeURIComponent(a.produto), target: '_blank', rel: 'noopener', texto: 'Ver o produto na loja' }));
    }
    if (a.link) links.push(el('a', { href: a.link, target: '_blank', rel: 'noopener', texto: 'Ver no GitHub' }));

    fechar = el('button', { type: 'button', classe: 'cad-aviso-fechar', 'aria-label': 'Fechar aviso', texto: '×' });
    fechar.addEventListener('click', function () {
      estado.aviso = null;
      limpar(lugar);
    });
    lugar.appendChild(el('div', { classe: 'mensagem cad-aviso' + (erro ? ' mensagem-erro' : ' cad-aviso-ok') }, [
      el('div', null, [
        el('strong', { texto: titulo }),
        el('p', { texto: frase }),
        links.length ? el('p', { classe: 'cad-aviso-links' }, links) : null
      ]),
      fechar
    ]));
  }

  function mudarFase(fase, link) {
    if (!estado.aviso) return;
    estado.aviso.fase = fase;
    if (link) estado.aviso.link = link;
    desenharAviso();
  }

  function pararVigia() {
    if (estado.vigia) window.clearTimeout(estado.vigia);
    estado.vigia = null;
  }

  // Pergunta ao GitHub, de tempos em tempos, se o site com este commit já foi publicado.
  // Precisa da permissão "Actions: Read-only" na chave; sem ela, fica só o aviso de 1 a 2 minutos.
  function acompanharPublicacao(sha) {
    var inicio = Date.now();
    pararVigia();

    function olhar() {
      estado.vigia = null;
      api('GET', rotaRepo('/actions/runs?head_sha=' + encodeURIComponent(sha) + '&per_page=20')).then(function (r) {
        var execucoes = lista(r && r.workflow_runs).filter(function (w) {
          return /publicar-site\.ya?ml/.test(texto(w.path)) || texto(w.name) === 'Publicar site';
        });
        var w = execucoes[0];
        if (w && w.status === 'completed') {
          mudarFase(w.conclusion === 'success' ? 'no-ar' : 'falhou', w.conclusion === 'success' ? '' : w.html_url);
          return;
        }
        if (Date.now() - inicio > LIMITE_PUBLICACAO_MS) {
          mudarFase('demorando', w ? w.html_url : 'https://github.com/' + REPO + '/actions');
          return;
        }
        estado.vigia = window.setTimeout(olhar, ESPERA_PUBLICACAO_MS);
      }).catch(function () {
        mudarFase('sem-acompanhar');
      });
    }

    estado.vigia = window.setTimeout(olhar, 3000);
  }

  /* ================= formulário do produto ================= */

  // modo: 'novo' (do zero), 'editar' (produto existente) ou 'cor' (nova cor de um produto existente)
  function telaFormulario(modo, base) {
    var cat = estado.catalogo;
    var categorias = lista(cat.categorias);
    var loja = cat.loja || {};
    var original = modo === 'editar' ? base : null;
    var p = base ? copiar(base) : {};
    var fotos;
    var tams = {};
    var extrasValores = {};
    var preparando = 0;
    var ocupado = false;

    if (modo === 'cor') {
      p.cor = '';
      p.imagens = [];
      p.destaque = false;
      p.fixarNoTopo = false;
      p.ativo = true;
      p.tamanhos = lista(base.tamanhos).map(function (t) { return { tamanho: t.tamanho, estoque: 0 }; });
    } else if (modo === 'novo') {
      p = { categoria: categorias.length ? categorias[0].id : '', encomenda: true, ativo: true, destaque: false, tamanhos: [], imagens: [], extras: {} };
    }

    fotos = lista(p.imagens).map(function (c) { return { caminho: texto(c) }; }).filter(function (f) { return f.caminho; });
    lista(p.tamanhos).forEach(function (t) {
      tams[String(t.tamanho)] = { vende: true, estoque: String(inteiro(t.estoque)) };
    });
    Object.keys(p.extras || {}).forEach(function (k) { extrasValores[k] = texto(p.extras[k]); });

    /* ----- campos ----- */
    var selCat = el('select', { id: 'f-categoria', required: true }, categorias.map(function (c) {
      return el('option', { value: c.id, texto: texto(c.nome) || c.id });
    }));
    var selSub = el('select', { id: 'f-subcategoria', required: true });
    var inNome = entrada('f-nome', p.nome, { list: 'lista-nomes', required: true });
    var inMarca = entrada('f-marca', p.marca, { list: 'lista-marcas' });
    var inCor = entrada('f-cor', p.cor, { list: 'lista-cores', required: true });
    var inPreco = entrada('f-preco', precoParaCampo(p.preco), { inputmode: 'decimal', placeholder: '0,00', required: true });
    var inPromo = entrada('f-promo', precoParaCampo(p.precoPromocional), { inputmode: 'decimal', placeholder: 'Vazio = sem promoção' });
    var inDescricao = el('textarea', { id: 'f-descricao', rows: '8' });
    var ckAtivo = caixa('f-ativo', p.ativo !== false);
    var ckEncomenda = caixa('f-encomenda', p.encomenda === true);
    var ckDestaque = caixa('f-destaque', p.destaque === true);
    var ckFixar = caixa('f-fixar', p.fixarNoTopo === true);
    var areaExtras = el('div', { classe: 'cad-extras' });
    var gradeTam = el('div', { classe: 'cad-tamanhos' });
    var gradeFotos = el('ul', { classe: 'cad-fotos' });
    var entradaFotos = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/*', multiple: true, hidden: true, id: 'f-fotos-arquivo' });
    var botaoFotos = el('button', { type: 'button', classe: 'botao botao-fantasma', texto: 'Adicionar fotos' });
    var avisoFotos = el('p', { classe: 'campo-dica', role: 'status' });
    var caixaErros = el('div', { classe: 'mensagem mensagem-erro', role: 'alert', tabindex: '-1', hidden: true });
    var progresso = el('p', { classe: 'cad-progresso', role: 'status' });
    var salvar = el('button', { type: 'submit', classe: 'botao', texto: modo === 'editar' ? 'Salvar e publicar' : 'Cadastrar e publicar' });
    var cancelar = el('a', { href: '#', classe: 'botao botao-fantasma', texto: 'Cancelar' });
    var excluir = null;
    var marcarTodos = el('button', { type: 'button', classe: 'botao-texto', texto: 'Marcar todos' });
    var desmarcarTodos = el('button', { type: 'button', classe: 'botao-texto', texto: 'Desmarcar todos' });
    var prazo = texto((loja.encomenda || {}).prazo);
    var temZap = !!texto((loja.contato || {}).whatsapp).replace(/\D/g, '');
    var form;

    inDescricao.value = texto(p.descricao);
    selCat.value = p.categoria || (categorias[0] && categorias[0].id) || '';

    /* ----- subcategoria, campos extras e tamanhos dependem da categoria ----- */
    function categoriaAtual() {
      return acharCategoria(selCat.value);
    }

    function desenharSub() {
      var c = categoriaAtual();
      var escolhida = selSub.value || p.subcategoria;
      limpar(selSub);
      lista(c && c.subcategorias).forEach(function (s) {
        selSub.appendChild(el('option', { value: s.id, texto: texto(s.nome) || s.id }));
      });
      if (escolhida && acharSub(c, escolhida)) selSub.value = escolhida;
    }

    function desenharExtras() {
      var c = categoriaAtual();
      var defs = (c && c.camposExtras) || {};
      limpar(areaExtras);
      Object.keys(defs).forEach(function (k) {
        var d = defs[k] || {};
        var id = 'f-extra-' + idSeguro(k);
        var rotulo = texto(d.rotulo) || k;
        var campo;
        var opcoes = lista(d.opcoes).map(texto);
        if (opcoes.length) {
          campo = el('select', { id: id }, [el('option', { value: '', texto: d.obrigatorio ? 'Escolha...' : '(nenhum)' })]);
          if (extrasValores[k] && opcoes.indexOf(extrasValores[k]) < 0) opcoes.push(extrasValores[k]);
          opcoes.forEach(function (o) { campo.appendChild(el('option', { value: o, texto: o })); });
          campo.value = extrasValores[k] || '';
        } else {
          campo = entrada(id, extrasValores[k], { list: 'lista-extra-' + idSeguro(k) });
        }
        campo.addEventListener('input', function () { extrasValores[k] = campo.value; });
        campo.addEventListener('change', function () { extrasValores[k] = campo.value; });
        areaExtras.appendChild(el('div', { classe: 'campo' }, [
          el('label', { for: id, texto: rotulo + (d.obrigatorio ? '' : ' (opcional)') }),
          campo,
          k === 'modelo' ? el('p', { classe: 'campo-dica', texto: 'Escreva igual em todas as cores do mesmo modelo: é isso que junta as cores na página do produto.' }) : null
        ]));
      });
      areaExtras.hidden = !Object.keys(defs).length;
    }

    function desenharTamanhos() {
      var c = categoriaAtual();
      var ordem = lista(c && c.tamanhos).map(String);
      limpar(gradeTam);
      Object.keys(tams).forEach(function (t) {
        if (ordem.indexOf(t) < 0 && tams[t].vende) ordem.push(t); // tamanho fora da lista da categoria
      });
      if (!ordem.length) {
        gradeTam.appendChild(el('p', { classe: 'campo-dica', texto: 'Esta categoria ainda não tem tamanhos no catálogo.' }));
        return;
      }
      ordem.forEach(function (t) {
        var st = tams[t] || (tams[t] = { vende: false, estoque: '0' });
        var id = 'f-tam-' + idSeguro(t);
        var marca = el('input', { type: 'checkbox', id: id, checked: st.vende, 'aria-label': 'Vende o tamanho ' + t });
        var qtd = el('input', {
          type: 'number', min: '0', step: '1', inputmode: 'numeric', value: st.estoque,
          'aria-label': 'Estoque do tamanho ' + t, disabled: !st.vende
        });
        var bloco = el('div', { classe: 'cad-tam' + (st.vende ? ' cad-tam-ativo' : '') }, [
          el('label', { for: id, classe: 'cad-tam-nome' }, [marca, el('span', { texto: t })]),
          qtd
        ]);
        marca.addEventListener('change', function () {
          st.vende = marca.checked;
          qtd.disabled = !marca.checked;
          bloco.classList.toggle('cad-tam-ativo', marca.checked);
        });
        qtd.addEventListener('input', function () { st.estoque = qtd.value; });
        gradeTam.appendChild(bloco);
      });
    }

    function marcarTodosTamanhos(valor) {
      var c = categoriaAtual();
      lista(c && c.tamanhos).forEach(function (t) {
        var st = tams[String(t)] || (tams[String(t)] = { vende: false, estoque: '0' });
        st.vende = valor;
      });
      desenharTamanhos();
      estado.sujo = true;
    }

    selCat.addEventListener('change', function () {
      desenharSub();
      desenharExtras();
      desenharTamanhos();
    });
    marcarTodos.addEventListener('click', function () { marcarTodosTamanhos(true); });
    desmarcarTodos.addEventListener('click', function () { marcarTodosTamanhos(false); });

    /* ----- fotos ----- */
    function desenharFotos() {
      limpar(gradeFotos);
      fotos.forEach(function (f, i) {
        var img;
        if (f.carregando) img = el('span', { classe: 'cad-foto-carregando', texto: 'Preparando...' });
        else if (f.nova) img = el('img', { src: f.url, alt: 'Foto ' + (i + 1) });
        else img = fotoPrevia(f.caminho, true, 'Foto ' + (i + 1));
        gradeFotos.appendChild(el('li', { classe: 'cad-foto' }, [
          el('div', { classe: 'cad-foto-img' }, [img, i === 0 ? el('span', { classe: 'cad-foto-capa', texto: 'Capa' }) : null]),
          el('div', { classe: 'cad-foto-acoes' }, [
            botaoFoto('←', 'Mover a foto ' + (i + 1) + ' para a esquerda', i === 0, function () { moverFoto(i, -1); }),
            botaoFoto('→', 'Mover a foto ' + (i + 1) + ' para a direita', i === fotos.length - 1, function () { moverFoto(i, 1); }),
            botaoFoto('×', 'Tirar a foto ' + (i + 1), false, function () { tirarFoto(i); })
          ])
        ]));
      });
      botaoFotos.disabled = fotos.length >= MAX_FOTOS;
    }

    function botaoFoto(simbolo, rotulo, desligado, acao) {
      var b = el('button', { type: 'button', classe: 'cad-foto-botao', 'aria-label': rotulo, title: rotulo, disabled: desligado, texto: simbolo });
      b.addEventListener('click', acao);
      return b;
    }

    function moverFoto(i, passo) {
      var j = i + passo;
      var f = fotos[i];
      if (j < 0 || j >= fotos.length) return;
      fotos[i] = fotos[j];
      fotos[j] = f;
      estado.sujo = true;
      desenharFotos();
    }

    function tirarFoto(i) {
      var f = fotos.splice(i, 1)[0];
      if (f) f.tirada = true;
      if (f && f.url) URL.revokeObjectURL(f.url);
      estado.sujo = true;
      desenharFotos();
    }

    botaoFotos.addEventListener('click', function () { entradaFotos.click(); });
    entradaFotos.addEventListener('change', function () {
      var arquivos = Array.prototype.slice.call(entradaFotos.files || []);
      var vagas = MAX_FOTOS - fotos.length;
      var falhas = [];
      entradaFotos.value = '';
      avisoFotos.textContent = '';
      if (!arquivos.length) return;
      if (arquivos.length > vagas) {
        avisoFotos.textContent = 'Cabem até ' + MAX_FOTOS + ' fotos por produto. Entraram só as primeiras.';
        arquivos = arquivos.slice(0, Math.max(0, vagas));
      }
      estado.sujo = true;
      arquivos.forEach(function (arq) {
        var item = { nova: true, carregando: true };
        fotos.push(item);
        preparando++;
        prepararFoto(arq).then(function (r) {
          item.grande = r.grande;
          item.mini = r.mini;
          if (!item.tirada) item.url = URL.createObjectURL(r.grande);
        }).catch(function () {
          var i = fotos.indexOf(item);
          if (i >= 0) fotos.splice(i, 1);
          falhas.push(arq.name);
        }).then(function () {
          item.carregando = false;
          preparando--;
          if (falhas.length && !preparando) {
            avisoFotos.textContent = 'Não consegui abrir: ' + falhas.join(', ') + '. Use fotos em JPG ou PNG.';
          }
          if (!preparando) progresso.textContent = '';
          desenharFotos();
        });
      });
      progresso.textContent = '';
      desenharFotos();
    });

    /* ----- montar o produto a partir do formulário ----- */
    function montarProduto() {
      var erros = [];
      var c = categoriaAtual();
      var s = acharSub(c, selSub.value);
      var nome = limparEspacos(inNome.value);
      var marca = limparEspacos(inMarca.value);
      var cor = limparEspacos(inCor.value);
      var preco = lerPreco(inPreco.value);
      var temPromo = !!texto(inPromo.value);
      var promo = temPromo ? lerPreco(inPromo.value) : null;
      var defs = (c && c.camposExtras) || {};
      var extras = {};
      var tamanhos = [];
      var ordemTam = lista(c && c.tamanhos).map(String);
      var prod;

      if (!c) erros.push('Escolha a categoria.');
      if (c && !s) erros.push('Escolha a subcategoria.');
      if (!nome) erros.push('Preencha o nome do produto.');
      if (!cor) erros.push('Preencha a cor.');
      if (preco === null || preco <= 0) erros.push('Preencha o preço com um valor válido (ex.: 299,90).');
      if (temPromo && (promo === null || promo <= 0)) erros.push('O preço promocional não é um valor válido (ex.: 249,90).');
      else if (temPromo && preco !== null && promo >= preco) erros.push('O preço promocional precisa ser menor que o preço normal.');

      // Campos extras: os da categoria, mais os que não são de categoria nenhuma (mantidos como estavam)
      Object.keys(p.extras || {}).forEach(function (k) {
        if (!campoDeAlgumaCategoria(k) && texto(p.extras[k])) extras[k] = p.extras[k];
      });
      Object.keys(defs).forEach(function (k) {
        var v = limparEspacos(extrasValores[k]);
        if (v) extras[k] = v;
        else if (defs[k] && defs[k].obrigatorio) erros.push('Preencha: ' + (texto(defs[k].rotulo) || k) + '.');
      });

      Object.keys(tams).forEach(function (t) {
        if (ordemTam.indexOf(t) < 0) ordemTam.push(t);
      });
      ordemTam.forEach(function (t) {
        var st = tams[t];
        var q;
        if (!st || !st.vende) return;
        q = texto(st.estoque) === '' ? 0 : Number(st.estoque);
        if (!/^\d+$/.test(String(q)) || q < 0) {
          erros.push('O estoque do tamanho ' + t + ' precisa ser um número inteiro (0 ou mais).');
          return;
        }
        tamanhos.push({ tamanho: t, estoque: q });
      });
      if (!tamanhos.length) erros.push('Marque pelo menos um tamanho.');
      if (ckAtivo.checked && !fotos.length) erros.push('Coloque pelo menos uma foto (ou desmarque "Mostrar no site" para salvar sem foto).');
      if (preparando > 0) erros.push('Espere as fotos terminarem de carregar.');

      if (original) {
        prod = copiar(original); // mantém a ordem dos campos e qualquer campo que esta tela não conhece
      } else {
        prod = {
          id: gerarId(nome, cor), categoria: '', subcategoria: '', nome: '', marca: '', cor: '',
          preco: 0, precoPromocional: null, tamanhos: [], imagens: [], descricao: '', extras: {},
          destaque: false, encomenda: false, ativo: true, criadoEm: hoje()
        };
      }
      prod.categoria = c ? c.id : '';
      prod.subcategoria = s ? s.id : '';
      prod.nome = nome;
      prod.marca = marca;
      prod.cor = cor;
      prod.preco = preco;
      prod.precoPromocional = temPromo ? promo : null;
      prod.tamanhos = tamanhos;
      prod.descricao = texto(inDescricao.value).replace(/\r\n?/g, '\n');
      prod.extras = extras;
      prod.destaque = ckDestaque.checked;
      if (ckFixar.checked) prod.fixarNoTopo = true;
      else delete prod.fixarNoTopo;
      prod.encomenda = ckEncomenda.checked;
      prod.ativo = ckAtivo.checked;
      if (!texto(prod.criadoEm)) prod.criadoEm = hoje();
      return { produto: prod, erros: erros };
    }

    function mostrarErros(erros) {
      limpar(caixaErros);
      caixaErros.appendChild(el('strong', { texto: erros.length === 1 ? 'Falta acertar uma coisa:' : 'Falta acertar algumas coisas:' }));
      caixaErros.appendChild(el('ul', null, erros.map(function (e) { return el('li', { texto: e }); })));
      caixaErros.hidden = false;
      caixaErros.focus();
      caixaErros.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function travar(sim) {
      ocupado = sim;
      salvar.disabled = sim;
      if (excluir) excluir.disabled = sim;
      form.classList.toggle('cad-ocupado', sim);
    }

    function falhouAoSalvar(e) {
      travar(false);
      progresso.textContent = '';
      if (e && e.status === 401) {
        mostrarErros([mensagemErro(e) + ' O que você digitou continua aqui: copie antes de sair, se precisar.']);
        return;
      }
      mostrarErros([mensagemErro(e)]);
    }

    function concluiu(r, excluido) {
      estado.sujo = false;
      estado.aviso = { fase: 'publicando', produto: excluido ? '' : r.plano.produto.id, excluido: excluido };
      acompanharPublicacao(r.commit);
      irPara('');
    }

    /* ----- montar a página ----- */
    if (modo === 'editar') {
      excluir = el('button', { type: 'button', classe: 'botao botao-perigo', texto: 'Excluir produto' });
      excluir.addEventListener('click', function () {
        var nomeP = descricaoProduto(original);
        if (ocupado) return;
        if (!window.confirm('Excluir "' + nomeP + '" de vez, com as fotos?\n\nSe quiser só tirar do site por um tempo, desmarque "Mostrar no site" e salve.')) return;
        travar(true);
        salvarNoGitHub({ tipo: 'excluir', idOriginal: original.id, fotos: [] }, function (t) { progresso.textContent = t; })
          .then(function (r) { concluiu(r, true); })
          .catch(falhouAoSalvar);
      });
    }

    form = el('form', { classe: 'cad-form', novalidate: true }, [
      caixaErros,
      grupo('Onde aparece', [
        el('div', { classe: 'campos-2' }, [
          campo('f-categoria', 'Categoria', selCat),
          campo('f-subcategoria', 'Subcategoria', selSub)
        ])
      ]),
      grupo('Produto', [
        campo('f-nome', 'Nome do produto', inNome, 'Como aparece na loja. Ex.: Quadra Pro Veloz.'),
        el('div', { classe: 'campos-2' }, [
          campo('f-marca', 'Marca', inMarca),
          campo('f-cor', 'Cor', inCor, 'Ex.: Preto, Branco e verde.')
        ]),
        areaExtras
      ]),
      grupo('Preço', [
        el('div', { classe: 'campos-2' }, [
          campo('f-preco', 'Preço (R$)', inPreco),
          campo('f-promo', 'Preço promocional (R$)', inPromo, 'Deixe vazio se não estiver em promoção.')
        ])
      ]),
      grupo('Tamanhos e estoque', [
        el('p', { classe: 'grupo-texto', texto: 'Marque os tamanhos que você vende e quantos tem de cada um. Com 0, o tamanho aparece como esgotado' + (temZap ? ', ou como "sob encomenda" se a opção de encomenda estiver marcada.' : '.') }),
        el('div', { classe: 'botoes' }, [marcarTodos, desmarcarTodos]),
        gradeTam,
        el('div', { classe: 'campo-check' }, [ckEncomenda, el('label', { for: 'f-encomenda', texto: 'Aceita encomenda dos tamanhos sem estoque' + (prazo ? ' (prazo de ' + prazo + ')' : '') })]),
        temZap ? null : el('p', { classe: 'campo-dica', texto: 'A loja ainda não tem WhatsApp no catálogo, então a encomenda não aparece no site.' })
      ]),
      grupo('Fotos', [
        el('p', { classe: 'grupo-texto', texto: 'A primeira foto é a capa. Fotos com fundo branco ficam melhores na vitrine. O site diminui as fotos antes de enviar.' }),
        gradeFotos,
        el('div', { classe: 'botoes' }, [botaoFotos, entradaFotos]),
        avisoFotos
      ]),
      grupo('Descrição', [
        campo('f-descricao', 'Texto da página do produto (opcional)', inDescricao, 'Pule uma linha para separar os parágrafos.')
      ]),
      grupo('Na loja', [
        el('div', { classe: 'campo-check' }, [ckAtivo, el('label', { for: 'f-ativo', texto: 'Mostrar no site' })]),
        el('div', { classe: 'campo-check' }, [ckDestaque, el('label', { for: 'f-destaque', texto: 'Destaque na página inicial' })]),
        el('div', { classe: 'campo-check' }, [ckFixar, el('label', { for: 'f-fixar', texto: 'Fixar no topo das novidades' })])
      ]),
      el('div', { classe: 'cad-acoes' }, [
        el('div', { classe: 'botoes' }, [salvar, cancelar]),
        progresso
      ]),
      // Fora da barra presa no pé da tela, para não ser tocado sem querer no celular
      excluir ? el('div', { classe: 'cad-excluir' }, [
        el('p', { classe: 'campo-dica', texto: 'Excluir apaga o produto e as fotos dele de vez. Para só tirar do site por um tempo, desmarque "Mostrar no site".' }),
        excluir
      ]) : null
    ]);

    form.addEventListener('input', function () { estado.sujo = true; });
    form.addEventListener('change', function () { estado.sujo = true; });
    form.addEventListener('submit', function (ev) {
      var r;
      ev.preventDefault();
      if (ocupado) return;
      caixaErros.hidden = true;
      r = montarProduto();
      if (r.erros.length) {
        mostrarErros(r.erros);
        return;
      }
      travar(true);
      salvarNoGitHub({
        tipo: 'salvar',
        produto: r.produto,
        idOriginal: original ? original.id : '',
        depoisDe: modo === 'cor' ? base.id : '',
        fotos: fotos
      }, function (t) { progresso.textContent = t; })
        .then(function (res) { concluiu(res, false); })
        .catch(falhouAoSalvar);
    });

    var titulo = modo === 'editar' ? 'Editar produto' : (modo === 'cor' ? 'Nova cor de ' + texto(base.nome) : 'Novo produto');
    var cabeca = [
      el('a', { href: '#', classe: 'cad-voltar', texto: '‹ Produtos' }),
      el('h1', { classe: 'pagina-titulo', texto: titulo })
    ];
    if (modo === 'editar') {
      cabeca.push(el('p', { classe: 'cad-sub' }, [
        descricaoProduto(original) + ' · ',
        el('a', { href: 'produto.html?id=' + encodeURIComponent(original.id), target: '_blank', rel: 'noopener', texto: 'ver na loja' }),
        ' · ',
        el('a', { href: '#cor/' + encodeURIComponent(original.id), texto: 'cadastrar outra cor deste modelo' })
      ]));
    } else if (modo === 'cor') {
      cabeca.push(el('p', { classe: 'cad-sub', texto: 'Já veio preenchido com os dados de ' + descricaoProduto(base) + '. Troque a cor, as fotos e o estoque, e confira se a descrição fala da cor certa.' }));
    }
    limpar(conteudo);
    conteudo.appendChild(el('section', { classe: 'limite secao-topo cad-pagina' }, cabeca.concat([
      form,
      listaSugestoes('lista-nomes', valoresUsados(function (q) { return q.nome; })),
      listaSugestoes('lista-marcas', valoresUsados(function (q) { return q.marca; })),
      listaSugestoes('lista-cores', valoresUsados(function (q) { return q.cor; }))
    ]).concat(sugestoesExtras())));

    desenharSub();
    desenharExtras();
    desenharTamanhos();
    desenharFotos();
    estado.sujo = false;
    if (modo !== 'editar') (modo === 'cor' ? inCor : inNome).focus();
  }

  /* ----- peças do formulário ----- */

  function entrada(id, valor, extra) {
    var props = { id: id, type: 'text', autocomplete: 'off', value: valor === undefined || valor === null ? '' : String(valor) };
    var k;
    for (k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k)) props[k] = extra[k];
    }
    return el('input', props);
  }

  function caixa(id, marcada) {
    return el('input', { type: 'checkbox', id: id, checked: marcada });
  }

  function campo(id, rotulo, controle, dica) {
    var dicaId = dica ? id + '-dica' : null;
    if (dicaId) controle.setAttribute('aria-describedby', dicaId);
    return el('div', { classe: 'campo' }, [
      el('label', { for: id, texto: rotulo }),
      controle,
      dica ? el('p', { id: dicaId, classe: 'campo-dica', texto: dica }) : null
    ]);
  }

  function grupo(legenda, filhos) {
    return el('fieldset', { classe: 'grupo' }, [el('legend', { texto: legenda })].concat(filhos));
  }

  function listaSugestoes(id, valores) {
    return el('datalist', { id: id }, valores.map(function (v) { return el('option', { value: v }); }));
  }

  function sugestoesExtras() {
    var chaves = {};
    lista(estado.catalogo.categorias).forEach(function (c) {
      Object.keys(c.camposExtras || {}).forEach(function (k) { chaves[k] = true; });
    });
    return Object.keys(chaves).map(function (k) {
      return listaSugestoes('lista-extra-' + idSeguro(k), valoresUsados(function (q) { return (q.extras || {})[k]; }));
    });
  }

  function valoresUsados(pegar) {
    var vistos = {};
    var saida = [];
    lista(estado.catalogo.produtos).forEach(function (q) {
      var v = texto(pegar(q));
      if (v && !vistos[v.toLowerCase()]) {
        vistos[v.toLowerCase()] = true;
        saida.push(v);
      }
    });
    return saida.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
  }

  function campoDeAlgumaCategoria(chave) {
    return lista(estado.catalogo.categorias).some(function (c) {
      return Object.prototype.hasOwnProperty.call(c.camposExtras || {}, chave);
    });
  }

  /* ================= fotos: diminuir no navegador ================= */

  function prepararFoto(arquivo) {
    return abrirImagem(arquivo).then(function (img) {
      return reduzir(img, FOTO_GRANDE).then(function (grande) {
        return reduzir(img, FOTO_MINI).then(function (mini) {
          if (img.close) img.close();
          return { grande: grande, mini: mini };
        });
      });
    });
  }

  // createImageBitmap já corrige a foto deitada do celular (orientação EXIF); sem ele, usa um <img>.
  function abrirImagem(arquivo) {
    if (window.createImageBitmap) {
      return window.createImageBitmap(arquivo, { imageOrientation: 'from-image' }).catch(function () {
        return abrirComImg(arquivo);
      });
    }
    return abrirComImg(arquivo);
  }

  function abrirComImg(arquivo) {
    return new Promise(function (ok, falha) {
      var url = URL.createObjectURL(arquivo);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); ok(img); };
      img.onerror = function () { URL.revokeObjectURL(url); falha(new Error('formato')); };
      img.src = url;
    });
  }

  // Diminui até o maior lado caber em "maximo" (em passos de metade, para não serrilhar)
  // e grava em JPG com fundo branco (PNG transparente não fica preto).
  function reduzir(fonte, maximo) {
    var w = fonte.naturalWidth || fonte.width;
    var h = fonte.naturalHeight || fonte.height;
    var escala, alvoW, alvoH, atual, cw, ch, final;
    if (!w || !h) return Promise.reject(new Error('foto vazia'));
    escala = Math.min(1, maximo / Math.max(w, h));
    alvoW = Math.max(1, Math.round(w * escala));
    alvoH = Math.max(1, Math.round(h * escala));
    atual = fonte;
    cw = w;
    ch = h;
    while (cw / 2 >= alvoW && ch / 2 >= alvoH) {
      cw = Math.round(cw / 2);
      ch = Math.round(ch / 2);
      atual = desenhar(atual, cw, ch, false);
    }
    final = desenhar(atual, alvoW, alvoH, true);
    return new Promise(function (ok, falha) {
      final.toBlob(function (b) {
        if (b) ok(b);
        else falha(new Error('não gerou a foto'));
      }, 'image/jpeg', QUALIDADE_JPG);
    });
  }

  function desenhar(fonte, w, h, fundoBranco) {
    var c = document.createElement('canvas');
    var ctx;
    c.width = w;
    c.height = h;
    ctx = c.getContext('2d');
    if (fundoBranco) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(fonte, 0, 0, w, h);
    return c;
  }

  function paraBase64(blob) {
    return new Promise(function (ok, falha) {
      var leitor = new FileReader();
      leitor.onload = function () { ok(String(leitor.result).split(',')[1] || ''); };
      leitor.onerror = function () { falha(leitor.error || new Error('não leu a foto')); };
      leitor.readAsDataURL(blob);
    });
  }

  // Miniatura (img/produtos/mini/<mesmo nome>), igual à regra de js/loja.js.
  function miniatura(src) {
    var i = src.lastIndexOf('/');
    if (!/^img\/produtos\/[^\/]+\.(jpe?g|png)$/i.test(src)) return src;
    return src.slice(0, i + 1) + 'mini/' + src.slice(i + 1);
  }

  // Foto que já está no site. Se acabou de ser enviada e ainda não foi publicada, usa a cópia desta visita.
  function fotoPrevia(caminho, pequena, alt) {
    var grande = estado.previas[caminho] || caminho;
    var mini = estado.previas[caminho] || (pequena ? miniatura(caminho) : caminho);
    var img = el('img', { src: mini, alt: alt || '', loading: 'lazy', decoding: 'async' });
    img.onerror = function () {
      var atual = img.getAttribute('src');
      if (atual !== grande) img.setAttribute('src', grande);
      else if (atual !== SEM_FOTO) img.setAttribute('src', SEM_FOTO);
    };
    return img;
  }

  /* ================= GitHub ================= */

  function rotaRepo(resto) {
    return '/repos/' + REPO + resto;
  }

  function caminhoNoRepo(rel) {
    return PASTA ? PASTA + '/' + rel : rel;
  }

  function relativo(caminho) {
    if (!PASTA) return caminho;
    return caminho.indexOf(PASTA + '/') === 0 ? caminho.slice(PASTA.length + 1) : null;
  }

  function api(metodo, rota, corpo) {
    var opcoes = {
      method: metodo,
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + estado.token }
    };
    if (corpo !== undefined) {
      opcoes.headers['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(corpo);
    }
    return window.fetch(API + rota, opcoes).then(function (resp) {
      return resp.text().then(function (t) {
        var dados = null;
        var erro;
        try { dados = t ? JSON.parse(t) : null; } catch (e) { dados = null; }
        if (!resp.ok) {
          erro = new Error((dados && dados.message) || ('Erro ' + resp.status));
          erro.status = resp.status;
          erro.limite = resp.headers.get('x-ratelimit-remaining') === '0';
          throw erro;
        }
        return dados;
      });
    }, function () {
      var erro = new Error('sem conexão');
      erro.semConexao = true;
      throw erro;
    });
  }

  function erroAmigavel(frase) {
    var e = new Error(frase);
    e.amigavel = true;
    return e;
  }

  function mensagemErro(e) {
    if (!e) return 'Aconteceu um erro inesperado. Tente de novo.';
    if (e.amigavel) return e.message;
    if (e.semConexao) return 'Não consegui falar com o GitHub. Confira a internet e tente de novo.';
    if (e.status === 401) return 'A chave de acesso não vale mais (venceu, foi apagada ou foi copiada pela metade). Entre de novo com a chave certa.';
    if (e.status === 403 && e.limite) return 'O GitHub pediu uma pausa (muitos pedidos seguidos). Espere alguns minutos e tente de novo.';
    if (e.status === 403) return 'Esta chave não tem permissão para gravar no site. Crie uma chave com "Contents: Read and write" para o repositório ' + REPO + '.';
    if (e.status === 404) return 'Esta chave não enxerga o repositório ' + REPO + '. Ao criar a chave, escolha ele em "Repository access".';
    if (e.status === 409) return 'O repositório do site está vazio ou bloqueado no GitHub.';
    return 'O GitHub respondeu com um erro: ' + e.message;
  }

  // Lê o estado atual do site no GitHub: último commit, lista de arquivos e o catálogo.
  function lerDoGitHub() {
    var r = {};
    return api('GET', rotaRepo('/git/ref/heads/' + RAMO)).then(function (ref) {
      r.commit = ref.object.sha;
      return api('GET', rotaRepo('/git/commits/' + r.commit));
    }).then(function (c) {
      r.arvore = c.tree.sha;
      return api('GET', rotaRepo('/git/trees/' + r.arvore + '?recursive=1'));
    }).then(function (t) {
      var entrada = null;
      r.arquivos = {};
      lista(t && t.tree).forEach(function (e) {
        var rel;
        if (e.type !== 'blob') return;
        rel = relativo(e.path);
        if (rel === null) return;
        r.arquivos[rel] = true;
        if (rel === ARQ_CATALOGO) entrada = e;
      });
      if (!entrada) {
        throw erroAmigavel('Não achei o arquivo ' + caminhoNoRepo(ARQ_CATALOGO) + ' no GitHub (ramo ' + RAMO + '). Confira a pasta em js/cadastro-config.js.');
      }
      return api('GET', rotaRepo('/git/blobs/' + entrada.sha));
    }).then(function (b) {
      var partes = separarCatalogo(base64ParaTexto(b.content));
      r.prefixo = partes.prefixo;
      r.sufixo = partes.sufixo;
      r.catalogo = partes.catalogo;
      return r;
    });
  }

  // O arquivo é "window.CATALOGO = { ...JSON... };" com comentários antes. Guarda o que está em volta do JSON.
  function separarCatalogo(bruto) {
    var i = bruto.indexOf('window.CATALOGO');
    var igual = i < 0 ? -1 : bruto.indexOf('=', i);
    var abre = igual < 0 ? -1 : bruto.indexOf('{', igual);
    var fecha = bruto.lastIndexOf('}');
    var catalogo;
    if (abre < 0 || fecha < abre) throw erroAmigavel('O arquivo do catálogo está num formato diferente do esperado (falta "window.CATALOGO = {").');
    try {
      catalogo = JSON.parse(bruto.slice(abre, fecha + 1));
    } catch (e) {
      throw erroAmigavel('O arquivo do catálogo no GitHub tem um erro de digitação e não pôde ser lido (' + e.message + '). Peça ajuda para corrigir antes de usar o cadastro.');
    }
    if (!catalogo || typeof catalogo !== 'object' || !Array.isArray(catalogo.produtos)) {
      throw erroAmigavel('O catálogo no GitHub não tem a lista de produtos.');
    }
    if (!Array.isArray(catalogo.categorias)) catalogo.categorias = [];
    return { prefixo: bruto.slice(0, abre), sufixo: bruto.slice(fecha + 1), catalogo: catalogo };
  }

  function base64ParaTexto(b64) {
    var bin = window.atob(String(b64 || '').replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    var i;
    for (i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  // Grava uma mudança (salvar ou excluir um produto) num commit só: catálogo + fotos novas + fotos apagadas.
  // op: { tipo: 'salvar' | 'excluir', produto, idOriginal, depoisDe, fotos }
  function salvarNoGitHub(op, avisar) {
    var enviadas = []; // sha das fotos já enviadas (índice da foto em op.fotos), reaproveitado se precisar tentar de novo
    var tentativas = 0;

    function tentar() {
      var lido, plano;
      tentativas++;
      avisar('Conferindo o catálogo no GitHub...');
      return lerDoGitHub().then(function (l) {
        lido = l;
        plano = planejar(op, lido);
        return enviarFotos(plano, op, enviadas, avisar);
      }).then(function () {
        var itens = [{
          path: caminhoNoRepo(ARQ_CATALOGO), mode: '100644', type: 'blob',
          content: lido.prefixo + formatarJSON(plano.catalogo) + lido.sufixo
        }];
        plano.novasFotos.forEach(function (f) {
          itens.push({ path: caminhoNoRepo(f.caminho), mode: '100644', type: 'blob', sha: enviadas[f.indice].grande });
          itens.push({ path: caminhoNoRepo(miniatura(f.caminho)), mode: '100644', type: 'blob', sha: enviadas[f.indice].mini });
        });
        plano.apagar.forEach(function (c) {
          itens.push({ path: caminhoNoRepo(c), mode: '100644', type: 'blob', sha: null });
        });
        avisar('Gravando no GitHub...');
        return api('POST', rotaRepo('/git/trees'), { base_tree: lido.arvore, tree: itens });
      }).then(function (arvore) {
        return api('POST', rotaRepo('/git/commits'), { message: plano.mensagem, tree: arvore.sha, parents: [lido.commit] });
      }).then(function (commit) {
        avisar('Publicando...');
        return api('PATCH', rotaRepo('/git/refs/heads/' + RAMO), { sha: commit.sha, force: false }).then(function () {
          return { commit: commit.sha, plano: plano };
        });
      }).catch(function (e) {
        // Outra gravação entrou no mesmo instante (outra aba ou aparelho): lê tudo de novo e tenta outra vez.
        if (e && e.status === 422 && /fast.?forward/i.test(e.message) && tentativas < 3) return tentar();
        throw e;
      });
    }

    return tentar().then(function (r) {
      // A tela passa a mostrar o que acabou de ir para o GitHub, sem ler tudo de novo.
      estado.catalogo = r.plano.catalogo;
      estado.lidoEm = new Date();
      r.plano.novasFotos.forEach(function (f) {
        estado.arquivos[f.caminho] = true;
        estado.arquivos[miniatura(f.caminho)] = true;
        if (op.fotos[f.indice].url) estado.previas[f.caminho] = op.fotos[f.indice].url;
      });
      r.plano.apagar.forEach(function (c) { delete estado.arquivos[c]; });
      return r;
    });
  }

  function enviarFotos(plano, op, enviadas, avisar) {
    var pendentes = plano.novasFotos.filter(function (f) { return !enviadas[f.indice]; });
    var total = pendentes.length;
    var feitas = 0;
    return pendentes.reduce(function (anterior, f) {
      return anterior.then(function () {
        var foto = op.fotos[f.indice];
        var par = {};
        feitas++;
        avisar('Enviando foto ' + feitas + ' de ' + total + '...');
        return paraBase64(foto.grande).then(function (b64) {
          return api('POST', rotaRepo('/git/blobs'), { content: b64, encoding: 'base64' });
        }).then(function (b) {
          par.grande = b.sha;
          return paraBase64(foto.mini);
        }).then(function (b64) {
          return api('POST', rotaRepo('/git/blobs'), { content: b64, encoding: 'base64' });
        }).then(function (b) {
          par.mini = b.sha;
          enviadas[f.indice] = par;
        });
      });
    }, Promise.resolve());
  }

  // Aplica a mudança no catálogo que acabou de ser lido do GitHub e decide os nomes das fotos novas
  // e quais fotos antigas podem ser apagadas.
  function planejar(op, lido) {
    var cat = copiar(lido.catalogo);
    var prods = lista(cat.produtos);
    var idx = op.idOriginal ? indicePorId(prods, op.idOriginal) : -1;
    var antigas = idx >= 0 ? lista(prods[idx].imagens).map(texto) : [];
    var plano = { catalogo: cat, novasFotos: [], apagar: [], mensagem: '', produto: null };
    var p, usados, depois, emUso;

    if (op.idOriginal && idx < 0) {
      throw erroAmigavel('Este produto não está mais no catálogo do GitHub (foi excluído em outro aparelho?). Volte para a lista e confira.');
    }

    if (op.tipo === 'excluir') {
      plano.mensagem = 'Cadastro: exclui ' + descricaoProduto(prods[idx]);
      prods.splice(idx, 1);
    } else {
      p = copiar(op.produto);
      if (idx < 0) p.id = idLivre(p.id, prods);
      usados = {};
      Object.keys(lido.arquivos).forEach(function (c) { usados[c] = true; });
      prods.forEach(function (q) { lista(q.imagens).forEach(function (c) { usados[texto(c)] = true; }); });
      p.imagens = op.fotos.map(function (f, i) {
        var c;
        if (!f.nova) return f.caminho;
        c = nomeFotoLivre(p.id, usados);
        usados[c] = true;
        usados[miniatura(c)] = true;
        plano.novasFotos.push({ indice: i, caminho: c });
        return c;
      });
      if (idx >= 0) {
        prods[idx] = p;
        plano.mensagem = 'Cadastro: altera ' + descricaoProduto(p);
      } else {
        // Nova cor entra logo depois do produto de onde foi copiada; produto novo vai para o fim da lista.
        depois = op.depoisDe ? indicePorId(prods, op.depoisDe) : -1;
        if (depois >= 0) prods.splice(depois + 1, 0, p);
        else prods.push(p);
        plano.mensagem = 'Cadastro: novo produto ' + descricaoProduto(p);
      }
      plano.produto = p;
    }

    // Fotos que saíram do produto e não são usadas por mais nenhum: apaga a grande e a miniatura.
    emUso = {};
    prods.forEach(function (q) { lista(q.imagens).forEach(function (c) { emUso[texto(c)] = true; }); });
    antigas.forEach(function (c) {
      if (emUso[c]) return;
      [c, miniatura(c)].forEach(function (x) {
        if (lido.arquivos[x] && plano.apagar.indexOf(x) < 0) plano.apagar.push(x);
      });
    });

    cat.produtos = prods;
    return plano;
  }

  function nomeFotoLivre(id, usados) {
    var n = 1;
    var c;
    do {
      c = DIR_FOTOS + id + '-' + n + '.jpg';
      n++;
    } while (usados[c] || usados[miniatura(c)]);
    return c;
  }

  function idLivre(base, prods) {
    var id = base;
    var n = 2;
    while (indicePorId(prods, id) >= 0) {
      id = base + '-' + n;
      n++;
    }
    return id;
  }

  function gerarId(nome, cor) {
    var base = semAcento([nome, cor].join(' ').toLowerCase())
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/, '');
    return idLivre(base || 'produto', lista(estado.catalogo.produtos));
  }

  /* ================= gravar o catálogo no mesmo formato do arquivo ================= */

  // JSON com 2 espaços, como o arquivo escrito à mão: o que é curto e simples fica numa linha só
  // (ex.: { "tamanho": "40", "estoque": 1 }), e preços sempre com duas casas (499.00).
  function formatarJSON(valor) {
    return formatarValor(valor, 0, '');
  }

  function formatarValor(v, nivel, chave) {
    var ehLista, chaves, partes, linha, recuo;
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'number') {
      if (!isFinite(v)) return 'null';
      return DUAS_CASAS[chave] ? v.toFixed(2) : String(v);
    }
    if (typeof v !== 'object') return JSON.stringify(v);
    ehLista = Array.isArray(v);
    chaves = ehLista ? null : Object.keys(v).filter(function (k) { return v[k] !== undefined; });
    if (!(ehLista ? v.length : chaves.length)) return ehLista ? '[]' : '{}';
    partes = ehLista
      ? v.map(function (x) { return formatarValor(x, nivel + 1, ''); })
      : chaves.map(function (k) { return JSON.stringify(k) + ': ' + formatarValor(v[k], nivel + 1, k); });
    if (cabeNumaLinha(v, nivel, chave)) {
      linha = ehLista ? '[' + partes.join(', ') + ']' : '{ ' + partes.join(', ') + ' }';
      if (linha.indexOf('\n') < 0 && 2 * nivel + (chave ? JSON.stringify(chave).length + 2 : 0) + linha.length + 1 <= LARGURA_LINHA) {
        return linha;
      }
    }
    recuo = espacos(2 * (nivel + 1));
    return (ehLista ? '[' : '{') + '\n' +
      partes.map(function (x) { return recuo + x; }).join(',\n') + '\n' +
      espacos(2 * nivel) + (ehLista ? ']' : '}');
  }

  // Os blocos grandes (loja, categorias, produtos) e a lista de fotos ficam sempre abertos, um item por linha.
  function cabeNumaLinha(v, nivel, chave) {
    var ehLista = Array.isArray(v);
    var itens = ehLista ? v : Object.keys(v).map(function (k) { return v[k]; });
    if (nivel <= 2 || chave === 'imagens') return false;
    return itens.every(function (x) {
      if (x === null || typeof x !== 'object') return true;
      return !ehLista && Array.isArray(x) && x.every(function (y) { return y === null || typeof y !== 'object'; });
    });
  }

  function espacos(n) {
    return new Array(n + 1).join(' ');
  }

  /* ================= catálogo ================= */

  function acharCategoria(id) {
    return lista(estado.catalogo && estado.catalogo.categorias).filter(function (c) { return c.id === id; })[0] || null;
  }

  function acharSub(cat, sid) {
    return lista(cat && cat.subcategorias).filter(function (s) { return s.id === sid; })[0] || null;
  }

  function acharProduto(id) {
    var prods = lista(estado.catalogo && estado.catalogo.produtos);
    var i = indicePorId(prods, id);
    return i >= 0 ? prods[i] : null;
  }

  function indicePorId(prods, id) {
    var i;
    for (i = 0; i < prods.length; i++) {
      if (prods[i] && prods[i].id === id) return i;
    }
    return -1;
  }

  function nomeCategoria(p) {
    var c = acharCategoria(p.categoria);
    var s = acharSub(c, p.subcategoria);
    if (!c) return 'Sem categoria';
    return texto(c.nome) + (s ? ' › ' + texto(s.nome) : '');
  }

  function descricaoProduto(p) {
    return texto(p && p.nome) + (texto(p && p.cor) ? ' (' + texto(p.cor) + ')' : '');
  }

  function emPromocao(p) {
    return typeof p.precoPromocional === 'number' && p.precoPromocional > 0 && typeof p.preco === 'number' && p.precoPromocional < p.preco;
  }

  function desconto(p) {
    return Math.round((1 - p.precoPromocional / p.preco) * 100);
  }

  function estoqueTotal(p) {
    return lista(p.tamanhos).reduce(function (soma, t) { return soma + Math.max(0, inteiro(t.estoque)); }, 0);
  }

  /* ================= utilidades ================= */

  function texto(v) {
    return (v === null || v === undefined) ? '' : String(v).trim();
  }

  function lista(v) {
    return (v && typeof v !== 'string' && typeof v.length === 'number') ? v : [];
  }

  function valoresDe(obj) {
    return obj && typeof obj === 'object' ? Object.keys(obj).map(function (k) { return obj[k]; }) : [];
  }

  function copiar(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function inteiro(v) {
    var n = Math.floor(Number(v));
    return isFinite(n) ? n : 0;
  }

  function limparEspacos(v) {
    return texto(v).replace(/\s+/g, ' ');
  }

  function semAcento(s) {
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }

  function idSeguro(s) {
    return String(s).replace(/[^\w-]/g, '_');
  }

  // Aceita "429,90", "429.90", "1.299,90" e "R$ 499".
  function lerPreco(v) {
    var s = texto(v).replace(/r\$|\s/gi, '');
    if (!s) return null;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    return Math.round(Number(s) * 100) / 100;
  }

  function precoParaCampo(n) {
    return typeof n === 'number' && isFinite(n) ? n.toFixed(2).replace('.', ',') : '';
  }

  function dinheiro(v) {
    var n = Number(v);
    var partes;
    if (formatador) return formatador.format(n);
    partes = n.toFixed(2).split('.');
    return 'R$ ' + partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + partes[1];
  }

  function hoje() {
    var d = new Date();
    return d.getFullYear() + '-' + dois(d.getMonth() + 1) + '-' + dois(d.getDate());
  }

  function hora(d) {
    return d ? dois(d.getHours()) + ':' + dois(d.getMinutes()) : '--:--';
  }

  function dois(n) {
    return (n < 10 ? '0' : '') + n;
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
        else if (k === 'value' && (tag === 'input' || tag === 'textarea')) n.value = String(v);
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
})();
