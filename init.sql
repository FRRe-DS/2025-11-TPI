-- 1️⃣ Crear la base de datos del backend
CREATE DATABASE stock_management;

-- 2️⃣ Crear la base de datos para Keycloak
CREATE DATABASE keycloak_db;

-- 3️⃣ Crear usuario de Keycloak
CREATE USER keycloak_db_user WITH PASSWORD 'keycloak_db_user_password';

-- 4️⃣ Dar permisos a keycloak_db_user
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_db_user;

-- 5️⃣ Conectarse a keycloak_db y ajustar schema
\c keycloak_db;

GRANT ALL ON SCHEMA public TO keycloak_db_user;
ALTER SCHEMA public OWNER TO keycloak_db_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO keycloak_db_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO keycloak_db_user;

-- 6️⃣ Volver a conectar a stock_management
-- El schema.sql se ejecutará automáticamente después de este archivo
\c stock_management;
