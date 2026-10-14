/* ==========================================================
   FORMULÁRIO DE CADASTRO + REAÇÕES DO MASCOTE
   ----------------------------------------------------------
   Funciona como o login.js: quem confere os dados é o
   cadastro.php. Aqui só mudamos o "humor" do mascote
   (definido em mascote.js) conforme a pessoa usa o formulário.
   ========================================================== */

const nome = document.getElementById('nome');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const confirmacao = document.getElementById('confirmacao');
const botao = document.getElementById('botao-criar');
const botaoMostrar = document.getElementById('mostrar-senha');
const formulario = document.getElementById('form-cadastro');

// O PHP escreve "erro" no <body> quando algum campo veio errado
const resultado = document.body.dataset.estado;

// Enquanto o mascote mostra a reação de erro, ele não troca de humor
let reagindoAoErro = false;

// Diz se o mascote pode trocar de expressão agora
function podeMudarHumor() {
    return !reagindoAoErro && humor.modo !== 'carregando';
}


/* ---------- Humor de acordo com o campo em foco ---------- */

function humorDoCampoEmFoco() {
    const campo = document.activeElement;

    if (campo === nome || campo === email) {
        // O modo "email" faz o mascote olhar para o formulário e acompanhar o texto
        humor.modo = 'email';
        humor.progressoEmail = Math.min(campo.value.length / 28, 1);
    } else if (campo === senha || campo === confirmacao) {
        // Senha visível: espia. Senha escondida: tapa os olhos.
        humor.modo = senha.type === 'text' ? 'espiando' : 'senha';
    } else {
        humor.modo = 'normal';
    }
}

[nome, email, senha, confirmacao].forEach((campo) => {
    campo.addEventListener('focus', () => {
        if (podeMudarHumor()) humorDoCampoEmFoco();
    });

    // Ao sair de um campo, espera um instante para ver se a pessoa foi para outro campo
    campo.addEventListener('blur', () => {
        setTimeout(() => {
            if (podeMudarHumor()) humorDoCampoEmFoco();
        }, 0);
    });
});

// Os olhos acompanham o nome e o e-mail sendo digitados
[nome, email].forEach((campo) => {
    campo.addEventListener('input', () => {
        humor.progressoEmail = Math.min(campo.value.length / 28, 1);
    });
});


/* ---------- Mostrar e esconder as senhas ---------- */

// O mesmo botão mostra os dois campos de senha, para facilitar a conferência
botaoMostrar.addEventListener('click', () => {
    const mostrar = senha.type === 'password';
    senha.type = mostrar ? 'text' : 'password';
    confirmacao.type = senha.type;
    botaoMostrar.textContent = mostrar ? 'Esconder senha' : 'Mostrar senha';
    botaoMostrar.setAttribute('aria-pressed', mostrar ? 'true' : 'false');
    senha.focus();
    if (podeMudarHumor()) humorDoCampoEmFoco();
});


/* ---------- Envio do formulário ---------- */

// Não impedimos o envio: o formulário vai para o cadastro.php normalmente.
formulario.addEventListener('submit', () => {
    botao.disabled = true;
    botao.innerHTML = '<span class="girando" aria-hidden="true"></span>Criando conta';
    humor.modo = 'carregando';
});


/* ---------- Resultado que veio do PHP ---------- */

if (resultado === 'erro') {
    // Fica triste por um momento, depois volta ao normal
    humor.modo = 'erro';
    humor.tremor = 0.8;
    reagindoAoErro = true;

    // Leva o cursor para o primeiro campo com erro
    const primeiroErro = document.querySelector('[aria-invalid="true"]');
    if (primeiroErro) primeiroErro.focus();

    setTimeout(() => {
        reagindoAoErro = false;
        humorDoCampoEmFoco();
    }, 2500);
}
// Sem resultado: o mascote começa com as boas-vindas (o padrão do mascote.js)
