/*
  Contas, favoritos, carrinho e pedidos da loja.
  Monta as páginas conta.html, carrinho.html, finalizar.html, pedido.html e dono.html,
  e liga o botão de favoritar da página de produto.

  O login e o banco de dados são do Firebase (serviço do Google). Ele só é carregado nas
  páginas que precisam, e só se js/firebase-config.js estiver preenchido.
  Quem protege os dados dos clientes são as regras do Firestore, no arquivo
  firebase/regras-firestore.rules da pasta do projeto.

  Valores de dinheiro nos pedidos ficam em centavos (números inteiros), para não haver
  erro de arredondamento. Textos de clientes e do catálogo entram sempre com textContent.
*/
(function () {
  'use strict';

  var L = window.Loja;
  if (!L || !L.catalogo) return;

  var el = L.el;
  var texto = L.texto;
  var limpar = L.limpar;
  var conteudo = L.conteudo;

  var FIREBASE = 'https://www.gstatic.com/firebasejs/12.4.0/';
  var SCRIPTS_FIREBASE = [
    ['firebase-app-compat.js', 'sha384-NGw427w9kUd0u0OjHkygdwNKinWp4DiQMkOsafkwq98j2+E3EN8pn0oSlx3Fe61F'],
    ['firebase-auth-compat.js', 'sha384-P44Lc4FFaOc/XnFQzAIpmmZZpAstRvYwQLiHHU5LHtlBmblzk5gCbsRCe4hJY6IN'],
    ['firebase-firestore-compat.js', 'sha384-DW7welpkxbrycUYGrFJDY26esOqRCi4XxdQi/owqbMLv8q2x9QWoJCrvVyD0UKmu']
  ];
  var QRCODE = ['https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'sha384-3zSEDfvllQohrq0PHL1fOXJuC/jSOO34H46t6UQfobFOmxE5BpjjaIJY5F2/bMnU'];

  var STATUS = [
    { id: 'aguardando-pagamento', nome: 'Aguardando pagamento', frase: 'Pague o Pix abaixo. Quando a loja confirmar o pagamento, o status muda aqui.' },
    { id: 'pago', nome: 'Pagamento confirmado', frase: 'Recebemos seu pagamento e estamos separando o pedido.' },
    { id: 'enviado', nome: 'Enviado', frase: 'Seu pedido saiu para entrega.' },
    { id: 'entregue', nome: 'Entregue', frase: 'Pedido entregue. Bom jogo!' },
    { id: 'cancelado', nome: 'Cancelado', frase: 'Este pedido foi cancelado. Se tiver dúvida, fale com a loja.' }
  ];

  var ERROS = {
    'auth/invalid-email': 'Esse e-mail não parece válido.',
    'auth/missing-email': 'Digite seu e-mail.',
    'auth/missing-password': 'Digite sua senha.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/user-disabled': 'Esta conta foi desativada. Fale com a loja.',
    'auth/email-already-in-use': 'Já existe uma conta com este e-mail. Tente entrar, ou use "Esqueci minha senha".',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
    'auth/network-request-failed': 'Sem conexão com a internet. Confira e tente de novo.',
    'auth/operation-not-allowed': 'Esse jeito de entrar ainda não foi ativado pela loja.',
    'auth/unauthorized-domain': 'Este endereço do site ainda não foi autorizado no Firebase (Authentication > Configurações > Domínios autorizados).',
    'auth/account-exists-with-different-credential': 'Este e-mail já tem conta com outro jeito de entrar. Tente com e-mail e senha.',
    'auth/requires-recent-login': 'Por segurança, saia da conta, entre de novo e repita.',
    'auth/popup-closed-by-user': '',
    'auth/cancelled-popup-request': '',
    'permission-denied': 'Não foi possível concluir. Atualize a página e tente de novo.',
    'unavailable': 'Sem conexão com o servidor. Confira a internet e tente de novo.'
  };

  /* ================= Firebase (carregado só quando precisa) ================= */

  var promessaFirebase = null;

  function carregarScript(src, integridade) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      if (integridade) {
        s.integrity = integridade; // o navegador recusa o arquivo se ele tiver sido alterado
        s.crossOrigin = 'anonymous';
      }
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Não carregou ' + src)); };
      document.head.appendChild(s);
    });
  }

  // Devolve uma promessa com { fb, auth, db }.
  function abrirFirebase() {
    if (!promessaFirebase) {
      promessaFirebase = SCRIPTS_FIREBASE.reduce(function (anterior, s) {
        return anterior.then(function () { return carregarScript(FIREBASE + s[0], s[1]); });
      }, Promise.resolve()).then(function () {
        var fb = window.firebase;
        var auth;
        if (!fb.apps.length) fb.initializeApp(window.FIREBASE_CONFIG);
        auth = fb.auth();
        auth.languageCode = 'pt-BR'; // e-mails de confirmação e de nova senha em português
        return { fb: fb, auth: auth, db: fb.firestore() };
      });
    }
    return promessaFirebase;
  }

  function usuarioLogado(f) {
    return new Promise(function (resolve) {
      var parar = f.auth.onAuthStateChanged(function (u) {
        parar();
        resolve(u);
      });
    });
  }

  function agora(f) {
    return f.fb.firestore.FieldValue.serverTimestamp();
  }

  function mensagemErro(e) {
    var codigo = e && e.code;
    if (codigo && Object.prototype.hasOwnProperty.call(ERROS, codigo)) return ERROS[codigo];
    if (window.console) window.console.error('Loja:', e);
    return 'Não deu certo. Tente de novo em instantes.';
  }

  /* ================= pedaços de tela ================= */

  function titulo(t) {
    L.definirTitulo(t + ' | ' + L.nomeLoja);
  }

  function secaoPagina(tituloTexto, filhos) {
    return el('section', { classe: 'secao secao-topo pagina-compra' },
      [el('h1', { classe: 'pagina-titulo', texto: tituloTexto })].concat(filhos || []));
  }

  function bloco(tituloTexto, filhos) {
    return el('section', { classe: 'secao' }, [el('h2', { classe: 'secao-titulo', texto: tituloTexto })].concat(filhos || []));
  }

  function mensagem(tipo, t) {
    var m = el('p', { classe: 'mensagem mensagem-' + tipo, role: tipo === 'erro' ? 'alert' : 'status', texto: t || '' });
    m.hidden = !t;
    return m;
  }

  function mostrarMensagem(m, tipo, t) {
    m.className = 'mensagem mensagem-' + tipo;
    m.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
    m.textContent = t || '';
    m.hidden = !t;
  }

  function carregando(t) {
    return el('p', { classe: 'secao carregando', role: 'status', texto: t || 'Carregando...' });
  }

  function aviso(tituloTexto, frase, linkTexto, linkHref) {
    return el('div', { classe: 'secao secao-topo' }, [L.caixaAviso(1, tituloTexto, frase, linkTexto, linkHref)]);
  }

  function emBreve() {
    limpar(conteudo);
    conteudo.appendChild(aviso('Compras pelo site em breve',
      'Estamos preparando o carrinho e os pedidos pelo site. Enquanto isso, fale com a gente pelo WhatsApp.',
      'Ver a loja', 'index.html'));
  }

  function entrada(id, tipo, extras) {
    var props = { id: id, name: id, type: tipo };
    var k;
    for (k in extras) {
      if (Object.prototype.hasOwnProperty.call(extras, k)) props[k] = extras[k];
    }
    return el('input', props);
  }

  function campo(rotulo, controle, dica) {
    return el('div', { classe: 'campo' }, [
      el('label', { 'for': controle.id, texto: rotulo }),
      controle,
      dica ? el('p', { classe: 'campo-dica', texto: dica }) : null
    ]);
  }

  function botao(textoBotao, classe, aoClicar) {
    var b = el('button', { type: 'button', classe: classe || 'botao', texto: textoBotao });
    if (aoClicar) b.addEventListener('click', aoClicar);
    return b;
  }

  function ocupado(form, sim) {
    var itens = form.querySelectorAll('button, input, select, textarea');
    var i;
    for (i = 0; i < itens.length; i++) itens[i].disabled = sim;
  }

  function emCentavos(reais) {
    return Math.round(Number(reais) * 100);
  }

  function reais(centavos) {
    return L.dinheiro(centavos / 100);
  }

  function dataHora(ts, comHora) {
    var d = ts && ts.toDate ? ts.toDate() : null;
    if (!d) return '';
    return d.toLocaleDateString('pt-BR') + (comHora ? ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
  }

  function acharStatus(id) {
    var i;
    for (i = 0; i < STATUS.length; i++) if (STATUS[i].id === id) return STATUS[i];
    return { id: id, nome: id, frase: '' };
  }

  function seloStatus(id) {
    return el('span', { classe: 'status status-' + id, texto: acharStatus(id).nome });
  }

  function ambienteAtual() {
    return window.AMBIENTE === 'teste' ? 'teste' : 'oficial';
  }

  function acharRegiao(id) {
    var regioes = L.regioesEntrega();
    var i;
    for (i = 0; i < regioes.length; i++) if (regioes[i].id === id) return regioes[i];
    return null;
  }

  // Só aceita voltar para uma página do próprio site (evita mandar o cliente para outro site).
  function destinoSeguro(v) {
    return /^[a-z]+\.html(\?[A-Za-z0-9=&%._-]*)?$/.test(v || '') ? v : '';
  }

  function linkWhats(numero, mensagemTexto, rotulo, classe) {
    var zap = L.soNumeros(numero);
    if (!zap) return null;
    return el('a', {
      href: 'https://wa.me/' + zap + (mensagemTexto ? '?text=' + encodeURIComponent(mensagemTexto) : ''),
      target: '_blank',
      rel: 'noopener',
      classe: classe || null,
      texto: rotulo
    });
  }

  function iconeGoogle() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    var partes = [
      ['#EA4335', 'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'],
      ['#4285F4', 'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'],
      ['#FBBC05', 'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'],
      ['#34A853', 'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z']
    ];
    var i, p;
    svg.setAttribute('viewBox', '0 0 48 48');
    svg.setAttribute('aria-hidden', 'true');
    for (i = 0; i < partes.length; i++) {
      p = document.createElementNS(ns, 'path');
      p.setAttribute('fill', partes[i][0]);
      p.setAttribute('d', partes[i][1]);
      svg.appendChild(p);
    }
    return svg;
  }

  /* ================= Pix (código "copia e cola" do Banco Central) ================= */

  function semAcento(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E]/g, '');
  }

  function campoPix(id, valor) {
    var v = String(valor);
    return id + (v.length < 10 ? '0' : '') + v.length + v;
  }

  function crc16(s) {
    var crc = 0xFFFF;
    var i, j;
    for (i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
      }
    }
    return ('0000' + crc.toString(16).toUpperCase()).slice(-4);
  }

  // Monta o código Pix com a chave da loja, o valor e o número do pedido.
  function codigoPix(chave, nome, cidade, centavos, identificador) {
    var conta = campoPix('00', 'br.gov.bcb.pix') + campoPix('01', texto(chave));
    var txid = semAcento(identificador).replace(/[^A-Za-z0-9]/g, '').substr(0, 25) || '***';
    var corpo = campoPix('00', '01') +
      campoPix('26', conta) +
      campoPix('52', '0000') +
      campoPix('53', '986') +
      (centavos > 0 ? campoPix('54', (centavos / 100).toFixed(2)) : '') +
      campoPix('58', 'BR') +
      campoPix('59', semAcento(nome).substr(0, 25)) +
      campoPix('60', semAcento(cidade).substr(0, 15)) +
      campoPix('62', campoPix('05', txid)) +
      '6304';
    return corpo + crc16(corpo);
  }

  L.pix = { codigo: codigoPix, crc16: crc16 }; // usado para conferir o código em testes

  function novoNumeroPedido() {
    var letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var d = new Date();
    var data = String(d.getFullYear()).substr(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
    var sorteio = new Uint32Array(4);
    var sufixo = '';
    var i;
    window.crypto.getRandomValues(sorteio);
    for (i = 0; i < 4; i++) sufixo += letras.charAt(sorteio[i] % letras.length);
    return 'P' + data + '-' + sufixo;
  }

  /* ================= login ================= */

  // Abre o Firebase e chama aoTerUsuario(f, usuario) sempre que alguém entra.
  // Sem ninguém logado, mostra a caixa de entrar com a frase dada.
  function exigirLogin(aoTerUsuario, fraseLogin) {
    limpar(conteudo);
    conteudo.appendChild(carregando());
    abrirFirebase().then(function (f) {
      f.auth.onAuthStateChanged(function (u) {
        limpar(conteudo);
        if (u) aoTerUsuario(f, u);
        else conteudo.appendChild(el('div', { classe: 'secao secao-topo' }, [caixaLogin(f, fraseLogin)]));
      });
    }).catch(function (e) {
      if (window.console) window.console.error('Loja:', e);
      limpar(conteudo);
      conteudo.appendChild(aviso('Não conseguimos abrir sua conta agora',
        'Confira sua internet e atualize a página. Se continuar, tente mais tarde.', 'Voltar para a loja', 'index.html'));
    });
  }

  function caixaLogin(f, frase) {
    var caixa = el('div', { classe: 'login' });
    var modo = 'entrar';
    var msg = mensagem('erro', '');

    function trocar(novoModo) {
      modo = novoModo;
      montar();
    }

    function entrarComGoogle() {
      var provedor = new f.fb.auth.GoogleAuthProvider();
      mostrarMensagem(msg, 'erro', '');
      provedor.setCustomParameters({ prompt: 'select_account' });
      f.auth.signInWithPopup(provedor).catch(function (e) {
        if (e && e.code === 'auth/popup-blocked') return f.auth.signInWithRedirect(provedor);
        mostrarMensagem(msg, 'erro', mensagemErro(e));
      });
    }

    function formEntrar() {
      var email = entrada('login-email', 'email', { autocomplete: 'email', required: true });
      var senha = entrada('login-senha', 'password', { autocomplete: 'current-password', required: true });
      var form = el('form', { classe: 'formulario', novalidate: true }, [
        campo('E-mail', email),
        campo('Senha', senha),
        el('button', { type: 'submit', classe: 'botao botao-largo', texto: 'Entrar' })
      ]);
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        mostrarMensagem(msg, 'erro', '');
        ocupado(form, true);
        f.auth.signInWithEmailAndPassword(email.value.trim(), senha.value).catch(function (e) {
          ocupado(form, false);
          mostrarMensagem(msg, 'erro', mensagemErro(e));
        });
      });
      return form;
    }

    function formCriar() {
      var nome = entrada('criar-nome', 'text', { autocomplete: 'name', maxlength: '100', required: true });
      var email = entrada('criar-email', 'email', { autocomplete: 'email', required: true });
      var senha = entrada('criar-senha', 'password', { autocomplete: 'new-password', minlength: '6', required: true });
      var confirmar = entrada('criar-confirmar', 'password', { autocomplete: 'new-password', required: true });
      var form = el('form', { classe: 'formulario', novalidate: true }, [
        campo('Nome', nome),
        campo('E-mail', email),
        campo('Senha', senha, 'Pelo menos 6 caracteres. Use uma senha que você não usa em outros sites.'),
        campo('Repita a senha', confirmar),
        el('button', { type: 'submit', classe: 'botao botao-largo', texto: 'Criar conta' })
      ]);
      form.addEventListener('submit', function (ev) {
        var n = nome.value.trim();
        ev.preventDefault();
        if (n.length < 2) return mostrarMensagem(msg, 'erro', 'Digite seu nome.');
        if (senha.value !== confirmar.value) return mostrarMensagem(msg, 'erro', 'As duas senhas estão diferentes.');
        mostrarMensagem(msg, 'erro', '');
        ocupado(form, true);
        f.auth.createUserWithEmailAndPassword(email.value.trim(), senha.value).then(function (cred) {
          return cred.user.updateProfile({ displayName: n }).then(function () {
            return cred.user.sendEmailVerification();
          });
        }).catch(function (e) {
          ocupado(form, false);
          mostrarMensagem(msg, 'erro', mensagemErro(e));
        });
      });
      return form;
    }

    function formEsqueci() {
      var email = entrada('esqueci-email', 'email', { autocomplete: 'email', required: true });
      var form = el('form', { classe: 'formulario', novalidate: true }, [
        campo('E-mail da sua conta', email),
        el('button', { type: 'submit', classe: 'botao botao-largo', texto: 'Enviar link' })
      ]);
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        ocupado(form, true);
        f.auth.sendPasswordResetEmail(email.value.trim()).then(function () {
          ocupado(form, false);
          mostrarMensagem(msg, 'ok', 'Se existir uma conta com esse e-mail, enviamos um link para criar uma senha nova. Confira também a caixa de spam.');
        }).catch(function (e) {
          ocupado(form, false);
          mostrarMensagem(msg, 'erro', mensagemErro(e));
        });
      });
      return form;
    }

    function montar() {
      var titulos = { entrar: 'Entrar', criar: 'Criar conta', esqueci: 'Criar uma senha nova' };
      var google = el('button', { type: 'button', classe: 'botao botao-google' }, [iconeGoogle(), el('span', { texto: 'Entrar com Google' })]);
      google.addEventListener('click', entrarComGoogle);
      mostrarMensagem(msg, 'erro', '');
      limpar(caixa);
      caixa.appendChild(el('h2', { texto: titulos[modo] }));
      if (frase && modo === 'entrar') caixa.appendChild(el('p', { classe: 'login-frase', texto: frase }));
      if (modo !== 'esqueci') {
        caixa.appendChild(google);
        caixa.appendChild(el('p', { classe: 'divisor', texto: 'ou com e-mail' }));
      }
      caixa.appendChild(modo === 'criar' ? formCriar() : modo === 'esqueci' ? formEsqueci() : formEntrar());
      caixa.appendChild(msg);
      caixa.appendChild(el('div', { classe: 'login-links' }, modo === 'entrar'
        ? [botao('Criar conta', 'botao-texto', function () { trocar('criar'); }),
           botao('Esqueci minha senha', 'botao-texto', function () { trocar('esqueci'); })]
        : [botao('Já tenho conta: entrar', 'botao-texto', function () { trocar('entrar'); })]));
      caixa.appendChild(el('p', { classe: 'nota-privacidade' }, [
        'Ao entrar ou criar conta, você concorda com o nosso ',
        el('a', { href: 'privacidade.html', texto: 'Aviso de privacidade' }),
        '.'
      ]));
    }

    montar();
    return caixa;
  }

  // Contas com e-mail e senha precisam confirmar o e-mail antes de fazer pedido.
  function caixaConfirmarEmail(f, u, aoConfirmar) {
    var msg = mensagem('ok', '');
    var reenviar = botao('Reenviar e-mail', 'botao botao-secundario', function () {
      reenviar.disabled = true;
      u.sendEmailVerification().then(function () {
        mostrarMensagem(msg, 'ok', 'Enviamos de novo. Confira também a caixa de spam.');
      }).catch(function (e) {
        reenviar.disabled = false;
        mostrarMensagem(msg, 'erro', mensagemErro(e));
      });
    });
    var jaConfirmei = botao('Já confirmei', 'botao', function () {
      jaConfirmei.disabled = true;
      u.reload().then(function () {
        return f.auth.currentUser.getIdToken(true); // atualiza a "carteirinha" do login com o e-mail confirmado
      }).then(function () {
        if (f.auth.currentUser.emailVerified) aoConfirmar();
        else {
          jaConfirmei.disabled = false;
          mostrarMensagem(msg, 'erro', 'Ainda não aparece como confirmado. Clique no link do e-mail e tente de novo.');
        }
      }).catch(function (e) {
        jaConfirmei.disabled = false;
        mostrarMensagem(msg, 'erro', mensagemErro(e));
      });
    });
    return el('div', { classe: 'caixa caixa-alerta' }, [
      el('h2', { texto: 'Confirme seu e-mail' }),
      el('p', { texto: 'Enviamos um link de confirmação para ' + u.email + '. Abra o e-mail, clique no link e depois volte aqui.' }),
      el('div', { classe: 'botoes' }, [jaConfirmei, reenviar]),
      msg
    ]);
  }

  /* ================= favoritar (página de produto) ================= */

  function ligarFavorito() {
    var b = document.querySelector('[data-favorito]');
    var estado = { f: null, u: null, marcado: false };
    var id, rotulo;
    if (!b || !L.contasAtivas()) return;
    id = b.getAttribute('data-favorito');
    rotulo = b.querySelector('span');

    function mostrar(marcado) {
      estado.marcado = marcado;
      b.setAttribute('aria-pressed', marcado ? 'true' : 'false');
      if (marcado) b.classList.add('favorito-ativo');
      else b.classList.remove('favorito-ativo');
      rotulo.textContent = marcado ? 'Nos seus favoritos' : 'Favoritar';
    }

    abrirFirebase().then(function (f) {
      estado.f = f;
      return usuarioLogado(f);
    }).then(function (u) {
      estado.u = u;
      if (!u) return null;
      return estado.f.db.collection('usuarios').doc(u.uid).get().then(function (d) {
        var favoritos = (d.exists && d.data().favoritos) || [];
        mostrar(favoritos.indexOf(id) >= 0);
      });
    }).catch(function (e) {
      if (window.console) window.console.error('Loja:', e);
    });

    b.addEventListener('click', function () {
      var novo, valor;
      if (!estado.f) return; // ainda carregando
      if (!estado.u) {
        window.location.href = 'conta.html?voltar=' + encodeURIComponent('produto.html?id=' + id);
        return;
      }
      novo = !estado.marcado;
      valor = estado.f.fb.firestore.FieldValue;
      mostrar(novo);
      b.disabled = true;
      estado.f.db.collection('usuarios').doc(estado.u.uid).set({
        favoritos: novo ? valor.arrayUnion(id) : valor.arrayRemove(id),
        atualizadoEm: agora(estado.f)
      }, { merge: true }).catch(function (e) {
        mostrar(!novo);
        if (window.console) window.console.error('Loja:', e);
      }).then(function () {
        b.disabled = false;
      });
    });
  }

  /* ================= carrinho.html ================= */

  // Itens do carrinho conferidos com o catálogo. problema = algum item sumiu ou passou do estoque.
  function linhasDoCarrinho() {
    var linhas = [];
    var problema = false;
    L.lerCarrinho().forEach(function (item) {
      var p = L.acharProduto(item.id);
      var maximo = p ? L.estoqueDe(p, item.tamanho) : 0;
      if (!p || maximo < item.quantidade) {
        problema = true;
        return;
      }
      linhas.push({
        produto: p,
        id: p.id,
        nome: texto(p.nome) + (texto(p.cor) ? ' (' + texto(p.cor) + ')' : ''),
        tamanho: item.tamanho,
        quantidade: item.quantidade,
        precoCentavos: emCentavos(L.precoFinal(p))
      });
    });
    return { linhas: linhas, problema: problema };
  }

  function somaCentavos(linhas) {
    return linhas.reduce(function (s, l) { return s + l.precoCentavos * l.quantidade; }, 0);
  }

  function linhaResumo(rotulo, valor, classe) {
    return el('p', { classe: 'resumo-linha' + (classe ? ' ' + classe : '') }, [
      el('span', { texto: rotulo }),
      el('strong', { texto: valor })
    ]);
  }

  function paginaCarrinho() {
    titulo('Carrinho');
    if (!L.vendasAbertas()) return emBreve();
    montarCarrinho();
  }

  function mudarQuantidade(indice, nova) {
    var itens = L.lerCarrinho();
    if (!itens[indice]) return;
    if (nova <= 0) itens.splice(indice, 1);
    else itens[indice].quantidade = nova;
    L.salvarCarrinho(itens);
    montarCarrinho();
  }

  function montarCarrinho() {
    var itens = L.lerCarrinho();
    var lista = el('ul', { classe: 'carrinho-lista' });
    var subtotal = 0;
    var problemas = 0;
    var ajustou = false;

    limpar(conteudo);
    if (!itens.length) {
      conteudo.appendChild(aviso('Seu carrinho está vazio', 'Escolha um produto e toque em "Adicionar ao carrinho".', 'Ver a loja', 'index.html'));
      return;
    }

    itens.forEach(function (item, indice) {
      var p = L.acharProduto(item.id);
      var maximo = p ? L.estoqueDe(p, item.tamanho) : 0;
      var remover = botao('Remover', 'botao-texto', function () { mudarQuantidade(indice, 0); });
      var preco, menos, mais;

      if (!p || maximo === 0) {
        problemas++;
        lista.appendChild(el('li', { classe: 'carrinho-item carrinho-indisponivel' }, [
          L.fotoPequena(p ? L.imagensDe(p)[0] : 'img/sem-foto.svg', p ? texto(p.nome) : 'Produto'),
          el('div', null, [
            el('p', { classe: 'carrinho-nome', texto: p ? texto(p.nome) : 'Produto que saiu da loja' }),
            el('p', { classe: 'carrinho-detalhe', texto: 'Tamanho ' + item.tamanho + ': indisponível no momento. Remova para continuar.' })
          ]),
          el('div', { classe: 'carrinho-acoes' }, [remover])
        ]));
        return;
      }

      if (item.quantidade > maximo) {
        itens[indice].quantidade = maximo;
        ajustou = true;
      }
      preco = emCentavos(L.precoFinal(p));
      subtotal += preco * itens[indice].quantidade;
      menos = botao('−', null, function () { mudarQuantidade(indice, itens[indice].quantidade - 1); });
      mais = botao('+', null, function () { mudarQuantidade(indice, itens[indice].quantidade + 1); });
      menos.setAttribute('aria-label', 'Diminuir quantidade');
      mais.setAttribute('aria-label', 'Aumentar quantidade');
      mais.disabled = itens[indice].quantidade >= maximo;

      lista.appendChild(el('li', { classe: 'carrinho-item' }, [
        L.fotoPequena(L.imagensDe(p)[0], texto(p.nome)),
        el('div', null, [
          el('a', { href: L.linkProduto(p.id), classe: 'carrinho-nome', texto: texto(p.nome) }),
          el('p', { classe: 'carrinho-detalhe', texto: 'Tamanho ' + item.tamanho + (texto(p.cor) ? ' · ' + texto(p.cor) : '') + ' · ' + reais(preco) + ' cada' })
        ]),
        el('div', { classe: 'carrinho-acoes' }, [
          el('div', { classe: 'quantidade', role: 'group', 'aria-label': 'Quantidade' }, [
            menos, el('span', { texto: String(itens[indice].quantidade) }), mais
          ]),
          el('strong', { texto: reais(preco * itens[indice].quantidade) }),
          remover
        ])
      ]));
    });

    if (ajustou) L.salvarCarrinho(itens);

    var finalizar = el('a', { href: 'finalizar.html', classe: 'botao botao-largo', texto: 'Finalizar pedido' });
    if (problemas) {
      finalizar = el('button', { type: 'button', classe: 'botao botao-largo', disabled: true, texto: 'Finalizar pedido' });
    }

    conteudo.appendChild(secaoPagina('Carrinho', [
      el('div', { classe: 'layout-compra' }, [
        el('div', null, [
          ajustou ? mensagem('erro', 'Alguns itens tinham mais unidades do que o estoque. Ajustamos para o máximo disponível.') : null,
          lista
        ]),
        el('div', { classe: 'resumo' }, [
          linhaResumo('Subtotal', reais(subtotal)),
          el('p', { classe: 'resumo-nota', texto: 'O frete é calculado na próxima etapa, pela região de entrega.' }),
          problemas ? mensagem('erro', 'Remova os itens indisponíveis para continuar.') : null,
          finalizar,
          el('a', { href: 'index.html', classe: 'resumo-continuar', texto: 'Continuar comprando' })
        ])
      ])
    ]));
  }

  /* ================= finalizar.html ================= */

  function paginaFinalizar() {
    titulo('Finalizar pedido');
    if (!L.vendasAbertas()) return emBreve();
    if (!L.lerCarrinho().length) {
      conteudo.appendChild(aviso('Seu carrinho está vazio', 'Escolha um produto antes de finalizar.', 'Ver a loja', 'index.html'));
      return;
    }
    exigirLogin(function (f, u) {
      if (!u.emailVerified) {
        conteudo.appendChild(secaoPagina('Finalizar pedido', [caixaConfirmarEmail(f, u, function () { window.location.reload(); })]));
        return;
      }
      conteudo.appendChild(carregando('Carregando seus dados...'));
      f.db.collection('usuarios').doc(u.uid).get().then(function (d) {
        return d.exists ? d.data() : {};
      }).catch(function () {
        return {};
      }).then(function (perfil) {
        limpar(conteudo);
        montarFormularioPedido(f, u, perfil);
      });
    }, 'Entre na sua conta para finalizar o pedido. É rápido: dá para usar a conta do Google.');
  }

  function montarFormularioPedido(f, u, perfil) {
    var carrinho = linhasDoCarrinho();
    var salvo = perfil.entrega || {};
    var regioes = L.regioesEntrega();
    var enviando = false;

    if (carrinho.problema || !carrinho.linhas.length) {
      conteudo.appendChild(aviso('Confira seu carrinho', 'Algum item ficou indisponível ou mudou de estoque.', 'Ver carrinho', 'carrinho.html'));
      return;
    }

    var nome = entrada('f-nome', 'text', { autocomplete: 'name', maxlength: '100', required: true, value: texto(perfil.nome) || texto(u.displayName) });
    var telefone = entrada('f-telefone', 'tel', { autocomplete: 'tel', maxlength: '30', required: true, value: texto(perfil.telefone), placeholder: '(43) 99999-9999' });
    var regiao = el('select', { id: 'f-regiao', name: 'f-regiao', required: true }, [el('option', { value: '', texto: 'Escolha onde entregar' })]);
    regioes.forEach(function (r) {
      regiao.appendChild(el('option', { value: r.id, texto: texto(r.nome) + ' · ' + (r.valor > 0 ? L.dinheiro(r.valor) : 'grátis') }));
    });
    if (acharRegiao(salvo.regiao)) regiao.value = salvo.regiao;
    var cep = entrada('f-cep', 'text', { autocomplete: 'postal-code', inputmode: 'numeric', maxlength: '9', value: texto(salvo.cep) });
    var rua = entrada('f-rua', 'text', { autocomplete: 'address-line1', maxlength: '150', required: true, value: texto(salvo.rua) });
    var numero = entrada('f-numero', 'text', { maxlength: '20', required: true, value: texto(salvo.numero) });
    var complemento = entrada('f-complemento', 'text', { autocomplete: 'address-line2', maxlength: '100', value: texto(salvo.complemento) });
    var bairro = entrada('f-bairro', 'text', { maxlength: '100', required: true, value: texto(salvo.bairro) });
    var cidade = entrada('f-cidade', 'text', { autocomplete: 'address-level2', maxlength: '100', required: true, value: texto(salvo.cidade) });
    var observacao = el('textarea', { id: 'f-observacao', name: 'f-observacao', maxlength: '500', rows: '3' });
    var salvar = entrada('f-salvar', 'checkbox', { checked: true });
    var erro = mensagem('erro', '');
    var enviar = el('button', { type: 'submit', classe: 'botao botao-largo', texto: 'Fazer pedido' });

    var subtotal = somaCentavos(carrinho.linhas);
    var linhaFrete = el('strong', { texto: '—' });
    var linhaTotal = el('strong', { texto: reais(subtotal) });

    function freteCentavos() {
      var r = acharRegiao(regiao.value);
      return r ? emCentavos(r.valor) : null;
    }

    function atualizarResumo() {
      var frete = freteCentavos();
      linhaFrete.textContent = frete === null ? 'escolha a região' : frete > 0 ? reais(frete) : 'grátis';
      linhaTotal.textContent = reais(subtotal + (frete || 0));
    }
    regiao.addEventListener('change', atualizarResumo);
    atualizarResumo();

    var itensResumo = el('ul', { classe: 'itens-pedido' });
    carrinho.linhas.forEach(function (l) {
      itensResumo.appendChild(el('li', null, [
        el('span', { texto: l.quantidade + '× ' + l.nome + ' · tam. ' + l.tamanho }),
        el('span', { texto: reais(l.precoCentavos * l.quantidade) })
      ]));
    });

    var form = el('form', { classe: 'formulario', novalidate: true }, [
      el('fieldset', { classe: 'grupo' }, [
        el('legend', { texto: 'Seus dados' }),
        campo('Nome completo', nome),
        campo('Telefone (WhatsApp)', telefone, 'A loja usa para falar com você sobre o pedido.')
      ]),
      el('fieldset', { classe: 'grupo' }, [
        el('legend', { texto: 'Entrega' }),
        campo('Região de entrega', regiao),
        campo('CEP', cep),
        campo('Rua', rua),
        el('div', { classe: 'campos-2' }, [campo('Número', numero), campo('Complemento', complemento)]),
        campo('Bairro', bairro),
        campo('Cidade', cidade)
      ]),
      el('fieldset', { classe: 'grupo' }, [
        el('legend', { texto: 'Pagamento' }),
        el('p', { classe: 'grupo-texto', texto: 'Pix. Depois de fazer o pedido, aparece o código para pagar. A loja confere o pagamento e prepara a entrega.' })
      ]),
      campo('Observação (opcional)', observacao),
      el('div', { classe: 'campo-check' }, [salvar, el('label', { 'for': 'f-salvar', texto: 'Guardar meus dados para a próxima compra' })]),
      erro,
      enviar,
      el('p', { classe: 'nota-privacidade' }, [
        'Seus dados são usados só para entregar este pedido. Veja o ',
        el('a', { href: 'privacidade.html', texto: 'Aviso de privacidade' }),
        '.'
      ])
    ]);

    function validar() {
      var tel = L.soNumeros(telefone.value);
      var cepNum = L.soNumeros(cep.value);
      if (nome.value.trim().length < 2) return [nome, 'Digite seu nome completo.'];
      if (tel.length < 10 || tel.length > 13) return [telefone, 'Digite um telefone com DDD.'];
      if (!acharRegiao(regiao.value)) return [regiao, 'Escolha a região de entrega.'];
      if (cep.value.trim() && cepNum.length !== 8) return [cep, 'O CEP tem 8 números.'];
      if (!rua.value.trim()) return [rua, 'Digite a rua.'];
      if (!numero.value.trim()) return [numero, 'Digite o número (ou "s/n").'];
      if (!bairro.value.trim()) return [bairro, 'Digite o bairro.'];
      if (!cidade.value.trim()) return [cidade, 'Digite a cidade.'];
      return null;
    }

    form.addEventListener('submit', function (ev) {
      var problema, atual, r, entrega, pedido;
      ev.preventDefault();
      if (enviando) return;
      problema = validar();
      if (problema) {
        mostrarMensagem(erro, 'erro', problema[1]);
        problema[0].focus();
        return;
      }
      atual = linhasDoCarrinho(); // o estoque pode ter mudado enquanto a pessoa preenchia
      if (atual.problema || somaCentavos(atual.linhas) !== subtotal) {
        mostrarMensagem(erro, 'erro', 'Seu carrinho mudou. Volte ao carrinho, confira e tente de novo.');
        return;
      }
      r = acharRegiao(regiao.value);
      entrega = {
        regiao: r.id,
        cep: cep.value.trim(),
        rua: rua.value.trim(),
        numero: numero.value.trim(),
        complemento: complemento.value.trim(),
        bairro: bairro.value.trim(),
        cidade: cidade.value.trim()
      };
      pedido = {
        uid: u.uid,
        email: u.email,
        ambiente: ambienteAtual(),
        status: 'aguardando-pagamento',
        pagamento: 'pix',
        cliente: { nome: nome.value.trim(), telefone: telefone.value.trim() },
        entrega: {
          regiao: r.id,
          regiaoNome: texto(r.nome),
          cep: entrega.cep,
          rua: entrega.rua,
          numero: entrega.numero,
          complemento: entrega.complemento,
          bairro: entrega.bairro,
          cidade: entrega.cidade
        },
        itens: atual.linhas.map(function (l) {
          return { id: l.id, nome: l.nome, tamanho: l.tamanho, quantidade: l.quantidade, precoCentavos: l.precoCentavos };
        }),
        subtotalCentavos: subtotal,
        freteCentavos: emCentavos(r.valor),
        totalCentavos: subtotal + emCentavos(r.valor),
        observacao: observacao.value.trim(),
        criadoEm: agora(f)
      };

      enviando = true;
      mostrarMensagem(erro, 'erro', '');
      ocupado(form, true);
      enviar.textContent = 'Enviando pedido...';

      u.getIdToken(true).then(function () {
        return criarPedido(f, pedido, 0);
      }).then(function (numeroPedido) {
        var guardar = salvar.checked
          ? f.db.collection('usuarios').doc(u.uid).set({
              nome: pedido.cliente.nome,
              telefone: pedido.cliente.telefone,
              entrega: entrega,
              atualizadoEm: agora(f)
            }, { merge: true }).catch(function () {})
          : Promise.resolve();
        return guardar.then(function () { return numeroPedido; });
      }).then(function (numeroPedido) {
        L.salvarCarrinho([]);
        window.location.href = 'pedido.html?n=' + encodeURIComponent(numeroPedido) + '&novo=1';
      }).catch(function (e) {
        enviando = false;
        ocupado(form, false);
        enviar.textContent = 'Fazer pedido';
        mostrarMensagem(erro, 'erro', mensagemErro(e));
      });
    });

    conteudo.appendChild(secaoPagina('Finalizar pedido', [
      el('div', { classe: 'layout-compra' }, [
        form,
        el('div', { classe: 'resumo' }, [
          el('h2', { classe: 'resumo-titulo', texto: 'Seu pedido' }),
          itensResumo,
          linhaResumo('Subtotal', reais(subtotal)),
          el('p', { classe: 'resumo-linha' }, [el('span', { texto: 'Frete' }), linhaFrete]),
          el('p', { classe: 'resumo-linha resumo-total' }, [el('span', { texto: 'Total' }), linhaTotal]),
          el('a', { href: 'carrinho.html', classe: 'resumo-continuar', texto: 'Voltar ao carrinho' })
        ])
      ])
    ]));
  }

  // Grava o pedido com um número novo. Se o número já existir (muito raro), tenta outro.
  function criarPedido(f, pedido, tentativa) {
    var numeroPedido = novoNumeroPedido();
    return f.db.collection('pedidos').doc(numeroPedido).set(pedido).then(function () {
      return numeroPedido;
    }).catch(function (e) {
      if (e && e.code === 'permission-denied' && tentativa < 2) return criarPedido(f, pedido, tentativa + 1);
      throw e;
    });
  }

  /* ================= pedido.html ================= */

  function paginaPedido() {
    var numeroPedido = L.parametro('n').toUpperCase();
    titulo('Pedido');
    if (!L.contasAtivas() || !/^P\d{6}-[A-Z0-9]{4}$/.test(numeroPedido)) {
      conteudo.appendChild(aviso('Pedido não encontrado', 'Confira o link ou veja seus pedidos em Minha conta.', 'Minha conta', 'conta.html'));
      return;
    }
    exigirLogin(function (f, u) {
      conteudo.appendChild(carregando('Carregando o pedido...'));
      f.db.collection('pedidos').doc(numeroPedido).get().then(function (d) {
        limpar(conteudo);
        if (!d.exists) throw { code: 'not-found' };
        montarPedido(numeroPedido, d.data());
      }).catch(function () {
        limpar(conteudo);
        conteudo.appendChild(aviso('Pedido não encontrado',
          'Ele pode ser de outra conta. Você entrou como ' + u.email + '.', 'Ver meus pedidos', 'conta.html'));
      });
    }, 'Entre na sua conta para ver o pedido.');
  }

  function detalhesEntrega(e) {
    var linha1 = [texto(e.rua), texto(e.numero)].filter(Boolean).join(', ') + (texto(e.complemento) ? ' - ' + texto(e.complemento) : '');
    var linha2 = [texto(e.bairro), texto(e.cidade)].filter(Boolean).join(', ') + (texto(e.cep) ? ' · CEP ' + texto(e.cep) : '');
    return el('div', { classe: 'endereco' }, [
      el('p', { texto: linha1 }),
      el('p', { texto: linha2 }),
      texto(e.regiaoNome) ? el('p', { classe: 'carrinho-detalhe', texto: 'Região: ' + texto(e.regiaoNome) }) : null
    ]);
  }

  function listaItens(itens) {
    var ul = el('ul', { classe: 'itens-pedido' });
    L.lista(itens).forEach(function (it) {
      ul.appendChild(el('li', null, [
        el('span', { texto: it.quantidade + '× ' + texto(it.nome) + ' · tam. ' + texto(it.tamanho) }),
        el('span', { texto: reais(it.precoCentavos * it.quantidade) })
      ]));
    });
    return ul;
  }

  function valoresPedido(p) {
    return el('div', { classe: 'valores' }, [
      linhaResumo('Subtotal', reais(p.subtotalCentavos)),
      linhaResumo('Frete', p.freteCentavos > 0 ? reais(p.freteCentavos) : 'grátis'),
      linhaResumo('Total', reais(p.totalCentavos), 'resumo-total')
    ]);
  }

  function montarPedido(numeroPedido, p) {
    var st = acharStatus(p.status);
    titulo('Pedido ' + numeroPedido);
    conteudo.appendChild(secaoPagina('Pedido ' + numeroPedido, [
      L.parametro('novo') ? mensagem('ok', 'Pedido recebido! Agora é só pagar o Pix abaixo. Também guardamos o pedido em Minha conta.') : null,
      el('div', { classe: 'caixa' }, [
        el('div', { classe: 'pedido-situacao' }, [seloStatus(p.status), el('span', { classe: 'carrinho-detalhe', texto: 'Feito em ' + dataHora(p.criadoEm, true) })]),
        st.frase ? el('p', { texto: st.frase }) : null
      ]),
      p.status === 'aguardando-pagamento' ? caixaPix(numeroPedido, p) : null,
      el('div', { classe: 'colunas' }, [
        el('div', { classe: 'caixa' }, [el('h2', { texto: 'Itens' }), listaItens(p.itens), valoresPedido(p)]),
        el('div', { classe: 'caixa' }, [
          el('h2', { texto: 'Entrega' }),
          el('p', { texto: texto(p.cliente && p.cliente.nome) + ' · ' + texto(p.cliente && p.cliente.telefone) }),
          detalhesEntrega(p.entrega || {}),
          texto(p.observacao) ? el('p', { classe: 'carrinho-detalhe', texto: 'Observação: ' + texto(p.observacao) }) : null
        ])
      ]),
      el('p', null, [el('a', { href: 'conta.html', texto: 'Ver todos os meus pedidos' })])
    ]));
  }

  function caixaPix(numeroPedido, p) {
    var pix = L.configPix();
    var codigo = codigoPix(pix.chave, pix.nome, pix.cidade, p.totalCentavos, numeroPedido);
    var area = el('textarea', { classe: 'pix-codigo', readonly: true, rows: '4', 'aria-label': 'Código Pix copia e cola' });
    var copiado = el('span', { classe: 'pix-copiado', role: 'status' });
    var qr = el('div', { classe: 'pix-qr', 'aria-hidden': 'true' });
    var copiar = botao('Copiar código Pix', 'botao', function () {
      function pronto() { copiado.textContent = 'Copiado! Cole no app do banco.'; }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codigo).then(pronto, function () { area.select(); });
      } else {
        area.select();
        try { if (document.execCommand('copy')) pronto(); } catch (e) { /* a pessoa copia na mão */ }
      }
    });
    area.value = codigo;
    qr.hidden = true;
    carregarScript(QRCODE[0], QRCODE[1]).then(function () {
      try {
        new window.QRCode(qr, { text: codigo, width: 200, height: 200, correctLevel: window.QRCode.CorrectLevel.M });
        qr.hidden = false;
      } catch (e) { /* sem QR, fica o copia e cola */ }
    }).catch(function () {});

    return el('div', { classe: 'caixa pix' }, [
      el('h2', { texto: 'Pague com Pix: ' + reais(p.totalCentavos) }),
      el('div', { classe: 'pix-conteudo' }, [
        qr,
        el('div', { classe: 'pix-passos' }, [
          el('p', { texto: 'No app do seu banco, escolha Pix > "Pix copia e cola" e cole este código (ou leia o QR Code):' }),
          area,
          el('div', { classe: 'botoes' }, [copiar, copiado])
        ])
      ]),
      el('p', { classe: 'carrinho-detalhe' }, [
        'Se preferir, faça um Pix para a chave ',
        el('strong', { texto: texto(pix.chave) }),
        texto(pix.nome) ? ' (' + texto(pix.nome) + ')' : '',
        ' no valor de ' + reais(p.totalCentavos) + '.'
      ]),
      linkWhats(L.contato.whatsapp,
        'Olá! Fiz o pedido ' + numeroPedido + ' no site e já paguei o Pix de ' + reais(p.totalCentavos) + '.',
        'Já paguei: avisar a loja no WhatsApp', 'botao botao-whatsapp')
    ]);
  }

  /* ================= conta.html ================= */

  function paginaConta() {
    titulo('Minha conta');
    if (!L.contasAtivas()) {
      conteudo.appendChild(aviso('Contas em breve', 'Logo você vai poder criar sua conta, guardar favoritos e acompanhar pedidos.', 'Ver a loja', 'index.html'));
      return;
    }
    exigirLogin(function (f, u) {
      var voltar = destinoSeguro(L.parametro('voltar'));
      if (voltar) {
        window.location.href = voltar;
        return;
      }
      montarConta(f, u);
    }, 'Com a conta você guarda favoritos e acompanha seus pedidos.');
  }

  function montarConta(f, u) {
    var nome = texto(u.displayName);
    var areaDono = el('p', { classe: 'conta-dono' });
    var pedidos = el('div', null, [carregando('Carregando pedidos...')]);
    var favoritos = el('div', null, [carregando('Carregando favoritos...')]);
    var sair = botao('Sair', 'botao botao-secundario', function () { f.auth.signOut(); });

    areaDono.hidden = true;
    conteudo.appendChild(secaoPagina('Minha conta', [
      el('div', { classe: 'conta-topo' }, [
        el('div', null, [
          el('p', { classe: 'conta-ola', texto: 'Olá' + (nome ? ', ' + nome.split(' ')[0] : '') + '!' }),
          el('p', { classe: 'conta-email', texto: u.email })
        ]),
        sair
      ]),
      !u.emailVerified ? caixaConfirmarEmail(f, u, function () { window.location.reload(); }) : null,
      areaDono
    ]));
    conteudo.appendChild(bloco('Meus pedidos', [pedidos]));
    conteudo.appendChild(bloco('Favoritos', [favoritos]));
    conteudo.appendChild(bloco('Excluir conta', [caixaExcluir(f, u)]));

    // Pedidos do cliente (as regras só deixam ler os da própria conta)
    f.db.collection('pedidos').where('uid', '==', u.uid).get().then(function (snap) {
      var lista = snap.docs.map(function (d) { return { id: d.id, dados: d.data() }; }).filter(function (p) {
        return p.dados.ambiente === ambienteAtual();
      }).sort(function (a, b) {
        return ((b.dados.criadoEm && b.dados.criadoEm.toMillis()) || 0) - ((a.dados.criadoEm && a.dados.criadoEm.toMillis()) || 0);
      });
      limpar(pedidos);
      if (!lista.length) {
        pedidos.appendChild(el('p', { classe: 'carrinho-detalhe', texto: 'Você ainda não fez pedidos pelo site.' }));
        return;
      }
      var ul = el('ul', { classe: 'lista-pedidos' });
      lista.forEach(function (p) {
        ul.appendChild(el('li', null, [
          el('a', { href: 'pedido.html?n=' + encodeURIComponent(p.id) }, [
            el('span', { classe: 'pedido-numero', texto: p.id }),
            seloStatus(p.dados.status),
            el('span', { classe: 'pedido-data', texto: dataHora(p.dados.criadoEm) }),
            el('strong', { texto: reais(p.dados.totalCentavos) })
          ])
        ]));
      });
      pedidos.appendChild(ul);
    }).catch(function (e) {
      limpar(pedidos);
      pedidos.appendChild(mensagem('erro', mensagemErro(e)));
    });

    // Favoritos
    f.db.collection('usuarios').doc(u.uid).get().then(function (d) {
      var ids = (d.exists && d.data().favoritos) || [];
      var produtos = ids.map(L.acharProduto).filter(Boolean);
      limpar(favoritos);
      if (!produtos.length) {
        favoritos.appendChild(el('p', { classe: 'carrinho-detalhe', texto: 'Toque em "Favoritar" na página de um produto para guardar ele aqui.' }));
        return;
      }
      favoritos.appendChild(L.grade(produtos));
    }).catch(function (e) {
      limpar(favoritos);
      favoritos.appendChild(mensagem('erro', mensagemErro(e)));
    });

    // Só o dono consegue listar todos os pedidos: se der certo, mostra o atalho.
    f.db.collection('pedidos').orderBy('criadoEm', 'desc').limit(1).get().then(function () {
      areaDono.appendChild(el('a', { href: 'dono.html', classe: 'botao', texto: 'Área do dono: ver pedidos da loja' }));
      areaDono.hidden = false;
    }).catch(function () {});
  }

  function caixaExcluir(f, u) {
    var caixa = el('div', { classe: 'caixa' });
    var msg = mensagem('erro', '');

    function inicio() {
      limpar(caixa);
      caixa.appendChild(el('p', { texto: 'Apaga sua conta, seus favoritos e os dados de entrega guardados.' }));
      caixa.appendChild(el('div', { classe: 'botoes' }, [botao('Excluir minha conta', 'botao botao-perigo', confirmar)]));
      caixa.appendChild(msg);
    }

    function confirmar() {
      limpar(caixa);
      caixa.appendChild(el('p', { texto: 'Tem certeza? Isso não pode ser desfeito. Os pedidos já feitos continuam guardados pela loja, como manda a lei.' }));
      caixa.appendChild(el('div', { classe: 'botoes' }, [
        botao('Sim, excluir', 'botao botao-perigo', excluir),
        botao('Cancelar', 'botao botao-secundario', inicio)
      ]));
      caixa.appendChild(msg);
    }

    function excluir() {
      ocupado(caixa, true);
      f.db.collection('usuarios').doc(u.uid).delete().then(function () {
        return u.delete();
      }).then(function () {
        limpar(conteudo);
        conteudo.appendChild(aviso('Conta excluída', 'Sua conta e seus dados guardados foram apagados.', 'Voltar para a loja', 'index.html'));
      }).catch(function (e) {
        inicio();
        mostrarMensagem(msg, 'erro', mensagemErro(e));
      });
    }

    inicio();
    return caixa;
  }

  /* ================= dono.html ================= */

  function paginaDono() {
    titulo('Área do dono');
    if (!L.contasAtivas()) {
      conteudo.appendChild(aviso('Área do dono', 'As contas ainda não foram ligadas (falta configurar o Firebase).', 'Ver a loja', 'index.html'));
      return;
    }
    exigirLogin(function (f, u) {
      conteudo.appendChild(carregando('Carregando pedidos...'));
      f.db.collection('pedidos').orderBy('criadoEm', 'desc').limit(300).get().then(function (snap) {
        limpar(conteudo);
        montarDono(f, snap.docs.map(function (d) { return { id: d.id, ref: d.ref, dados: d.data() }; }));
      }).catch(function (e) {
        limpar(conteudo);
        if (e && e.code === 'permission-denied') {
          conteudo.appendChild(aviso('Área só para o dono da loja',
            'Você entrou como ' + u.email + '. Se você é o dono, confira se este e-mail está nas regras do Firestore.',
            'Voltar para a loja', 'index.html'));
        } else {
          conteudo.appendChild(aviso('Não conseguimos carregar os pedidos', mensagemErro(e), 'Tentar de novo', 'dono.html'));
        }
      });
    }, 'Entre com a conta do dono da loja.');
  }

  function montarDono(f, todos) {
    var ambiente = ambienteAtual();
    var pedidos = todos.filter(function (p) { return p.dados.ambiente === ambiente; });
    var filtro = 'todos';
    var abas = el('div', { classe: 'abas-lista filtro-status', role: 'group', 'aria-label': 'Filtrar por situação' });
    var lista = el('div', { classe: 'lista-dono' });

    function desenhar() {
      var opcoes = [{ id: 'todos', nome: 'Todos' }].concat(STATUS);
      limpar(abas);
      opcoes.forEach(function (o) {
        var n = o.id === 'todos' ? pedidos.length : pedidos.filter(function (p) { return p.dados.status === o.id; }).length;
        var b = botao(o.nome + ' (' + n + ')', 'aba' + (filtro === o.id ? ' aba-ativa' : ''), function () {
          filtro = o.id;
          desenhar();
        });
        b.setAttribute('aria-pressed', filtro === o.id ? 'true' : 'false');
        abas.appendChild(b);
      });
      limpar(lista);
      var visiveis = pedidos.filter(function (p) { return filtro === 'todos' || p.dados.status === filtro; });
      if (!visiveis.length) {
        lista.appendChild(el('p', { classe: 'carrinho-detalhe', texto: 'Nenhum pedido aqui.' }));
        return;
      }
      visiveis.forEach(function (p) { lista.appendChild(cartaoPedidoDono(f, p, desenhar)); });
    }

    conteudo.appendChild(secaoPagina('Pedidos da loja', [
      el('p', { classe: 'carrinho-detalhe', texto: ambiente === 'teste'
        ? 'Mostrando só os pedidos feitos na cópia de TESTE do site.'
        : 'Mostrando os pedidos do site oficial.' }),
      abas,
      lista
    ]));
    desenhar();
  }

  // Confere o pedido com o catálogo atual: preço, frete e estoque.
  function conferirPedido(d) {
    var alertas = [];
    var soma = 0;
    var r;
    L.lista(d.itens).forEach(function (it) {
      var p = L.acharProduto(it.id);
      soma += it.precoCentavos * it.quantidade;
      if (!p) {
        alertas.push('"' + texto(it.nome) + '" não está mais à venda no catálogo.');
      } else if (emCentavos(L.precoFinal(p)) !== it.precoCentavos) {
        alertas.push('Preço de "' + texto(it.nome) + '" no pedido (' + reais(it.precoCentavos) + ') é diferente do catálogo (' + L.dinheiro(L.precoFinal(p)) + ').');
      } else if (d.status === 'aguardando-pagamento' && L.estoqueDe(p, it.tamanho) < it.quantidade) {
        alertas.push('O estoque atual de "' + texto(it.nome) + '" tamanho ' + texto(it.tamanho) + ' é menor que o pedido.');
      }
    });
    if (soma !== d.subtotalCentavos) alertas.push('A soma dos itens não bate com o subtotal do pedido.');
    r = acharRegiao(d.entrega && d.entrega.regiao);
    if (!r) alertas.push('A região de entrega do pedido não está mais na tabela de frete.');
    else if (emCentavos(r.valor) !== d.freteCentavos) alertas.push('O frete do pedido (' + reais(d.freteCentavos) + ') é diferente da tabela atual (' + L.dinheiro(r.valor) + ').');
    return alertas;
  }

  function cartaoPedidoDono(f, p, redesenhar) {
    var d = p.dados;
    var alertas = conferirPedido(d);
    var cliente = d.cliente || {};
    var telefone = L.soNumeros(cliente.telefone);
    var seletor = el('select', { id: 'status-' + p.id, 'aria-label': 'Situação do pedido ' + p.id });
    var msg = el('span', { classe: 'pix-copiado', role: 'status' });
    var salvar;

    STATUS.forEach(function (s) { seletor.appendChild(el('option', { value: s.id, texto: s.nome })); });
    seletor.value = d.status;
    salvar = botao('Salvar', 'botao', function () {
      var novo = seletor.value;
      salvar.disabled = true;
      p.ref.update({ status: novo, atualizadoEm: agora(f) }).then(function () {
        d.status = novo;
        redesenhar();
      }).catch(function (e) {
        salvar.disabled = false;
        msg.textContent = mensagemErro(e);
      });
    });

    var lembrete = null;
    if (d.status === 'pago') lembrete = el('p', { classe: 'mensagem mensagem-ok', texto: 'Pagamento confirmado: lembre de dar baixa no estoque destes itens no catálogo.' });

    return el('article', { classe: 'pedido-dono' }, [
      el('div', { classe: 'pedido-dono-topo' }, [
        el('div', null, [
          el('p', { classe: 'pedido-numero', texto: p.id }),
          el('p', { classe: 'pedido-data', texto: dataHora(d.criadoEm, true) })
        ]),
        seloStatus(d.status),
        el('strong', { classe: 'pedido-total', texto: reais(d.totalCentavos) })
      ]),
      alertas.length ? el('div', { classe: 'mensagem mensagem-erro', role: 'note' }, [
        el('strong', { texto: 'Confira antes de aceitar o pagamento:' }),
        el('ul', null, alertas.map(function (a) { return el('li', { texto: a }); }))
      ]) : null,
      lembrete,
      el('div', { classe: 'colunas' }, [
        el('div', null, [
          el('h3', { texto: 'Cliente' }),
          el('p', { texto: texto(cliente.nome) }),
          el('p', null, [linkWhats(telefone.length <= 11 ? '55' + telefone : telefone, // sem o 55, acrescenta o código do Brasil
            'Olá, ' + texto(cliente.nome).split(' ')[0] + '! Aqui é da ' + L.nomeLoja + ', sobre o seu pedido ' + p.id + '.',
            texto(cliente.telefone) + ' (WhatsApp)')]),
          el('p', null, [el('a', { href: 'mailto:' + texto(d.email), texto: texto(d.email) })]),
          el('h3', { texto: 'Entrega' }),
          detalhesEntrega(d.entrega || {}),
          texto(d.observacao) ? el('p', { classe: 'carrinho-detalhe', texto: 'Observação: ' + texto(d.observacao) }) : null
        ]),
        el('div', null, [
          el('h3', { texto: 'Itens' }),
          listaItens(d.itens),
          valoresPedido(d)
        ])
      ]),
      el('div', { classe: 'status-form' }, [el('label', { 'for': seletor.id, texto: 'Situação:' }), seletor, salvar, msg])
    ]);
  }

  /* ================= páginas de texto (privacidade) ================= */

  function preencherDadosDaLoja() {
    var nomes = document.querySelectorAll('[data-loja="nome"]');
    var zaps = document.querySelectorAll('[data-loja="whatsapp"]');
    var i, link;
    for (i = 0; i < nomes.length; i++) nomes[i].textContent = L.nomeLoja;
    for (i = 0; i < zaps.length; i++) {
      link = linkWhats(L.contato.whatsapp, '', 'WhatsApp ' + L.formatarTelefone(L.soNumeros(L.contato.whatsapp)));
      limpar(zaps[i]);
      zaps[i].appendChild(link || document.createTextNode('pelos contatos no rodapé do site'));
    }
    titulo(document.querySelector('h1') ? document.querySelector('h1').textContent : 'Aviso de privacidade');
  }

  /* ================= qual página é esta ================= */

  var paginas = {
    carrinho: paginaCarrinho,
    finalizar: paginaFinalizar,
    pedido: paginaPedido,
    conta: paginaConta,
    dono: paginaDono
  };
  if (paginas[L.pagina]) paginas[L.pagina]();
  else if (L.pagina === 'produto') ligarFavorito();
  else if (L.pagina === 'texto') preencherDadosDaLoja();
})();
