/* BOTÃO DO MENU HAMBURGUER RESPONSIVO */
// Feito com JavaScript puro: antes dependia do jQuery, que não era carregado em nenhuma página.

const botaoMenu = document.getElementById("mobile_btn");
const menuMobile = document.getElementById("mobile_menu");

if (botaoMenu && menuMobile) {
    botaoMenu.addEventListener("click", function () {
        const aberto = menuMobile.classList.toggle("active");
        const icone = botaoMenu.querySelector("i");

        // Troca o ícone entre "três barras" e "X"
        icone.classList.toggle("fa-bars", !aberto);
        icone.classList.toggle("fa-xmark", aberto);
        botaoMenu.setAttribute("aria-expanded", aberto);
    });
}
