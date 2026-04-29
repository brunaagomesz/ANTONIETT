const api_produtos = [
{
    nome: "Caneca XOXO",
    Imagem: "./src/style/img/caneca-1.jpg",
},
{
    nome: "Caneca I love me",
    Imagem: "./src/style/img/caneca-5.jpg",
},
{
    nome: "Caneca Namorados",
    Imagem: "./src/style/img/caneca-3.jpg",
},
{
    nome: "Caneca A HUG",
    Imagem: "./src/style/img/caneca-4.jpg",
},
{
    nome: "Caneca I love me",
    Imagem: "./src/style/img/caneca-1.jpg",
},
{
   
    nome: "Caneca I love me",
    Imagem: "./src/style/img/caneca-2.jpg",
},
{
    nome: "Caneca Namorados",
    Imagem: "./src/style/img/caneca-3.jpg",
},
{
    
    nome: "Caneca A HUG",
    Imagem: "./src/style/img/caneca-4.jpg",
},
];

const container = document.getElementById("cards");

let index = 0;
const itensPorTela = 4;

function renderizar() {
  container.innerHTML = "";

  const slice = api_produtos.slice(index, index + itensPorTela);

  slice.forEach(produto => {
    container.innerHTML += `
      <div class="card">
        <h3>${produto.nome}</h3>  
        <div class="img-box">
          <img src="${produto.Imagem}" alt=""> 

    `;
  });
}

function avancar() {
  if (index + itensPorTela < api_produtos.length) {
    index++;
    renderizar();
  }
}

function voltar() {
  if (index > 0) {
    index--;
    renderizar();
  }
}

renderizar();