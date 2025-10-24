# Desarrollo frontend - apigrupo11

Este archivo explica cómo editar y ejecutar solamente el frontend en modo desarrollo usando Docker (hot-reload) o localmente.

Requisitos

- Docker y Docker Compose (v2) instalados en la máquina.
- En Windows, usar PowerShell.

Levantar todo (ya configurado)

- Desde la raíz del repo:

```powershell
docker compose -f apigrupo11/docker-compose.yml up --build -d
```

Acceder al frontend

- Abre tu navegador en: http://localhost:5173

Editar el frontend con hot-reload

- El servicio `frontend` monta la carpeta `apigrupo11/frontend` dentro del contenedor, por lo que los cambios que hagas en tu editor local se reflejarán en el contenedor.
- En Windows es recomendable que `CHOKIDAR_USEPOLLING=true` esté activado (ya está configurado en `docker-compose.yml`) para que el watcher detecte cambios.

Comandos útiles

- Ver logs del frontend:

```powershell
docker compose -f apigrupo11/docker-compose.yml logs -f frontend
```

- Reconstruir y reiniciar el frontend (si cambias dependencias o package.json):

```powershell
docker compose -f apigrupo11/docker-compose.yml up --build -d frontend
```

- Conectarte al contenedor para depurar:

```powershell
docker compose -f apigrupo11/docker-compose.yml exec frontend sh
```

Notas sobre Keycloak

- El proyecto usa Keycloak para autenticación; si necesitas integrarlo mientras editas el frontend, asegúrate de que Keycloak esté accesible y que el frontend tenga la URL correcta de Keycloak en las variables de entorno o configuración.

Si quieres, agrego una tarea para levantar Keycloak en docker-compose y preconfigurar un realm de pruebas.
