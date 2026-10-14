-- Cliente de teste para entrar na loja enquanto a página de cadastro não existe.
--
-- E-mail: teste@antoniett.com
-- Senha:  caneca123
--
-- A senha NÃO fica guardada como "caneca123". O valor abaixo é o hash gerado pelo
-- password_hash() do PHP: uma versão embaralhada que não dá para desfazer.
-- No login, o password_verify() compara a senha digitada com esse hash.
--
-- Como usar: no phpMyAdmin, abra o banco login_db, vá em "Importar" e escolha este arquivo.
-- (Importe antes o login_db.sql, que cria a tabela.)

INSERT INTO `cadastro` (`nome`, `email`, `senha`) VALUES
('Cliente de Teste', 'teste@antoniett.com', '$2y$12$xaT1SdkHOUFXpzlv2PciKOcmqWUuVsTSQCJxFjJB0nBSFQ5AdfKx6');
