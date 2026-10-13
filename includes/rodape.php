<?php
// Rodapé compartilhado: fecha a página que o cabecalho.php abriu.
?>
        <!-- ================= FOOTER ================= -->
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <img src="./src/img/logoantoniett_n-Photoroom.png" alt="" />

                        <h1>ANTONIETT</h1>
                    </div>

                    <p>Transformando ideias em canecas únicas com qualidade premium e design moderno.</p>
                </div>

                <div class="footer-links">
                    <h3>Navegação</h3>

                    <?php // Usa a mesma lista de itens definida no cabecalho.php ?>
                    <?php foreach ($itensMenu as $item): ?>
                        <a href="<?= $item['link'] ?>"><?= $item['texto'] ?></a>
                    <?php endforeach; ?>
                </div>

                <div class="footer-contact">
                    <h3>Contato</h3>

                    <p>📞 (11) 99999-9999</p>
                    <p>✉ contato@antoniett.com</p>
                    <p>📍 São Paulo - SP</p>
                </div>
                <div class="footer-social">
                    <h3>Redes sociais</h3>

                    <div class="social-icons">
                        <a href="#" aria-label="Instagram">
                            <i class="fa-brands fa-instagram"></i>
                        </a>

                        <a href="#" aria-label="WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>

                        <a href="#" aria-label="TikTok">
                            <i class="fa-brands fa-tiktok"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2026 ANTONIETT. Todos os direitos reservados.</p>
            </div>
        </footer>
        <script src="./javascript/script.js"></script>
    </body>
</html>
