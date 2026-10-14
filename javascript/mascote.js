/* ==========================================================
   MASCOTE 3D DA TELA DE LOGIN
   ----------------------------------------------------------
   Uma caneca que flutua, acompanha o cursor com os olhos
   e muda de expressão conforme o que acontece no formulário.

   - O corpo vem de um modelo 3D (src/modelos/caneca.glb).
   - O rosto e as mãos são montados aqui pelo código.
   - Quem muda o humor do mascote é o arquivo login.js,
     alterando o objeto "humor" logo abaixo.

   Seções deste arquivo:
     1. Configurações
     2. Humor (o "estado de espírito" do mascote)
     3. Materiais (cores e acabamentos)
     4. Corpo
     5. Rosto
     6. Mãos
     7. Montagem da cena
     8. Para onde os olhos olham
     9. Animação (roda cerca de 60 vezes por segundo)
    10. Início
   ========================================================== */


/* ---------- 1. Configurações ---------- */

const CAMINHO_MODELO = 'src/modelos/caneca.glb';
const ALTURA_MASCOTE = 2.3;   // altura do corpo, em unidades do Three.js
const ESCALA_MASCOTE = 0.78;  // tamanho do mascote na tela (0.7 menor, 0.9 maior)
const ALTURA_VOO = 0.35;      // quanto ele flutua acima do chão

// Respeita quem pediu "menos movimento" nas configurações do sistema
const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---------- 2. Humor ---------- */

// O login.js muda estes valores, e a animação (seção 9) desenha o resultado.
const humor = {
    // modo: boasVindas | normal | email | senha | espiando | erro | bloqueado | carregando | sucesso
    modo: 'boasVindas',
    serio: false,          // true a partir do 3º erro: cara "séria"
    progressoEmail: 0,     // de 0 a 1: quanto do e-mail já foi digitado
    tremor: 0,             // tempo restante do balanço de erro
    pulo: 0,               // tempo restante do pulo de alegria

    // Controle interno da animação
    inicio: 0,
    piscar: 0,
    proximaPiscada: 2,
    mouseX: 0, mouseY: 0,     // cursor limitado entre -1 e 1 (para virar o corpo)
    cursorX: 0, cursorY: 0,   // cursor sem limite (para mirar os olhos)
    temCursor: false,
    ultimoMovimento: 0,
    desvioX: 0, desvioY: 0,   // pequenas olhadelas quando o cursor está parado
    proximaOlhadela: 1.5,
};

// Partes do mascote (preenchidas na montagem)
const m = {};
const vapor = [];
let renderizador, cena, camera;


/* ---------- 3. Materiais ---------- */

// Criados só quando o 3D liga. Sem a Three.js, o formulário continua funcionando.
let material;

function criarMateriais() {
    material = {
        ceramica: () => new THREE.MeshPhysicalMaterial({ color: 0xF4EEE6, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15 }),
        globo: new THREE.MeshPhysicalMaterial({ color: 0xFBF9F7, roughness: 0.2, clearcoat: 1 }),
        iris: new THREE.MeshPhysicalMaterial({ color: 0x3A1648, roughness: 0.15, clearcoat: 1 }),
        pupila: new THREE.MeshPhysicalMaterial({ color: 0x1C0824, roughness: 0.1, clearcoat: 1 }),
        tinta: new THREE.MeshStandardMaterial({ color: 0x3A1648, roughness: 0.4 }),
        brilho: new THREE.MeshBasicMaterial({ color: 0xffffff }),
        boca: new THREE.MeshStandardMaterial({ color: 0x6E1F35, roughness: 0.5 }),
    };
}


/* ---------- 4. Corpo ---------- */

// Corpo vindo do modelo 3D: ajusta o tamanho e deixa a cerâmica brilhante
function corpoDoModelo(cenaDoModelo) {
    cenaDoModelo.traverse((parte) => {
        if (!parte.isMesh) return;
        parte.geometry.computeVertexNormals(); // o modelo veio sem as normais (necessárias para a luz)
        parte.material = new THREE.MeshPhysicalMaterial({
            map: parte.material.map,
            roughness: 0.32,
            clearcoat: 0.9,
            clearcoatRoughness: 0.18,
        });
        parte.material.color.setScalar(1.25); // clareia a textura, que veio um pouco acinzentada
    });

    // Redimensiona para a altura desejada e centraliza
    const caixa = new THREE.Box3().setFromObject(cenaDoModelo);
    cenaDoModelo.scale.setScalar(ALTURA_MASCOTE / (caixa.max.y - caixa.min.y));
    const centro = new THREE.Box3().setFromObject(cenaDoModelo).getCenter(new THREE.Vector3());
    cenaDoModelo.position.sub(centro);

    const corpo = new THREE.Group();
    corpo.add(cenaDoModelo);
    return corpo;
}

// Corpo simples feito com formas básicas, usado se o modelo não carregar
function corpoSimples() {
    const corpo = new THREE.Group();
    const ceramica = material.ceramica();

    const lado = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.96, ALTURA_MASCOTE, 96, 1, true), ceramica);
    corpo.add(lado);

    const borda = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.05, 16, 96),
        new THREE.MeshPhysicalMaterial({ color: 0xA60FCC, roughness: 0.3, clearcoat: 1 }));
    borda.rotation.x = Math.PI / 2;
    borda.position.y = ALTURA_MASCOTE / 2;
    corpo.add(borda);

    const fundo = new THREE.Mesh(new THREE.CircleGeometry(0.96, 64), ceramica);
    fundo.rotation.x = Math.PI / 2;
    fundo.position.y = -ALTURA_MASCOTE / 2;
    corpo.add(fundo);

    const alca = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 24, 64, Math.PI), ceramica);
    alca.rotation.z = Math.PI / 2;
    alca.position.x = -0.97;
    corpo.add(alca);

    return corpo;
}


/* ---------- 5. Rosto ---------- */

// "Mira" na frente da caneca, como um laser, e cola a peça na superfície, virada para fora.
// Assim o rosto se encaixa em qualquer formato de corpo.
function colarNaFrente(peca, corpo, x, y, afastar) {
    const raio = new THREE.Raycaster(new THREE.Vector3(x, y, 10), new THREE.Vector3(0, 0, -1));
    const acerto = raio.intersectObject(corpo, true)[0];
    if (!acerto) {
        peca.position.set(x, y, 1.1);
        return;
    }
    const normal = acerto.face.normal.clone().transformDirection(acerto.object.matrixWorld);
    peca.position.copy(acerto.point).addScaledVector(normal, afastar);
    peca.lookAt(peca.position.clone().add(normal));
}

// medidas: base (pé), altura e raio do corpo. As posições são porcentagens da altura.
function montarRosto(corpo, medidas) {
    const { base, altura, raio } = medidas;
    const emAltura = (fracao) => base + altura * fracao; // 0.5 = metade da altura
    const rosto = new THREE.Group();

    // Olhos
    m.olhos = [-1, 1].map((lado) => {
        const olho = new THREE.Group();
        colarNaFrente(olho, corpo, lado * raio * 0.36, emAltura(0.5), 0.02);

        // Bola do olho: esfera branca com íris e pupila na frente. É ela que gira para olhar.
        const globo = new THREE.Group();
        globo.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 24), material.globo));
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 24), material.iris);
        iris.scale.set(1, 1.1, 0.42);
        iris.position.z = 0.12;
        globo.add(iris);
        const pupila = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), material.pupila);
        pupila.scale.set(1, 1.1, 0.4);
        pupila.position.z = 0.165;
        globo.add(pupila);
        globo.scale.y = 1.15;
        olho.add(globo);

        // Brilhos ficam fora da bola: não giram junto, como o reflexo de uma luz de verdade
        const brilhos = new THREE.Group();
        const brilhoGrande = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), material.brilho);
        brilhoGrande.position.set(0.055, 0.075, 0.2);
        brilhos.add(brilhoGrande);
        const brilhoPequeno = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), material.brilho);
        brilhoPequeno.position.set(-0.05, -0.06, 0.2);
        brilhos.add(brilhoPequeno);
        olho.add(brilhos);

        // Olho fechado feliz "^" e olho fechado de sono (o mesmo arco, de cabeça para baixo)
        const feliz = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.028, 12, 24, Math.PI), material.tinta);
        feliz.visible = false;
        olho.add(feliz);
        const sono = feliz.clone();
        sono.rotation.z = Math.PI;
        olho.add(sono);

        olho.userData = { globo, brilhos, feliz, sono };
        rosto.add(olho);
        return olho;
    });

    // Sobrancelhas finas
    m.sobrancelhas = [-1, 1].map((lado) => {
        const grupo = new THREE.Group();
        colarNaFrente(grupo, corpo, lado * raio * 0.38, emAltura(0.66), 0.015);
        const inclinar = new THREE.Group(); // grupo interno só para inclinar
        const traco = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 10), material.tinta);
        traco.rotation.z = Math.PI / 2;
        inclinar.add(traco);
        grupo.add(inclinar);
        grupo.userData = { lado, inclinar, alturaInicial: grupo.position.y };
        rosto.add(grupo);
        return grupo;
    });

    // Bochechas: sempre um pouco coradas
    m.bochechas = [-1, 1].map((lado) => {
        const bochecha = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32),
            new THREE.MeshBasicMaterial({ color: 0xF49AB5, transparent: true, opacity: 0.45, depthWrite: false }));
        bochecha.scale.x = 1.35;
        colarNaFrente(bochecha, corpo, lado * raio * 0.66, emAltura(0.4), 0.008);
        rosto.add(bochecha);
        return bochecha;
    });

    // Bocas: uma peça para cada expressão. Só uma aparece por vez.
    const boca = new THREE.Group();
    colarNaFrente(boca, corpo, 0, emAltura(0.37), 0.015);

    const sorriso = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 12, 32, Math.PI), material.tinta);
    sorriso.rotation.z = Math.PI;
    const triste = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.022, 12, 32, Math.PI), material.tinta);
    triste.position.y = -0.06;
    const aberta = new THREE.Mesh(new THREE.CircleGeometry(0.055, 32), material.boca);
    aberta.scale.y = 1.25;
    const risada = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32, Math.PI, Math.PI), material.boca);
    const reta = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 10), material.tinta);
    reta.rotation.z = Math.PI / 2;

    m.bocas = { sorriso, triste, aberta, risada, reta };
    Object.values(m.bocas).forEach((peca) => boca.add(peca));
    rosto.add(boca);

    return rosto;
}


/* ---------- 6. Mãos ---------- */

// Luvinha: uma palma achatada e um polegar
function criarMao() {
    const mao = new THREE.Group();
    const ceramica = material.ceramica();
    const palma = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), ceramica);
    palma.scale.set(1, 0.9, 0.7);
    mao.add(palma);
    const polegar = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), ceramica);
    polegar.position.set(-0.17, 0.05, 0.08); // do lado de dentro, virado para o corpo
    mao.add(polegar);
    return mao;
}

// Onde as mãos ficam em cada expressão: [mão esquerda, mão direita]
function calcularPosicoesDasMaos(medidas) {
    const { base, altura, raio } = medidas;
    const topo = base + altura;
    const olhoE = m.olhos[0].position;
    const olhoD = m.olhos[1].position;
    const bochechaE = m.bochechas[0].position;
    const bochechaD = m.bochechas[1].position;
    const v = (x, y, z) => new THREE.Vector3(x, y, z);

    m.posicoes = {
        descanso: [v(-raio - 0.45, base + altura * 0.34, 0.55), v(raio + 0.45, base + altura * 0.34, 0.55)],
        tapar: [v(olhoE.x, olhoE.y, olhoE.z + 0.22), v(olhoD.x, olhoD.y, olhoD.z + 0.22)],
        espiar: v(olhoD.x + 0.3, olhoD.y - 0.42, olhoD.z + 0.2),           // só a mão direita abaixa
        aceno: v(raio + 0.45, topo - 0.05, 0.4),                             // só a mão direita acena
        cima: [v(-raio - 0.3, topo + 0.15, 0.3), v(raio + 0.3, topo + 0.15, 0.3)],
        rosto: [v(bochechaE.x - 0.05, bochechaE.y - 0.05, bochechaE.z + 0.18),
                v(bochechaD.x + 0.05, bochechaD.y - 0.05, bochechaD.z + 0.18)],
        cintura: [v(-raio - 0.05, base + altura * 0.28, 0.5), v(raio + 0.05, base + altura * 0.28, 0.5)],
    };
}


/* ---------- 7. Montagem da cena ---------- */

// Desenha uma bolinha macia num canvas, usada no vapor e na sombra.
// corFim é a mesma cor, transparente (se fosse preto, o vapor ficaria com borda cinza).
function texturaRedonda(cor, corFim = 'rgba(0,0,0,0)') {
    const tela = document.createElement('canvas');
    tela.width = tela.height = 128;
    const ctx = tela.getContext('2d');
    const degrade = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    degrade.addColorStop(0, cor);
    degrade.addColorStop(1, corFim);
    ctx.fillStyle = degrade;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(tela);
}

function montarMascote(corpo) {
    m.mascote = new THREE.Group();
    m.mascote.add(corpo);
    m.mascote.updateMatrixWorld(true);

    // Medidas do corpo, usadas para posicionar rosto, mãos e café
    const caixa = new THREE.Box3().setFromObject(corpo);
    const medidas = {
        base: caixa.min.y,
        altura: caixa.max.y - caixa.min.y,
        raio: (caixa.max.z - caixa.min.z) / 2, // profundidade do corpo (a alça fica de fora)
    };

    m.mascote.add(montarRosto(corpo, medidas));

    // Café dentro da caneca
    const cafe = new THREE.Mesh(new THREE.CircleGeometry(medidas.raio * 0.8, 48),
        new THREE.MeshPhysicalMaterial({ color: 0x3B2416, roughness: 0.15, clearcoat: 1 }));
    cafe.rotation.x = -Math.PI / 2;
    cafe.position.y = caixa.max.y - 0.16;
    m.mascote.add(cafe);
    m.topo = caixa.max.y * ESCALA_MASCOTE;

    // Mãos
    m.maos = [criarMao(), criarMao()];
    m.maos[0].scale.x = -1; // a mão esquerda é a direita espelhada
    calcularPosicoesDasMaos(medidas);
    m.maos.forEach((mao, i) => {
        mao.position.copy(m.posicoes.descanso[i]);
        m.mascote.add(mao);
    });

    m.mascote.scale.setScalar(ESCALA_MASCOTE);
    cena.add(m.mascote);

    // Sombra no chão
    m.sombra = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8),
        new THREE.MeshBasicMaterial({ map: texturaRedonda('rgba(0,0,0,0.6)'), transparent: true, depthWrite: false }));
    m.sombra.rotation.x = -Math.PI / 2;
    m.sombra.position.y = caixa.min.y * ESCALA_MASCOTE - 0.25;
    cena.add(m.sombra);

    // Vapor: bolinhas que sobem do café e somem
    const texturaVapor = texturaRedonda('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)');
    for (let i = 0; i < 14; i++) {
        const bolinha = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaVapor, transparent: true, depthWrite: false, opacity: 0 }));
        bolinha.userData = { vida: Math.random(), desvio: (Math.random() - 0.5) * 0.5 };
        cena.add(bolinha);
        vapor.push(bolinha);
    }

    humor.inicio = performance.now() / 1000;
    requestAnimationFrame(animar);
}

function prepararCena() {
    const palco = document.getElementById('palco');

    renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderizador.outputEncoding = THREE.sRGBEncoding;
    renderizador.physicallyCorrectLights = true;
    renderizador.domElement.setAttribute('aria-hidden', 'true');
    palco.appendChild(renderizador.domElement);

    cena = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    // Luzes: uma geral, uma principal e uma lilás por trás (contorno)
    cena.add(new THREE.HemisphereLight(0xffffff, 0x2E1A2F, 1.6));
    const principal = new THREE.DirectionalLight(0xffffff, 3);
    principal.position.set(3, 5, 7);
    cena.add(principal);
    const contorno = new THREE.DirectionalLight(0xD58BEA, 2.4);
    contorno.position.set(-5, 3, -4);
    cena.add(contorno);

    // Ajusta a câmera ao tamanho do palco (e de novo quando a janela muda)
    function ajustarTamanho() {
        const largura = palco.clientWidth;
        const altura = palco.clientHeight;
        renderizador.setSize(largura, altura, false);
        camera.aspect = largura / altura;
        const estreito = largura / altura < 0.9; // celular em pé
        camera.position.set(0, 0.8, estreito ? 12 : 9.5);
        camera.lookAt(0, estreito ? 0.5 : 0.25, 0);
        camera.updateProjectionMatrix();
    }
    ajustarTamanho();
    window.addEventListener('resize', ajustarTamanho);

    // Guarda onde está o cursor, em qualquer ponto da página
    document.addEventListener('pointermove', (evento) => {
        const r = renderizador.domElement.getBoundingClientRect();
        humor.cursorX = ((evento.clientX - r.left) / r.width) * 2 - 1;
        humor.cursorY = -((evento.clientY - r.top) / r.height) * 2 + 1;
        humor.temCursor = true;
        humor.ultimoMovimento = performance.now();
        humor.mouseX = limitar(humor.cursorX, -1, 1);
        humor.mouseY = limitar(-humor.cursorY, -1, 1);
    });
}


/* ---------- 8. Para onde os olhos olham ---------- */

const suave = (atual, alvo, velocidade, dt) => atual + (alvo - atual) * Math.min(velocidade * dt, 1);
const limitar = (valor, minimo, maximo) => Math.max(minimo, Math.min(maximo, valor));

// Os olhos miram um ponto num "plano invisível" na frente do mascote
let raioDoOlhar, planoDoOlhar, alvoDoOlhar;

function calcularAlvoDoOlhar(dt) {
    const centro = m.mascote.position;
    const destino = new THREE.Vector3(centro.x, centro.y + 0.2, 2.5);

    if (humor.modo === 'email') {
        // olha para o formulário, à direita, e acompanha o texto crescendo
        destino.set(centro.x + 1.2 + humor.progressoEmail * 1.4, centro.y - 0.9, 2.5);
    } else if (humor.modo === 'carregando') {
        destino.set(centro.x, centro.y + 2, 2.5);
    } else if (humor.modo === 'erro') {
        if (humor.serio) destino.set(centro.x + 2.2, centro.y + 0.1, 2.5); // olhar de lado
        else destino.set(centro.x, centro.y - 0.5, 2.5);                   // olhar para baixo
    } else if (humor.temCursor) {
        // "Dispara" um raio da câmera na direção do cursor e vê onde ele cruza o plano
        raioDoOlhar.setFromCamera({ x: humor.cursorX, y: humor.cursorY }, camera);
        raioDoOlhar.ray.intersectPlane(planoDoOlhar, destino);
        // Limita o giro para o olho não "virar do avesso"
        destino.x = limitar(destino.x, centro.x - 2.4, centro.x + 2.4);
        destino.y = limitar(destino.y, centro.y - 1.8, centro.y + 2);
    }

    // Olhadelas: com o cursor parado, o olho dá pequenos saltos de vez em quando
    const parado = performance.now() - humor.ultimoMovimento > 1200;
    if (humor.modo === 'normal' && parado && !semMovimento) {
        humor.proximaOlhadela -= dt;
        if (humor.proximaOlhadela <= 0) {
            humor.desvioX = (Math.random() - 0.5) * 0.9;
            humor.desvioY = (Math.random() - 0.5) * 0.6;
            humor.proximaOlhadela = 1.2 + Math.random() * 2;
        }
    } else {
        humor.desvioX = 0;
        humor.desvioY = 0;
    }
    destino.x += humor.desvioX;
    destino.y += humor.desvioY;

    alvoDoOlhar.lerp(destino, Math.min(dt * 10, 1)); // segue com um pequeno atraso
    return alvoDoOlhar;
}


/* ---------- 9. Animação ---------- */

let ultimoQuadro = performance.now();

function animar(agora) {
    requestAnimationFrame(animar);
    if (document.hidden) return; // pausa quando a aba não está visível

    const dt = Math.min((agora - ultimoQuadro) / 1000, 0.05); // segundos desde o último quadro
    ultimoQuadro = agora;
    const t = agora / 1000;

    // As boas-vindas duram cerca de 3 segundos
    if (humor.modo === 'boasVindas' && t - humor.inicio > 3.2) humor.modo = 'normal';

    const modo = humor.modo;
    const olhosFelizes = modo === 'boasVindas' || modo === 'sucesso';
    const olhosDeSono = modo === 'bloqueado';

    // Piscar de vez em quando
    humor.proximaPiscada -= dt;
    if (humor.proximaPiscada <= 0) {
        humor.piscar = 0.14;
        humor.proximaPiscada = 2.5 + Math.random() * 3;
    }
    humor.piscar = Math.max(humor.piscar - dt, 0);

    // --- Olhos ---
    m.mascote.updateMatrixWorld(true);
    const alvo = calcularAlvoDoOlhar(dt);
    m.olhos.forEach((olho) => {
        const { globo, brilhos, feliz, sono } = olho.userData;
        const aberto = !olhosFelizes && !olhosDeSono;
        globo.visible = aberto;
        brilhos.visible = aberto;
        feliz.visible = olhosFelizes;
        sono.visible = olhosDeSono;

        // Piscada, e olho meio fechado quando está "sério"
        const abertura = humor.piscar > 0 ? 0.1 : (humor.serio && modo === 'erro' ? 0.55 : 1);
        globo.scale.y = suave(globo.scale.y, 1.15 * abertura, 25, dt);
        brilhos.scale.y = globo.scale.y / 1.15;

        // Gira a bola do olho em direção ao alvo, de forma suave
        const antes = globo.quaternion.clone();
        globo.lookAt(alvo);
        const depois = globo.quaternion.clone();
        globo.quaternion.copy(antes).slerp(depois, Math.min(dt * 14, 1));
    });

    // --- Sobrancelhas: levantam no meio quando triste, sobem na alegria ---
    let subir = 0;
    let inclinacao = 0;
    if (modo === 'erro') {
        inclinacao = humor.serio ? 0.15 : -0.35;
        subir = humor.serio ? -0.02 : 0.04;
    }
    if (modo === 'bloqueado') subir = -0.03;
    if (olhosFelizes) subir = 0.07;
    if (modo === 'senha' || modo === 'espiando' || modo === 'email') subir = 0.04;
    m.sobrancelhas.forEach((s) => {
        s.position.y = suave(s.position.y, s.userData.alturaInicial + subir, 10, dt);
        s.userData.inclinar.rotation.z = suave(s.userData.inclinar.rotation.z, inclinacao * s.userData.lado, 10, dt);
    });

    // --- Boca: qual peça aparece em cada humor ---
    const bocaDoHumor = {
        boasVindas: 'risada', normal: 'sorriso', email: 'aberta', senha: 'sorriso', espiando: 'sorriso',
        erro: 'triste', bloqueado: 'aberta', carregando: 'aberta', sucesso: 'risada',
    };
    let boca = bocaDoHumor[modo];
    if (modo === 'erro' && humor.serio) boca = 'reta';
    Object.entries(m.bocas).forEach(([nome, peca]) => { peca.visible = nome === boca; });

    // --- Bochechas mais coradas na alegria e na espiadinha ---
    const corado = (olhosFelizes || modo === 'espiando') ? 0.85 : 0.45;
    m.bochechas.forEach((b) => { b.material.opacity = suave(b.material.opacity, corado, 6, dt); });

    // --- Mãos ---
    const p = m.posicoes;
    const balancoMaos = semMovimento ? 0 : Math.sin(t * 2) * 0.04;
    m.maos.forEach((mao, i) => {
        let destino = p.descanso[i].clone();
        destino.y += balancoMaos * (i === 0 ? 1 : -1);

        if (modo === 'senha' || (modo === 'espiando' && i === 0)) {
            destino = p.tapar[i].clone();                       // tapa os olhos
        } else if (modo === 'espiando' && i === 1) {
            destino = p.espiar.clone();                         // abaixa uma mão para espiar
        } else if (modo === 'boasVindas' && i === 1) {
            const aceno = semMovimento ? 0 : Math.sin(t * 12) * 0.22;
            destino = p.aceno.clone().add(new THREE.Vector3(aceno * 0.4, aceno, 0)); // acena
        } else if (modo === 'sucesso') {
            destino = p.cima[i].clone();                        // comemora
            destino.y += semMovimento ? 0 : Math.sin(t * 10 + i) * 0.08;
        } else if (modo === 'erro') {
            destino = humor.serio ? p.cintura[i].clone() : p.rosto[i].clone();
        }
        mao.position.lerp(destino, Math.min(dt * 10, 1));
    });

    // --- Corpo: flutuar, virar para o cursor, tremer no erro, pular na alegria ---
    if (humor.tremor > 0) humor.tremor = Math.max(humor.tremor - dt, 0);
    const tremor = semMovimento ? 0 : Math.sin(t * 40) * 0.1 * (humor.tremor / 0.8);
    if (humor.pulo > 0) humor.pulo = Math.max(humor.pulo - dt * 1.8, 0);
    const pulo = Math.sin(humor.pulo * Math.PI) * 0.6;

    // Flutuação: três movimentos com ritmos diferentes, para nunca repetir igual
    const flutuar = semMovimento ? 0 : Math.sin(t * 1.1) * 0.16;          // sobe e desce
    const deriva = semMovimento ? 0 : Math.sin(t * 0.55) * 0.18;          // vai para os lados
    const balancoNoAr = semMovimento ? 0 : Math.sin(t * 0.9 + 1) * 0.05;  // inclina de leve

    const olhandoParaFrente = modo === 'senha' || modo === 'espiando';
    const giroDoCorpo = olhandoParaFrente ? 0 : humor.mouseX * 0.28;
    m.mascote.rotation.y = suave(m.mascote.rotation.y, giroDoCorpo, 4, dt) + tremor;
    m.mascote.rotation.x = suave(m.mascote.rotation.x, humor.mouseY * 0.06, 4, dt);
    m.mascote.rotation.z = tremor * 0.5 + balancoNoAr;
    m.mascote.position.x = suave(m.mascote.position.x, deriva, 2, dt);
    if (modo === 'carregando' && !semMovimento) {
        m.mascote.position.y = ALTURA_VOO + Math.abs(Math.sin(t * 9)) * 0.18; // pulinhos de ansiedade
    } else {
        m.mascote.position.y = ALTURA_VOO + flutuar + pulo;
    }

    // A sombra fica no chão: diminui e clareia quando o mascote sobe
    const alturaAtual = m.mascote.position.y;
    m.sombra.position.x = m.mascote.position.x;
    m.sombra.scale.setScalar(Math.max(0.85 - alturaAtual * 0.35, 0.35) * ESCALA_MASCOTE);
    m.sombra.material.opacity = Math.max(0.9 - alturaAtual * 0.6, 0.25);

    // --- Vapor saindo do café ---
    vapor.forEach((bolinha) => {
        bolinha.userData.vida += dt * (semMovimento ? 0.08 : 0.28);
        if (bolinha.userData.vida > 1) {
            bolinha.userData.vida = 0;
            bolinha.userData.desvio = (Math.random() - 0.5) * 0.5;
        }
        const vida = bolinha.userData.vida; // 0 = acabou de sair, 1 = sumiu
        bolinha.position.set(
            m.mascote.position.x + bolinha.userData.desvio * ESCALA_MASCOTE + Math.sin(t * 1.5 + vida * 6) * 0.12 * vida,
            m.mascote.position.y + m.topo - 0.08 + vida * 1.3,
            0
        );
        bolinha.scale.setScalar((0.2 + vida * 0.5) * ESCALA_MASCOTE);
        bolinha.material.opacity = Math.sin(vida * Math.PI) * (modo === 'bloqueado' ? 0.15 : 0.45);
    });

    renderizador.render(cena, camera);
}


/* ---------- 10. Início ---------- */

function webglDisponivel() {
    try {
        const teste = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (teste.getContext('webgl') || teste.getContext('experimental-webgl')));
    } catch (erro) {
        return false;
    }
}

function iniciarMascote() {
    // Sem Three.js ou sem suporte a 3D: mostra a foto da caneca no lugar
    if (!window.THREE || !webglDisponivel()) {
        document.getElementById('sem-3d').hidden = false;
        return;
    }

    criarMateriais();
    raioDoOlhar = new THREE.Raycaster();
    planoDoOlhar = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.5); // o plano z = 2.5
    alvoDoOlhar = new THREE.Vector3(0, 0.3, 2.5);
    prepararCena();

    // Carrega o modelo 3D. Se der erro (arquivo faltando, por exemplo), usa o corpo simples.
    if (THREE.GLTFLoader) {
        new THREE.GLTFLoader().load(
            CAMINHO_MODELO,
            (gltf) => montarMascote(corpoDoModelo(gltf.scene)),
            undefined,
            () => montarMascote(corpoSimples())
        );
    } else {
        montarMascote(corpoSimples());
    }
}

iniciarMascote();
