<?php
/*
 * Liga a sessão do PHP.
 *
 * A sessão é como o PHP "lembra" de um visitante entre uma página e outra:
 * ele guarda os dados no servidor e entrega ao navegador só um cookie com um código.
 * É nela que guardamos quem fez login e quantas tentativas erradas aconteceram.
 *
 * Como usar: require 'includes/sessao.php'; no começo da página, antes de qualquer HTML.
 */

// Configura o cookie da sessão antes de ligá-la
session_set_cookie_params([
    'httponly' => true,   // o JavaScript da página não consegue ler o cookie (protege contra roubo)
    'samesite' => 'Lax',  // outros sites não conseguem enviar formulários usando este cookie
    // 'secure' => true,  // só envia o cookie por HTTPS. O XAMPP local usa HTTP, por isso fica desligado.
]);

session_start();
