<?php
/*
 * Porteiro das páginas da loja.
 *
 * Toda página que incluir este arquivo só abre para quem fez login.
 * Quem não fez login é mandado de volta para o login.php.
 */

// Abre a sessão: é nela que o login.php guardou quem entrou
require 'includes/sessao.php';

// O login.php grava o "cliente_id" quando a senha está certa.
// Se ele não existe, a pessoa não fez login.
if (!isset($_SESSION['cliente_id'])) {
    header('Location: login.php'); // manda o navegador ir para o login
    exit;                          // para a página aqui, sem mostrar mais nada
}