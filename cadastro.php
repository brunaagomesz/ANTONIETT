<?php
/*
 * Página de cadastro.
 *
 * Esta página faz duas coisas:
 *  1. Mostra o formulário (quando a pessoa só abre a página).
 *  2. Confere os dados e grava o novo cliente no banco (quando o formulário é enviado por POST).
 *
 * Se der tudo certo, a pessoa volta para o login com um aviso de "conta criada".
 */

require 'includes/sessao.php';

// Escreve um texto no HTML com segurança (evita que alguém injete código pela página)
function escapar($texto)
{
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}

// Quem já está logado não precisa criar conta
if (isset($_SESSION['cliente_id'])) {
    header('Location: index.php');
    exit;
}

// Token contra CSRF (o mesmo usado no login)
if (empty($_SESSION['token'])) {
    $_SESSION['token'] = bin2hex(random_bytes(32));
}

// Valores digitados (voltam para os campos se der erro) e erros de cada campo
$nome = '';
$email = '';
$erros = []; // exemplo: ['email' => 'Digite um e-mail válido.']
$emailJaCadastrado = false; // mostra o link "Entrar com este e-mail"

/* ---------- Formulário enviado ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';
    $confirmacao = $_POST['confirmacao'] ?? '';

    if (!hash_equals($_SESSION['token'], $_POST['token'] ?? '')) {
        $erros['geral'] = 'A página ficou aberta por muito tempo. Tente de novo.';
    } else {
        // Nome: obrigatório, de 2 a 100 caracteres (o limite da coluna no banco)
        if (mb_strlen($nome) < 2) {
            $erros['nome'] = 'Digite seu nome.';
        } elseif (mb_strlen($nome) > 100) {
            $erros['nome'] = 'Use no máximo 100 caracteres.';
        }

        // E-mail: obrigatório e em formato válido
        if ($email === '') {
            $erros['email'] = 'Digite seu e-mail.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
            $erros['email'] = 'Digite um e-mail válido, como nome@exemplo.com.';
        }

        // Senha: 8 ou mais caracteres, com letra, número e caractere especial.
        // preg_match procura um padrão no texto: [A-Za-z] = uma letra, [0-9] = um número,
        // [^A-Za-z0-9] = qualquer coisa que não seja letra nem número (um caractere especial).
        $faltando = [];
        if (mb_strlen($senha) < 8) $faltando[] = '8 caracteres';
        if (!preg_match('/[A-Za-z]/', $senha)) $faltando[] = 'uma letra';
        if (!preg_match('/[0-9]/', $senha)) $faltando[] = 'um número';
        if (!preg_match('/[^A-Za-z0-9]/', $senha)) $faltando[] = 'um caractere especial';

        if ($senha === '') {
            $erros['senha'] = 'Crie uma senha.';
        } elseif ($faltando) {
            $erros['senha'] = 'A senha precisa ter: ' . implode(', ', $faltando) . '.';
        }

        // Confirmação: precisa ser igual à senha
        if ($confirmacao === '') {
            $erros['confirmacao'] = 'Digite a senha de novo.';
        } elseif ($confirmacao !== $senha) {
            $erros['confirmacao'] = 'As senhas não são iguais.';
        }

        // Só consulta o banco se os campos estiverem certos
        if (!$erros) {
            require 'includes/conexao.php';

            // E-mail já cadastrado?
            $comando = $conexao->prepare('SELECT id FROM cadastro WHERE email = ? LIMIT 1');
            $comando->execute([$email]);

            if ($comando->fetch()) {
                $erros['email'] = 'Este e-mail já tem uma conta.';
                $emailJaCadastrado = true;
            } else {
                // password_hash embaralha a senha. O banco nunca guarda a senha de verdade.
                $senhaEmbaralhada = password_hash($senha, PASSWORD_DEFAULT);

                try {
                    $comando = $conexao->prepare('INSERT INTO cadastro (nome, email, senha) VALUES (?, ?, ?)');
                    $comando->execute([$nome, $email, $senhaEmbaralhada]);
                } catch (PDOException $erro) {
                    // 23000 = o banco recusou um valor repetido (a coluna email é única).
                    // Acontece se duas pessoas cadastrarem o mesmo e-mail ao mesmo tempo.
                    if ($erro->getCode() === '23000') {
                        $erros['email'] = 'Este e-mail já tem uma conta.';
                        $emailJaCadastrado = true;
                    } else {
                        throw $erro;
                    }
                }
            }

            if (!$erros) {
                // Deixa um aviso para a página de login mostrar e já preenche o e-mail
                $_SESSION['aviso_login'] = 'Conta criada! Agora entre com seu e-mail e senha.';
                $_SESSION['email_cadastrado'] = $email;
                header('Location: login.php');
                exit;
            }
        }
    }
}

// Mostra a mensagem de erro de um campo, se existir
function mostrarErro($erros, $campo)
{
    if (isset($erros[$campo])) {
        echo '<p class="erro-campo" id="erro-' . $campo . '">' . escapar($erros[$campo]) . '</p>';
    }
}

// Marca o campo como inválido (borda vermelha e leitura do erro por leitores de tela)
function marcarInvalido($erros, $campo)
{
    if (isset($erros[$campo])) {
        echo 'aria-invalid="true" aria-describedby="erro-' . $campo . '"';
    }
}
?>
<!doctype html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar conta | ANTONIETT</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="style/login.css">
</head>

<!-- Se houve erro, o mascote fica triste (o cadastro.js lê este atributo) -->
<body data-estado="<?= $erros ? 'erro' : '' ?>">

<div class="tela">

    <!-- Palco do mascote: o JavaScript desenha a caneca 3D aqui dentro -->
    <section class="palco" id="palco" aria-label="Mascote da ANTONIETT, uma caneca que reage ao formulário">
        <div class="sem-3d" id="sem-3d" hidden>
            <img src="src/img/boonjour.png" alt="Caneca branca da ANTONIETT">
        </div>
    </section>

    <main class="lado-form">
        <div class="form-dentro">
            <h1>Crie sua conta</h1>

            <?php if (isset($erros['geral'])): ?>
                <div class="aviso-erro" role="alert">
                    <strong><?= escapar($erros['geral']) ?></strong>
                </div>
            <?php endif; ?>

            <form method="post" action="cadastro.php" id="form-cadastro">
                <input type="hidden" name="token" value="<?= escapar($_SESSION['token']) ?>">

                <div class="campo">
                    <label for="nome">Nome</label>
                    <input type="text" id="nome" name="nome" autocomplete="name" required maxlength="100"
                           value="<?= escapar($nome) ?>" <?php marcarInvalido($erros, 'nome'); ?>>
                    <?php mostrarErro($erros, 'nome'); ?>
                </div>

                <div class="campo">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" autocomplete="email" required maxlength="150"
                           placeholder="voce@exemplo.com"
                           value="<?= escapar($email) ?>" <?php marcarInvalido($erros, 'email'); ?>>
                    <?php mostrarErro($erros, 'email'); ?>
                    <?php if ($emailJaCadastrado): ?>
                        <a class="link-erro" href="login.php">Entrar com este e-mail</a>
                    <?php endif; ?>
                </div>

                <div class="campo">
                    <div class="linha-senha">
                        <label for="senha">Senha</label>
                        <button type="button" class="mostrar" id="mostrar-senha" aria-controls="senha confirmacao" aria-pressed="false">Mostrar senha</button>
                    </div>
                    <input type="password" id="senha" name="senha" autocomplete="new-password" required
                           <?php marcarInvalido($erros, 'senha'); ?>>
                    <?php if (isset($erros['senha'])): ?>
                        <?php mostrarErro($erros, 'senha'); ?>
                    <?php else: ?>
                        <p class="dica-campo">Use 8 ou mais caracteres, com letra, número e um caractere especial, como ! ou @.</p>
                    <?php endif; ?>
                </div>

                <div class="campo">
                    <label for="confirmacao">Confirmar senha</label>
                    <input type="password" id="confirmacao" name="confirmacao" autocomplete="new-password" required
                           <?php marcarInvalido($erros, 'confirmacao'); ?>>
                    <?php mostrarErro($erros, 'confirmacao'); ?>
                </div>

                <button type="submit" class="botao" id="botao-criar">Criar conta</button>
            </form>

            <p class="troca">Já tem conta? <a href="login.php">Entrar</a></p>

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

<!-- O mesmo mascote da tela de login -->
<script src="javascript/libs/three.min.js"></script>
<script src="javascript/libs/GLTFLoader.js"></script>
<script src="javascript/mascote.js"></script>
<script src="javascript/cadastro.js"></script>
</body>
</html>
