// Tema claro/escuro da tela de cadastro: a escolha salva do visitante ou, sem escolha, o escuro.
// Carregado no <head> (antes da página aparecer) para não piscar. As outras páginas têm este
// mesmo trecho escrito no próprio HTML; o cadastro usa um arquivo porque bloqueia scripts escritos na página.
(function () {
  var t = '';
  try { t = localStorage.getItem('tema') || ''; } catch (e) {}
  if (t !== 'claro' && t !== 'escuro') {
    t = 'escuro';
  }
  document.documentElement.setAttribute('data-tema', t);
})();
