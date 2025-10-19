-- Criar database
CREATE DATABASE billing_db;

-- Conectar ao database billing_db
\c billing_db;

DROP TABLE IF EXISTS invoice_products CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

-- Opcional: deletar a extensão e recriar
DROP EXTENSION IF EXISTS "uuid-ossp";
-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar usuário
CREATE USER billing_user WITH PASSWORD 'billing_password';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE billing_db TO billing_user;
GRANT ALL ON SCHEMA public TO billing_user;

-- Criar tabelas
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_code VARCHAR(100) NOT NULL, -- ✅ Mudado para invoice_code
    product_id VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key agora referencia o code da invoice
    CONSTRAINT fk_invoice
        FOREIGN KEY (invoice_code) 
        REFERENCES invoices(code)
        ON DELETE CASCADE
);
-- Conceder privilégios nas tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO billing_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO billing_user;

-- Alterar owner das tabelas para o usuário
ALTER TABLE invoices OWNER TO billing_user;
ALTER TABLE invoice_products OWNER TO billing_user;
