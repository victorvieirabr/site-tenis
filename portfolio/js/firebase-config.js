// Ligação do site com o Firebase (serviço do Google que guarda contas, favoritos e pedidos).
//
// Enquanto estiver null, o site funciona só como vitrine: sem conta, sem carrinho e sem pedidos.
// Para ligar, cole aqui o objeto "firebaseConfig" que o Firebase mostra em
// Configurações do projeto > Seus apps > App da Web. Fica assim:
//   window.FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };
//
// Esses dados NÃO são segredo: ficam visíveis no site de propósito, como em todo site com Firebase.
// Quem protege os dados dos clientes são as regras do Firestore (firebase/regras-firestore.rules,
// na pasta do projeto).
window.FIREBASE_CONFIG = null;
