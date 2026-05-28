-- ============================================================
--  PREFEITURA+ API  — Schema MySQL (Railway)
--  Banco já criado pelo Railway, apenas criamos as tabelas.
--  Charset: utf8mb4 (suporte a acentos e emojis)
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Remove tabelas na ordem correta (respeitando FKs)
DROP TABLE IF EXISTS confirmacoes;
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS denuncias;
DROP TABLE IF EXISTS tipo_denuncia;
DROP TABLE IF EXISTS departamentos;
DROP TABLE IF EXISTS usuarios;

-- ============================================================
-- 1. USUÁRIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nome       VARCHAR(255)  NOT NULL,
    email      VARCHAR(255)  NOT NULL UNIQUE,
    senha_hash VARCHAR(255)  NOT NULL,
    papel      ENUM('cidadao', 'funcionario') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cidadao',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. DEPARTAMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS departamentos (
    id                    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nome                  VARCHAR(255)  NOT NULL,
    endereco              VARCHAR(500)  NOT NULL,
    horario_funcionamento VARCHAR(255)  NOT NULL,
    gerente_id            INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_departamento_gerente
        FOREIGN KEY (gerente_id) REFERENCES usuarios (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TIPO_DENUNCIA
-- ============================================================
CREATE TABLE IF NOT EXISTS tipo_denuncia (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(255)  NOT NULL UNIQUE,
    departamento_id INT UNSIGNED  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tipodenuncia_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamentos (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. DENÚNCIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS denuncias (
    id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    titulo            VARCHAR(255)  NOT NULL,
    descricao         TEXT          NOT NULL,
    endereco_denuncia VARCHAR(500)  NOT NULL,
    status            ENUM('Pendente', 'Em análise', 'Resolvido') COLLATE utf8mb4_unicode_ci
                                    NOT NULL DEFAULT 'Pendente',
    anonimo           TINYINT(1)    NOT NULL DEFAULT 0,
    usuario_id        INT UNSIGNED  NULL,
    tipo_denuncia_id  INT UNSIGNED  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_denuncia_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_denuncia_tipo
        FOREIGN KEY (tipo_denuncia_id) REFERENCES tipo_denuncia (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. COMENTÁRIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS comentarios (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    texto        TEXT          NOT NULL,
    data         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id   INT UNSIGNED  NOT NULL,
    denuncia_id  INT UNSIGNED  NOT NULL,
    tipo_usuario ENUM('cidadao', 'funcionario') COLLATE utf8mb4_unicode_ci NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_comentario_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_comentario_denuncia
        FOREIGN KEY (denuncia_id) REFERENCES denuncias (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. CONFIRMAÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS confirmacoes (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    data        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id  INT UNSIGNED  NOT NULL,
    denuncia_id INT UNSIGNED  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_confirmacao (usuario_id, denuncia_id),
    CONSTRAINT fk_confirmacao_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_confirmacao_denuncia
        FOREIGN KEY (denuncia_id) REFERENCES denuncias (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEEDS — Dados iniciais
-- ============================================================

-- Funcionário admin (senha: "admin123")
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES
  ('Admin Prefeitura', 'admin@prefeitura.gov.br',
   '$2b$12$exampleHashAquiTroqueEmProducao', 'funcionario');

-- Departamentos
INSERT INTO departamentos (nome, endereco, horario_funcionamento, gerente_id) VALUES
  ('Iluminação Pública',    'Rua das Luzes, 100',   'Seg-Sex 08h-17h', 1),
  ('Infraestrutura e Vias', 'Av. do Asfalto, 200',  'Seg-Sex 07h-16h', 1),
  ('Limpeza Urbana',        'Rua da Vassoura, 300', 'Seg-Sex 06h-15h', 1);

-- Tipos de denúncia
INSERT INTO tipo_denuncia (nome, departamento_id) VALUES
  ('Lâmpada Queimada',       1),
  ('Buraco na Via',          2),
  ('Calçada Danificada',     2),
  ('Lixo Acumulado',         3),
  ('Entulho em Via Pública', 3);
