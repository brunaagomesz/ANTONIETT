<?php
/*
 * Cabeçalho compartilhado por todas as páginas.
 *
 * Antes de incluir este arquivo, a página define duas variáveis:
 *   $tituloPagina  texto da aba do navegador, por exemplo "Canecas"
 *   $paginaAtual   chave do item do menu que fica marcado como ativo, por exemplo "canecas"
 */

// Só quem fez login vê as páginas da loja
require 'includes/autenticacao.php';

// Itens do menu: a chave identifica a página e o valor guarda o link e o texto.
// Para adicionar uma página ao menu, basta acrescentar uma linha aqui.
$itensMenu = [
    'inicio'  => ['link' => './index.php',   'texto' => 'Início'],
    'sobre'   => ['link' => './sobre.php',   'texto' => 'Sobre'],
    'canecas' => ['link' => './canecas.php', 'texto' => 'Canecas'],
    'contato' => ['link' => './contato.php', 'texto' => 'Contato'],
];
?>
<!doctype html>
<html lang="pt-br">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <link rel="stylesheet" href="style/caneca.css">
        <link rel="stylesheet" href="style/contato.css">
        <link rel="stylesheet" href="style/header.css">
        <link rel="stylesheet" href="style/home.css">
        <link rel="stylesheet" href="style/sobre.css">
        <link rel="stylesheet" href="style/style.css">

        <title><?= $tituloPagina ?> | ANTONIETT</title>
    </head>
    <body>
        <header class="header_canecas">
            <nav id="navbar">
                <!-- Botão que abre o menu lateral (ícone de três barras) -->
                <button id="botao_menu" aria-label="Abrir menu" aria-controls="menu_lateral" aria-expanded="false">
                    <i class="fa-solid fa-bars"></i>
                </button>

                <div class="logo-container">
                    <img class="logo_navbar" src="./src/img/logoantoniett_n-Photoroom.png" alt="" />
                    <span class="nome-marca">ANTONIETT</span>
                </div>

                <!-- Botão da direita: depois vira o carrinho de compras -->
                <button class="btn-default">
                    Veja Aqui!
                </button>
            </nav>
        </header>

        <!-- Fundo escuro que aparece atrás do menu. Clicar nele fecha o menu. -->
        <div id="fundo_menu"></div>

        <!-- Menu lateral: fica escondido fora da tela até a pessoa clicar no botão de três barras -->
        <aside id="menu_lateral" aria-label="Menu">
            <div class="menu_topo">
                <!-- htmlspecialchars protege a página caso o nome tenha caracteres especiais, como < ou " -->
                <span class="menu_saudacao">Olá, <?= htmlspecialchars($_SESSION['cliente_nome']) ?></span>

                <button id="fechar_menu" aria-label="Fechar menu">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <ul class="menu_lista">
                <?php foreach ($itensMenu as $chave => $item): ?>
                    <?php
                    // O item da página atual recebe a classe "ativo", para aparecer destacado
                    $classe = 'menu_item';
                    if ($chave === $paginaAtual) {
                        $classe = 'menu_item ativo';
                    }
                    ?>
                    <li class="<?= $classe ?>">
                        <a href="<?= $item['link'] ?>"><?= $item['texto'] ?></a>
                    </li>
                <?php endforeach; ?>
            </ul>

            <!-- Sair: é um formulário (POST com token), por segurança. Veja o sair.php. -->
            <form method="post" action="sair.php" class="menu_sair">
                <input type="hidden" name="token" value="<?= htmlspecialchars($_SESSION['token']) ?>">
                <button type="submit">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    Sair
                </button>
            </form>
        </aside>
