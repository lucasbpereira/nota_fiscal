-- Criar database se não existir
SELECT 'CREATE DATABASE stock_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stock_db')\gexec

-- Conectar ao database stock_db
\c stock_db;

-- Criar usuário se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'stock_user') THEN
        CREATE USER stock_user WITH PASSWORD 'stock_password';
    END IF;
END
$$;

-- Garantir privilégios
GRANT ALL PRIVILEGES ON DATABASE stock_db TO stock_user;
ALTER DATABASE stock_db OWNER TO stock_user;

-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de produtos CORRIGIDA
CREATE TABLE IF NOT EXISTS product (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0), 
    balance     INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0)          
);

-- Garantir privilégios nas tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stock_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stock_user;

-- Inserir dados de exemplo (agora compatíveis)
INSERT INTO product (id, name, description, price, balance) VALUES
    (uuid_generate_v4(), 'Product A', 'Description A', 29.99, 100),
    (uuid_generate_v4(), 'Product B', 'Description B', 49.99, 50),
    (uuid_generate_v4(), 'Product C', 'Description C', 9.99, 200)
ON CONFLICT DO NOTHING;