<?php
/*
 * Página de login.
 *
 * Esta página faz duas coisas:
 *  1. Mostra o formulário (quando a pessoa só abre a página).
 *  2. Confere o e-mail e a senha no banco (quando o formulário é enviado pelo método POST).
 *
 * O mascote 3D é só visual: quem decide se o login deu certo é sempre este PHP.
 */

require 'includes/sessao.php';

const MAX_TENTATIVAS = 5;     // tentativas erradas antes de bloquear
const SEGUNDOS_BLOQUEIO = 30; // tempo de espera depois do bloqueio

// Escreve um texto no HTML com segurança (evita que alguém injete código pela página)
function escapar($texto)
{
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}

// Quem já está logado e só abriu a página vai direto para a loja
if (isset($_SESSION['cliente_id']) && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

// Token contra CSRF: um código secreto que só o nosso formulário conhece.
// Se um formulário de outro site tentar enviar dados para cá, ele não terá esse código.
if (empty($_SESSION['token'])) {
    $_SESSION['token'] = bin2hex(random_bytes(32));
}

if (!isset($_SESSION['tentativas'])) {
    $_SESSION['tentativas'] = 0;
}

// Confere se existe um bloqueio e se ele já terminou
$segundosRestantes = 0;
if (isset($_SESSION['bloqueado_ate'])) {
    $segundosRestantes = $_SESSION['bloqueado_ate'] - time();
    if ($segundosRestantes <= 0) {
        // o tempo passou: libera de novo e zera as tentativas
        unset($_SESSION['bloqueado_ate']);
        $_SESSION['tentativas'] = 0;
        $segundosRestantes = 0;
    }
}

// Estas variáveis decidem o que aparece na tela
$estado = '';         // '' (normal), 'erro', 'bloqueado', 'sucesso' ou 'cadastrado'. O mascote reage a isso.
$mensagem = '';       // título do aviso
$detalhe = '';        // texto menor do aviso
$emailDigitado = '';  // o e-mail volta para o campo, para a pessoa não precisar digitar de novo

// Aviso deixado pelo cadastro.php ("Conta criada!"). Aparece uma vez só e é apagado.
$avisoCadastro = $_SESSION['aviso_login'] ?? '';
if ($avisoCadastro) {
    $emailDigitado = $_SESSION['email_cadastrado'] ?? '';
    unset($_SESSION['aviso_login'], $_SESSION['email_cadastrado']);
    $estado = 'cadastrado'; // o mascote comemora a conta nova
}

/* ---------- Formulário enviado ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $emailDigitado = trim($_POST['email'] ?? '');
    $senhaDigitada = $_POST['senha'] ?? '';
    $tokenRecebido = $_POST['token'] ?? '';

    if (!hash_equals($_SESSION['token'], $tokenRecebido)) {
        $estado = 'erro';
        $mensagem = 'A página ficou aberta por muito tempo.';
        $detalhe = 'Tente entrar de novo.';
    } elseif ($segundosRestantes > 0) {
        $estado = 'bloqueado';
    } elseif ($emailDigitado === '' || $senhaDigitada === '') {
        $estado = 'erro';
        $mensagem = 'Preencha o e-mail e a senha.';
    } elseif (!filter_var($emailDigitado, FILTER_VALIDATE_EMAIL)) {
        $estado = 'erro';
        $mensagem = 'Digite um e-mail válido.';
        $detalhe = 'Por exemplo: nome@exemplo.com';
    } else {
        require 'includes/conexao.php';

        // Busca o cliente pelo e-mail. O "?" é preenchido pelo PDO com segurança (evita SQL Injection).
        $comando = $conexao->prepare('SELECT id, nome, senha FROM cadastro WHERE email = ? LIMIT 1');
        $comando->execute([$emailDigitado]);
        $cliente = $comando->fetch(PDO::FETCH_ASSOC);

        // password_verify compara a senha digitada com a senha embaralhada (hash) guardada no banco
        if ($cliente && password_verify($senhaDigitada, $cliente['senha'])) {
            session_regenerate_id(true); // troca o código da sessão depois do login (mais seguro)
            $_SESSION['cliente_id'] = $cliente['id'];
            $_SESSION['cliente_nome'] = $cliente['nome'];
            $_SESSION['tentativas'] = 0;
            $estado = 'sucesso';
        } else {
            $_SESSION['tentativas']++;

            if ($_SESSION['tentativas'] >= MAX_TENTATIVAS) {
                $_SESSION['bloqueado_ate'] = time() + SEGUNDOS_BLOQUEIO;
                $segundosRestantes = SEGUNDOS_BLOQUEIO;
                $estado = 'bloqueado';
            } else {
                // A mensagem não diz qual dos dois está errado, para não ajudar quem tenta adivinhar contas
                $estado = 'erro';
                $mensagem = 'E-mail ou senha incorretos.';
                $detalhe = 'Tentativa ' . $_SESSION['tentativas'] . ' de ' . MAX_TENTATIVAS . '.';
            }
        }
    }
}

// Se ainda está bloqueado (mesmo só abrindo a página), mostra o aviso de espera
if ($segundosRestantes > 0 && $estado !== 'sucesso') {
    $estado = 'bloqueado';
}
if ($estado === 'bloqueado') {
    $mensagem = 'Muitas tentativas erradas.';
    $detalhe = 'Espere ' . $segundosRestantes . ' segundos para tentar de novo.';
}

$temAviso = ($estado === 'erro' || $estado === 'bloqueado');
?>
<!doctype html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrar | ANTONIETT</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="style/login.css">
</head>

<!-- Os atributos data-* passam o resultado do PHP para o JavaScript do mascote -->
<body data-estado="<?= $estado ?>"
      data-tentativas="<?= $_SESSION['tentativas'] ?>"
      data-segundos="<?= $segundosRestantes ?>">

<div class="tela">

    <!-- Palco do mascote: o JavaScript desenha a caneca 3D aqui dentro -->
    <section class="palco" id="palco" aria-label="Mascote da ANTONIETT, uma caneca que reage ao formulário">
        <!-- Aparece só se o navegador não conseguir mostrar 3D -->
        <div class="sem-3d" id="sem-3d" hidden>
            <img src="src/img/boonjour.png" alt="Caneca branca da ANTONIETT">
        </div>
    </section>

    <main class="lado-form">
        <div class="form-dentro">
            <div>
                <h1>Bem-vindo</h1>
            </div>

            <?php if ($temAviso): ?>
                <div class="aviso-erro" id="aviso-erro" role="alert">
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>
                    <div>
                        <strong><?= escapar($mensagem) ?></strong>
                        <span id="detalhe-erro"><?= escapar($detalhe) ?></span>

                        <?php if ($_SESSION['tentativas'] > 0 || $estado === 'bloqueado'): ?>
                            <!-- Contador: uma marca para cada tentativa errada -->
                            <div class="contador" aria-hidden="true">
                                <?php for ($i = 0; $i < MAX_TENTATIVAS; $i++): ?>
                                    <?php if ($i < $_SESSION['tentativas'] || $estado === 'bloqueado'): ?>
                                        <span class="usada"></span>
                                    <?php else: ?>
                                        <span></span>
                                    <?php endif; ?>
                                <?php endfor; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <?php if ($estado === 'cadastrado'): ?>
                <p class="sucesso" role="status"><?= escapar($avisoCadastro) ?></p>
            <?php endif; ?>

            <?php if ($estado === 'sucesso'): ?>
                <p class="sucesso" role="status">
                    Tudo certo! Entrando na loja.
                    <a href="index.php">Continuar</a>
                </p>
            <?php endif; ?>

            <form method="post" action="login.php" id="form-login">
                <!-- Campo escondido com o token contra CSRF -->
                <input type="hidden" name="token" value="<?= escapar($_SESSION['token']) ?>">

                <div class="campo">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" autocomplete="email"
                           placeholder="voce@exemplo.com" required
                           value="<?= escapar($emailDigitado) ?>"
                           <?php if ($temAviso): ?>aria-invalid="true" aria-describedby="aviso-erro"<?php endif; ?>>
                </div>

                <div class="campo">
                    <div class="linha-senha">
                        <label for="senha">Senha</label>
                        <button type="button" class="mostrar" id="mostrar-senha" aria-controls="senha" aria-pressed="false">Mostrar senha</button>
                    </div>
                    <input type="password" id="senha" name="senha" autocomplete="current-password" required
                           <?php if ($temAviso): ?>aria-invalid="true" aria-describedby="aviso-erro"<?php endif; ?>>
                </div>

                <?php if ($estado === 'bloqueado'): ?>
                    <button type="submit" class="botao" id="botao-entrar" disabled>Aguarde <?= $segundosRestantes ?>s</button>
                <?php else: ?>
                    <button type="submit" class="botao" id="botao-entrar">Entrar</button>
                <?php endif; ?>
            </form>

            <p class="troca">Ainda não tem conta? <a href="cadastro.php">Criar conta</a></p>

            <div class="rodape-form">
                <p>Loja de trabalho acadêmico. Compras e entregas são simuladas.</p>
                <nav class="legal" aria-label="Documentos">
                    <a href="termos.php">Termos de Uso</a>
                    <a href="privacidade.php">Política de Privacidade</a>
                </nav>
            </div>
        </div>
    </main>

</div>

<!-- Three.js: biblioteca de 3D. As cópias ficam no projeto para funcionar sem internet. -->
<script src="javascript/libs/three.min.js"></script>
<script src="javascript/libs/GLTFLoader.js"></script>
<!-- Nossos arquivos: primeiro o mascote, depois o formulário que conversa com ele -->
<script src="javascript/mascote.js"></script>
<script src="javascript/login.js"></script>
</body>
</html>
