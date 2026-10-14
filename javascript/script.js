/* ==========================================================
   MENU LATERAL
   O CSS (header.css) já sabe mostrar o menu quando o <body>
   tem a classe "menu_aberto". Aqui só colocamos e tiramos
   essa classe.
   ========================================================== */

// 1. Pega os elementos do HTML pelo id
const botaoMenu = document.getElementById("botao_menu");   // o botão de três barras
const botaoFechar = document.getElementById("fechar_menu"); // o X dentro do menu
const fundoMenu = document.getElementById("fundo_menu");    // o fundo escuro

// 2. Abre o menu
function abrirMenu() {
    document.body.classList.add("menu_aberto");
    botaoMenu.setAttribute("aria-expanded", "true"); // avisa ao leitor de tela que abriu
    botaoFechar.focus(); // leva o teclado para dentro do menu
}

// 3. Fecha o menu
function fecharMenu() {
    document.body.classList.remove("menu_aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.focus(); // devolve o teclado para o botão que abriu o menu
}

// 4. Liga cada botão à sua função
botaoMenu.addEventListener("click", abrirMenu);
botaoFechar.addEventListener("click", fecharMenu);
fundoMenu.addEventListener("click", fecharMenu); // clicar fora do menu também fecha

// 5. A tecla Esc também fecha o menu
document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && document.body.classList.contains("menu_aberto")) {
        fecharMenu();
    }
});