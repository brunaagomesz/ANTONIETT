<?php
/*
 * Cabeçalho compartilhado por todas as páginas.
 *
 * Antes de incluir este arquivo, a página define duas variáveis:
 *   $tituloPagina  texto da aba do navegador, por exemplo "Canecas"
 *   $paginaAtual   chave do item do menu que fica marcado como ativo, por exemplo "canecas"
 */

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
                <div class="logo-container">
                    <img class="logo_navbar" src="./src/img/logoantoniett_n-Photoroom.png" alt="" />
                    <span class="nome-marca">ANTONIETT</span>
                </div>

                <ul id="nav_list">
                    <?php foreach ($itensMenu as $chave => $item): ?>
                        <?php
                        // O item da página atual recebe a classe "active", que desenha o sublinhado
                        $classe = 'nav_item';
                        if ($chave === $paginaAtual) {
                            $classe = 'nav_item active';
                        }
                        ?>
                        <li class="<?= $classe ?>">
                            <a href="<?= $item['link'] ?>"><?= $item['texto'] ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <!-- Botão Peça aqui -->
                <button class="btn-default">
                    Veja Aqui!
                </button>

                <!-- Botão Menu Hamburguer -->
                <button id="mobile_btn" aria-label="Abrir menu" aria-controls="mobile_menu" aria-expanded="false">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </nav>

            <!-- Versão Hamburguer Mobile: usa a mesma lista de itens do menu acima -->
            <div id="mobile_menu">
                <ul id="mobile_nav_list">
                    <?php foreach ($itensMenu as $chave => $item): ?>
                        <?php
                        $classe = 'nav_item';
                        if ($chave === $paginaAtual) {
                            $classe = 'nav_item active';
                        }
                        ?>
                        <li class="<?= $classe ?>">
                            <a href="<?= $item['link'] ?>"><?= $item['texto'] ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <button class="btn-default">
                    Veja Aqui!
                </button>
            </div>
        </header>
