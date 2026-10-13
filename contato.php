<?php
$tituloPagina = 'Contato';
$paginaAtual = 'contato';
require 'includes/cabecalho.php';
?>

    <main id="content">
        <section class="contact-container">
            <div class="contact-text">
                <span class="contact-tag">CONTATO</span>
                <h2>Fale com a ANTONIETT</h2>
                <p class="contact-description">
                    Entre em contato conosco para dúvidas, sugestões ou pedidos personalizados.
                </p>

                <div class="contact-info">
                    <p><i class="fa-solid fa-phone"></i> (51)99999-9999</p>
                    <p><i class="fa-solid fa-envelope"></i> contato@antoniett.com</p>
                </div>

                <form id="contact_form">
                    <label for="name">Nome Completo</label>
                    <input type="text" id="name" name="name" required>

                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>

                    <label for="message">Mensagem</label>
                    <textarea id="message" name="message" required></textarea>

                    <button type="submit" class="btn-default">
                        Enviar
                    </button>
                </form>
            </div>

            <div class="contact-image">
                <img src="src/img/imagem_contato.jpg" alt="Imagem contato">
            </div>
        </section>
    </main>

<?php require 'includes/rodape.php'; ?>
