<?php
$tituloPagina = 'Início';
$paginaAtual = 'inicio';
require 'includes/cabecalho.php';
?>

    <main id="content">
        <section id="home">
            <div class="shape"></div>
            <div id="cta">
                <h1 class="title">
                    Transforme Suas Ideias em Canecas 
                    <span>Unicas</span>
                </h1>

                <p class="description">
                    Canecas exclusivas para expressar quem você é. Crie, personalize e
                    torne cada momento <span>Unico.</span>
                </p>

                <div id="cta_buttons">
                    <a href="./canecas.php" class="btn-default">
                        Modelos
                    </a>

                    <a href="tel:+55555555555" id="phone_button">
                        <span class="btn-default">
                            <i class="fa-solid fa-phone"></i>
                        </span>
                        (51)99999-9999
                    </a>
                </div>

                <!-- Icone Social media -->
                <div class="social-media-buttons">
                    <a href="#" aria-label="WhatsApp">
                        <i class="fa-brands fa-whatsapp"></i>
                    </a>

                    <a href="#" aria-label="Instagram">
                        <i class="fa-brands fa-instagram"></i>
                    </a>
                </div>
            </div>


            <div id="banner">
                <img class="Caneca" src="./src/img/boonjour.png" alt="Caneca ANTONIETT">
            </div>
        
        </section>
        
    </main>

<?php require 'includes/rodape.php'; ?>
