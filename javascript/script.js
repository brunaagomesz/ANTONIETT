/* BOTÃO DO MENU HAMBURGUER RESPONSIVO*/

$(document).ready(function () {
    $('#mobile_btn').on('click', function () {
        $('#mobile_menu').toggleClass('active');
        $('#mobile_btn i').toggleClass('fa-bars fa-xmark');
    });
});