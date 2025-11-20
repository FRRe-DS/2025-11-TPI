-- 1️⃣ Crear las bases de datos
CREATE DATABASE stock_management;
CREATE DATABASE keycloak_db;

-- 2️⃣ Crear usuario de Keycloak
CREATE USER keycloak_db_user WITH PASSWORD 'keycloak_db_user_password';
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_db_user;

-- 3️⃣ Configurar permisos de Keycloak
\c keycloak_db;
GRANT ALL ON SCHEMA public TO keycloak_db_user;
ALTER SCHEMA public OWNER TO keycloak_db_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO keycloak_db_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO keycloak_db_user;

-- 4️⃣ Ahora crear el schema de stock_management
\c stock_management;

-- El contenido del schema.sql se ejecutará como archivo separado después de este
