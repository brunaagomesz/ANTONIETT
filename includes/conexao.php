<?php
/*
 * Conexão com o banco de dados MySQL.
 *
 * Como usar: qualquer página que precise do banco começa com
 *     require 'includes/conexao.php';
 * e, a partir daí, pode usar a variável $conexao para conversar com o banco.
 */

// 1. Dados da conexão.
// São os valores padrão do XAMPP. Se o MySQL de alguém tiver outra senha,
// é só mudar aqui.
$servidor = 'localhost';   // onde o MySQL está rodando: no próprio computador
$banco    = 'login_db';    // nome do banco criado no phpMyAdmin
$usuario  = 'root';        // usuário padrão do MySQL no XAMPP
$senha    = '';            // no XAMPP, o usuário root vem sem senha

// 2. Tenta abrir a conexão.
// O "try" significa: tente fazer o que está aqui dentro.
// Se algo der errado (MySQL desligado, banco com nome errado...), o PHP pula para o "catch".
try {
    // PDO é a ferramenta do PHP que conversa com o banco de dados.
    // O primeiro texto diz o tipo de banco (mysql), onde ele está, qual banco usar
    // e o conjunto de caracteres (utf8mb4 aceita acentos e cedilha).
    $conexao = new PDO("mysql:host=$servidor;dbname=$banco;charset=utf8mb4", $usuario, $senha);

    // Pede para o PDO avisar quando uma consulta der erro, em vez de falhar em silêncio.
    $conexao->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $erro) {
    // 3. Se a conexão falhar, chegamos aqui.
    // O detalhe técnico vai para o log de erros do PHP (C:\xampp\php\logs\php_error_log),
    // que só quem desenvolve consegue ver.
    error_log('Erro na conexão com o banco: ' . $erro->getMessage());

    // Para quem está usando o site, mostramos só uma mensagem simples e paramos a página.
    die('Não foi possível conectar ao banco de dados. Verifique se o MySQL está ligado no XAMPP.');
}
