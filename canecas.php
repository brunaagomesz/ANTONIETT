<?php
$tituloPagina = 'Canecas';
$paginaAtual = 'canecas';
require 'includes/cabecalho.php';
?>

    <section class="hero">
			<div class="text_apresentacao">
				<h4>PERSONALIZE DO SEU JEITO</h4>

				<h1>
					Transforme suas ideias em
					<span>canecas únicas</span>
				</h1>

				<p>
					Crie canecas exclusivas com qualidade premium, personalização completa e um design moderno
					pensado especialmente para você.
				</p>

				<div class="mini-info">
					<span>✔ Personalizadas</span>
					<span>✔ Alta qualidade</span>
					<span>✔ Entrega rápida</span>
				</div>

				<button class="btn-hero">Adquira já</button>
			</div>

			<div class="background-video">
				<div class="blur"></div>

				<video class="video_caneca" autoplay muted loop playsinline controls>
    				<source src="./src/img/8540516-hd_1920_1080_30fps.mp4" type="video/mp4">
				</video>
			</div>
		</section>
		<section class="como-funciona">
			<h1>Como funciona?</h1>

			<div class="passos">
				<div class="passo">
					<span>01</span>

					<h3>Escolha sua caneca</h3>

					<p>Escolha o modelo ideal entre nossas opções.</p>
				</div>

				<div class="passo">
					<span>02</span>

					<h3>Personalize</h3>

					<p>Envie sua arte, frase ou ideia criativa.</p>
				</div>

				<div class="passo">
					<span>03</span>

					<h3>Receba em casa</h3>

					<p>Produzimos e entregamos com rapidez.</p>
				</div>
			</div>
		</section>
		<section class="unidades">
			<div class="unidades_info">
				<h1 class="animar-texto">
					Transforme suas ideias em
					<span>canecas únicas</span>
				</h1>
			</div>
		</section>
		<section class="painel">
			<div class="images">
				<div class="img1">
					<img src="./src/img/img-principal_caneca.jpg" alt="" />
				</div>
				<div class="img2">
					<img src="./src/img/img2.jpg" alt="" />
				</div>
				<div class="img3">
					<img src="./src/img/img3.jpg" alt="" />
				</div>
			</div>
		</section>

		<main>
			<section class="section-carrossel">
				<div class="info_cardapio">
					<h1>ANTONIETT</h1>
					<h1>Nossos destaques</h1>
				</div>

				<div class="container-wrapper">
					<div class="container-carrossel" id="cards"></div>

					<div class="controles">
						<button onclick="voltar()" aria-label="Anterior">&lt;</button>
						<button onclick="avancar()" aria-label="Próximo">&gt;</button>
					</div>
				</div>
			</section>
		</main>

        <!-- Script do carrossel: só esta página precisa dele -->
        <script src="./javascript/canecas.js"></script>

<?php require 'includes/rodape.php'; ?>
