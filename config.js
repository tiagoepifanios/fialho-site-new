/* Edite os dados e os arquivos aqui. Nenhuma conexão com Instagram é realizada. */
window.FIALHO_CONFIG = {
  // Confirme o número atual antes de publicar. Formato: 55 + DDD + número.
  whatsapp: "5554996761919", // Número do site antigo: confirmar antes de publicar.
  email: "contato@fialhoodontologia.com.br", // Confirmar antes de publicar.
  address: "", // Endereço atual confirmado; a localização exibida é Gramado/RS.
  videoSpeed: 0.8,
  videoOverlay: 0.38,
  videos: ["assets/videos/hero-1.mp4", "assets/videos/hero-2.mp4", "assets/videos/hero-3.mp4", "assets/videos/hero-4.mp4"],
  // Objetos: { image: "assets/images/espaco-01.jpg", alt: "Recepção do espaço atual" }
  spacePhotos: [],
  // Objetos: { image: "assets/images/certificado-01.jpg", title: "Título confirmado", description: "Instituição e ano confirmados" }
  certificates: [],
  instagram: {
    profile: "https://www.instagram.com/fialhoodonto/",
    // Futuro endpoint no SEU servidor, retornando { posts: [{image,url,alt,date,type}] }.
    // Tokens nunca devem ser colocados neste arquivo. Vazio = nenhuma chamada à API.
    endpoint: "",
    // Até 3 posts manuais. Data ISO (YYYY-MM-DD) para ordenar pelos mais recentes.
    posts: []
  }
};
