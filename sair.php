<?php
/*
 * Sair da conta.
 *
 * Este arquivo não mostra nenhuma tela: ele apaga a sessão e manda a pessoa para o login.
 * Ele só aceita o pedido que vem do botão "Sair" do menu (método POST com o token).
 */

require 'includes/sessao.php';

// Confere se o pedido veio mesmo do nosso botão.
// Se veio de outro lugar (um link, outro site), ignora e volta para a loja.
$tokenRecebido = $_POST['token'] ?? '';
$tokenDaSessao = $_SESSION['token'] ?? '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !hash_equals($tokenDaSessao, $tokenRecebido)) {
    header('Location: index.php');
    exit;
}

// 1. Esvazia tudo o que estava guardado na sessão (cliente_id, cliente_nome, token...)
$_SESSION = [];

// 2. Apaga o cookie da sessão no navegador.
// Não existe "apagar cookie": a gente regrava ele vazio e com validade no passado (1 hora atrás).
setcookie(session_name(), '', time() - 3600, '/');

// 3. Destrói a sessão no servidor
session_destroy();

// Volta para o login
header('Location: login.php');
exit;