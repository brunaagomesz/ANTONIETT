/* ==========================================================
   FORMULÁRIO DE LOGIN + REAÇÕES DO MASCOTE
   ----------------------------------------------------------
   Este arquivo não confere senha nenhuma: isso é trabalho do
   login.php. Aqui só mudamos o "humor" do mascote (definido
   em mascote.js) conforme a pessoa usa o formulário.
   ========================================================== */

const email = document.getElementById('email');
const senha = document.getElementById('senha');
const botao = document.getElementById('botao-entrar');
const botaoMostrar = document.getElementById('mostrar-senha');
const formulario = document.getElementById('form-login');

// O PHP escreve o resultado do login nos atributos data-* do <body>
const resultado = document.body.dataset.estado;            // '', 'erro', 'bloqueado', 'sucesso' ou 'cadastrado'
const tentativas = Number(document.body.dataset.tentativas);
let segundosDeEspera = Number(document.body.dataset.segundos);

// Enquanto o mascote mostra a reação de erro, ele não troca de humor
let reagindoAoErro = false;

// Diz se o mascote pode trocar de expressão agora
// (não troca no meio do erro, do bloqueio, do carregamento ou da comemoração)
function podeMudarHumor() {
    const ocupado = ['bloqueado', 'carregando', 'sucesso'].includes(humor.modo);
    return !reagindoAoErro && !ocupado;
}


/* ---------- Humor de acordo com o campo em foco ---------- */

function humorDoCampoEmFoco() {
    if (document.activeElement === email) {
        humor.modo = 'email';
    } else if (document.activeElement === senha) {
        // senha visível: espia. Senha escondida: tapa os olhos.
        humor.modo = senha.type === 'text' ? 'espiando' : 'senha';
    } else {
        humor.modo = 'normal';
    }
}

email.addEventListener('focus', () => {
    if (podeMudarHumor()) humorDoCampoEmFoco();
});

senha.addEventListener('focus', () => {
    if (podeMudarHumor()) humorDoCampoEmFoco();
});

// Ao sair de um campo, espera um instante para ver se a pessoa foi para o outro campo
[email, senha].forEach((campo) => {
    campo.addEventListener('blur', () => {
        setTimeout(() => {
            if (podeMudarHumor()) humorDoCampoEmFoco();
        }, 0);
    });
});

// Os olhos acompanham o e-mail sendo digitado
email.addEventListener('input', () => {
    humor.progressoEmail = Math.min(email.value.length / 28, 1);
});


/* ---------- Mostrar e esconder a senha ---------- */

botaoMostrar.addEventListener('click', () => {
    const mostrar = senha.type === 'password';
    senha.type = mostrar ? 'text' : 'password';
    botaoMostrar.textContent = mostrar ? 'Esconder senha' : 'Mostrar senha';
    botaoMostrar.setAttribute('aria-pressed', mostrar ? 'true' : 'false');
    senha.focus();
    if (podeMudarHumor()) humorDoCampoEmFoco();
});


/* ---------- Envio do formulário ---------- */

// Não impedimos o envio: o formulário vai para o login.php normalmente.
// Só mostramos que está carregando enquanto a próxima página não chega.
formulario.addEventListener('submit', () => {
    botao.disabled = true;
    botao.innerHTML = '<span class="girando" aria-hidden="true"></span>Entrando';
    humor.modo = 'carregando';
});


/* ---------- Resultado que veio do PHP ---------- */

if (resultado === 'erro') {
    // Fica triste por um momento e depois volta ao normal
    humor.modo = 'erro';
    humor.serio = tentativas >= 3; // do 3º erro em diante, cara "séria"
    humor.tremor = 0.8;
    reagindoAoErro = true;
    senha.focus();
    setTimeout(() => {
        reagindoAoErro = false;
        humorDoCampoEmFoco();
    }, 2500);

} else if (resultado === 'bloqueado') {
    // Dorme enquanto conta o tempo de espera
    humor.modo = 'bloqueado';
    humor.tremor = 0.8;
    const detalhe = document.getElementById('detalhe-erro');

    const relogio = setInterval(() => {
        segundosDeEspera--;
        if (segundosDeEspera <= 0) {
            clearInterval(relogio);
            botao.disabled = false;
            botao.textContent = 'Entrar';
            detalhe.textContent = 'Pronto, pode tentar de novo.';
            humor.modo = 'normal';
            return;
        }
        botao.textContent = `Aguarde ${segundosDeEspera}s`;
        detalhe.textContent = `Espere ${segundosDeEspera} segundos para tentar de novo.`;
    }, 1000);

} else if (resultado === 'cadastrado') {
    // Acabou de criar a conta: comemora e depois espera a senha
    humor.modo = 'sucesso';
    humor.pulo = 1;
    setTimeout(() => {
        humor.modo = 'normal';
        senha.focus(); // o e-mail já vem preenchido, falta só a senha
    }, 2500);

} else if (resultado === 'sucesso') {
    // Comemora e segue para a loja
    humor.modo = 'sucesso';
    humor.pulo = 1;
    setTimeout(() => { window.location.href = 'index.php'; }, 2000);
}
// Sem resultado: o mascote começa com as boas-vindas (o padrão do mascote.js)
