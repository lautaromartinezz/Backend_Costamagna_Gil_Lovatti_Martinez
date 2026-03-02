# 🐳 Gestión de Base de Datos Docker

## Contenedor Actual

Tu base de datos funciona con un contenedor Docker llamado **"gestor-torneos"** que ejecuta Percona Server (MySQL).

### Configuración:
- **Imagen**: `percona/percona-server`
- **Nombre del contenedor**: `gestor-torneos`
- **Puerto**: `3307` (externo) → `3306` (interno)
- **Base de datos**: `gestortorneos`
- **Usuario**: (configurado en variables de entorno)
- **Contraseña**: (configurado en variables de entorno)

> ⚠️ **Nota de Seguridad**: Las credenciales reales están en tu archivo `.env` local (no commiteado). Ver sección de seguridad al final de este documento.

## 🚀 Comandos Útiles

### Ver estado del contenedor
```bash
docker ps -a | findstr gestor-torneos
```

### Iniciar el contenedor (si está detenido)
```bash
docker start gestor-torneos
```

### Detener el contenedor
```bash
docker stop gestor-torneos
```

### Reiniciar el contenedor
```bash
docker restart gestor-torneos
```

### Ver logs del contenedor
```bash
docker logs gestor-torneos
docker logs -f gestor-torneos  # Seguir logs en tiempo real
```

### Conectarse a MySQL dentro del contenedor
```bash
# Usando las credenciales de tu .env
docker exec -it gestor-torneos mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME}

# O interactivamente (te pedirá la contraseña)
docker exec -it gestor-torneos mysql -u ${DB_USER} -p ${DB_NAME}
```

### Ejecutar comandos SQL directamente
```bash
docker exec -it gestor-torneos mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "SHOW TABLES;"
```

### Ver información detallada del contenedor
```bash
docker inspect gestor-torneos
```

## 🔄 Recrear el contenedor (si es necesario)

Si por alguna razón necesitas recrear el contenedor:

```bash
# IMPORTANTE: Lee la sección de seguridad antes de ejecutar estos comandos

# 1. Detener y eliminar el contenedor actual (¡CUIDADO! Perderás los datos)
docker stop gestor-torneos
docker rm gestor-torneos

# 2. Crear nuevo contenedor con variables desde .env
# Reemplaza ${DB_USER}, ${DB_PASSWORD}, ${DB_NAME} con tus valores del .env
docker run -d `
  --name gestor-torneos `
  -e MYSQL_USER=${DB_USER} `
  -e MYSQL_PASSWORD=${DB_PASSWORD} `
  -e MYSQL_DATABASE=${DB_NAME} `
  -e MYSQL_ROOT_PASSWORD=${DB_PASSWORD} `
  -p 3307:3306 `
  percona/percona-server
```

### Con volumen persistente (recomendado)
```bash
docker run -d `
  --name gestor-torneos `
  -v gestor-torneos-data:/var/lib/mysql `
  -e MYSQL_USER=${DB_USER} `
  -e MYSQL_PASSWORD=${DB_PASSWORD} `
  -e MYSQL_DATABASE=${DB_NAME} `
  -e MYSQL_ROOT_PASSWORD=${DB_PASSWORD} `
  -p 3307:3306 `
  percona/percona-server
```

### Usando docker-compose (mejor opción)
Crear archivo `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mysql:
    image: percona/percona-server
    container_name: gestor-torneos
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3307:3306"
    volumes:
      - gestor-torneos-data:/var/lib/mysql
    restart: unless-stopped

volumes:
  gestor-torneos-data:
```

Luego ejecutar:
```bash
docker-compose up -d
```

## 📦 Backup y Restore

### Hacer backup de la base de datos
```bash
# PowerShell
docker exec gestor-torneos mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Bash/Linux
docker exec gestor-torneos mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar desde backup
```bash
docker exec -i gestor-torneos mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < backup_20260301_120000.sql
```

## 🔍 Diagnóstico de Problemas

### El servidor no se conecta a la base de datos

1. **Verificar que el contenedor está corriendo:**
   ```bash
   docker ps | findstr gestor-torneos
   ```
   Si no aparece, iniciarlo: `docker start gestor-torneos`

2. **Verificar que el puerto 3307 está escuchando:**
   ```bash
   netstat -ano | findstr :3307
   ```

3. **Ver logs del contenedor para errores:**
   ```bash
   docker logs gestor-torneos --tail 50
   ```

4. **Probar conexión manual:**
   ```bash
   docker exec -it gestor-torneos mysql -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;"
   ```

### El contenedor no inicia

```bash
# Ver el error
docker logs gestor-torneos

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Intentar reiniciar
docker restart gestor-torneos
```

## ⚙️ Configuración en el Proyecto

La conexión ahora usa variables de entorno del archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=3307
DB_NAME=tu_base_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

La configuración se aplica automáticamente desde `src/shared/config.ts` → `src/shared/db/orm.ts`

## 🔐 Seguridad de Credenciales

### ⚠️ ¿Por qué NO documentar credenciales reales?

Aunque sean para desarrollo local:

1. **Hábito de seguridad**: Acostumbrarse a no exponer credenciales
2. **Repositorios públicos**: Si subes el código a GitHub público, expones las credenciales
3. **Reutilización**: Algunos desarrolladores reusan las mismas credenciales en varios entornos
4. **Historial de Git**: Aunque cambies las credenciales después, quedan en el historial

### ✅ Mejores Prácticas

#### Desarrollo Local:
```bash
# Archivo .env (NO commiteado)
DB_USER=dev_user
DB_PASSWORD=dev_password_2024

# O usar credenciales únicas por desarrollador
DB_USER=${USER}_dev
DB_PASSWORD=$(openssl rand -base64 32)
```

#### Documentación (.env.example):
```bash
# Usar placeholders descriptivos
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_seguro

# O valores de ejemplo genéricos
DB_USER=dbuser
DB_PASSWORD=change_me_in_production
```

#### Docker Compose:
```yaml
# Leer desde .env automáticamente
environment:
  MYSQL_USER: ${DB_USER}
  MYSQL_PASSWORD: ${DB_PASSWORD}
```

### 🎯 Tu configuración actual

Tu archivo `.env` contiene las credenciales reales y está correctamente en `.gitignore`. ✅

Para ver tus credenciales actuales:
```bash
# PowerShell
cat .env | Select-String "DB_"

# Bash
grep "DB_" .env
```

### 🔄 Cambiar credenciales del contenedor

```bash
# 1. Detener contenedor actual
docker stop gestor-torneos
docker rm gestor-torneos

# 2. Cargar variables de .env
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
  }
}

# 3. Crear contenedor con nuevas credenciales
docker run -d `
  --name gestor-torneos `
  --env-file .env `
  -e MYSQL_USER=$env:DB_USER `
  -e MYSQL_PASSWORD=$env:DB_PASSWORD `
  -e MYSQL_DATABASE=$env:DB_NAME `
  -e MYSQL_ROOT_PASSWORD=$env:DB_PASSWORD `
  -p 3307:3306 `
  -v gestor-torneos-data:/var/lib/mysql `
  percona/percona-server
```

## 📝 Notas

- **Puerto 3307 vs 3306**: El contenedor usa el puerto 3307 externamente para no colisionar con MySQL local si lo tuvieras instalado.
- **Credenciales**: Definidas en tu archivo `.env` (no commiteado)
- **Persistencia**: Usa volúmenes Docker para mantener los datos entre reinicios del contenedor
- **Seguridad**: Nunca commitees archivos con credenciales reales al repositorio
