# 🔒 Guía de Seguridad de Credenciales

## ⚠️ Problema Común: Credenciales Expuestas en Documentación

Una vulnerabilidad frecuente en proyectos es **documentar credenciales reales**, incluso en desarrollo. Este documento explica por qué es importante evitarlo y cómo hacerlo correctamente.

## 🎯 ¿Por qué NO poner credenciales en documentación?

### 1. **Hábito de Seguridad**
```diff
- # Mal: Documentar credenciales reales
- DB_USER=dsw
- DB_PASSWORD=dsw

+ # Bien: Usar placeholders descriptivos
+ DB_USER=tu_usuario_mysql
+ DB_PASSWORD=tu_password_seguro
```

Si te acostumbras a documentar credenciales "porque es solo desarrollo", eventualmente lo harás con credenciales de producción.

### 2. **Repositorios Públicos**
```bash
# Scenario: Subes tu proyecto a GitHub público
git add .
git commit -m "Initial commit"
git push origin main

# Ahora TODO EL MUNDO puede ver:
# - Usuario: dsw
# - Contraseña: dsw
# - Puerto: 3307
```

**Resultado**: Bots de GitHub escanean automáticamente buscando credenciales expuestas.

### 3. **Historial de Git**
Incluso si corriges las credenciales después, **quedan en el historial**:

```bash
# Ver credenciales en commits antiguos
git log --all -p | grep -i "password"

# Alguien malicioso puede hacer:
git checkout <commit_antiguo>
cat .env.example  # ¡Credenciales expuestas!
```

Para limpiar el historial:
```bash
# Eliminar archivos sensibles del historial (PELIGROSO)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### 4. **Reutilización de Credenciales**
Algunos desarrolladores (mal hábito) usan las mismas credenciales en:
- Desarrollo local
- Staging
- **Producción** ⚠️

Si documentas "dsw/dsw" y alguien lo replica en producción = vulnerabilidad crítica.

### 5. **Fuga de Información**
Las credenciales documentadas revelan:
- Estructura de tu base de datos
- Convenciones de nomenclatura
- Patrones de usuario/contraseña
- Nombres de servicios internos

## ✅ Mejores Prácticas

### Para .env.example (archivo commiteado)

#### ❌ MAL
```env
# .env.example
DB_USER=dsw
DB_PASSWORD=dsw
JWT_SECRET=mi_clave_secreta_123
RESEND_API_KEY=re_AbCdEfGh123456
```

#### ✅ BIEN
```env
# .env.example
# Base de datos
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_seguro

# JWT (generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=generar_clave_aleatoria_128_caracteres

# Resend (obtener en: https://resend.com/api-keys)
RESEND_API_KEY=re_TuApiKeyAqui
```

#### ✅ MEJOR (con instrucciones)
```env
# .env.example

# ==============================================
# BASE DE DATOS
# ==============================================
# Para desarrollo local con Docker:
#   DB_USER puede ser cualquier nombre de usuario
#   DB_PASSWORD debe ser segura (mínimo 12 caracteres)
# 
# IMPORTANTE: Estas credenciales deben coincidir con
# las variables MYSQL_USER y MYSQL_PASSWORD al crear
# el contenedor Docker (ver DOCKER_DATABASE.md)
DB_USER=usuario_para_desarrollo
DB_PASSWORD=password_minimo_12_caracteres

# Ejemplo válido:
# DB_USER=dev_user
# DB_PASSWORD=Dev2024!SecurePass
```

### Para Documentación (README, guías)

#### ❌ MAL
```markdown
## Conectar a la base de datos
```bash
mysql -u dsw -pdsw -h localhost -P 3307 gestortorneos
```
```

#### ✅ BIEN
```markdown
## Conectar a la base de datos
```bash
# Usar las credenciales de tu archivo .env
mysql -u ${DB_USER} -p${DB_PASSWORD} -h ${DB_HOST} -P ${DB_PORT} ${DB_NAME}
```
```

#### ✅ MEJOR
```markdown
## Conectar a la base de datos

Primero, carga tus variables de entorno:
```bash
# PowerShell
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
  }
}

# Bash
export $(grep -v '^#' .env | xargs)
```

Luego conéctate:
```bash
mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -P $DB_PORT $DB_NAME
```
```

### Para Comandos Docker

#### ❌ MAL
```bash
docker run -d \
  -e MYSQL_USER=dsw \
  -e MYSQL_PASSWORD=dsw \
  percona/percona-server
```

#### ✅ BIEN
```bash
docker run -d \
  -e MYSQL_USER=${DB_USER} \
  -e MYSQL_PASSWORD=${DB_PASSWORD} \
  percona/percona-server
```

#### ✅ MEJOR (docker-compose)
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: percona/percona-server
    environment:
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    env_file:
      - .env  # Lee automáticamente del .env
```

## 🔍 Auditar tu Proyecto

### 1. Buscar credenciales hardcodeadas

```bash
# Buscar passwords en el código
git grep -i "password\s*=\s*['\"]" -- '*.ts' '*.js' '*.md'

# Buscar usuarios específicos
git grep -E "dsw|root|admin" -- '*.md' '*.example'

# Buscar API keys
git grep -E "api[_-]?key\s*=\s*['\"]" -- '*.ts' '*.js'
```

### 2. Verificar .gitignore

```bash
# Ver si .env está ignorado
cat .gitignore | grep "\.env"

# Debería incluir:
# .env
# .env.local
# .env.*.local
```

### 3. Verificar archivos commiteados

```bash
# Listar todos los archivos en el repositorio
git ls-files

# Ver si .env está trackeado (NO debería)
git ls-files | grep "\.env$"

# Si aparece, eliminarlo del tracking:
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## 📋 Checklist de Seguridad

Para cada proyecto:

- [ ] `.env` está en `.gitignore`
- [ ] `.env.example` usa placeholders, no credenciales reales
- [ ] Documentación (README, MD) usa variables `${VAR}` en lugar de valores hardcodeados
- [ ] Credenciales de desarrollo son diferentes a producción
- [ ] Credenciales de producción solo están en el servidor (nunca commiteadas)
- [ ] Docker Compose usa `env_file: .env` o variables `${VAR}`
- [ ] No hay API keys en el código fuente
- [ ] Scripts usan variables de entorno, no credenciales directas

## 🛡️ Niveles de Seguridad

### Nivel 1: Básico ✅
```env
# .env (no commiteado)
DB_PASSWORD=mypassword123

# .env.example (commiteado)
DB_PASSWORD=tu_password_aqui
```

### Nivel 2: Intermedio ✅✅
```env
# .env (no commiteado)
DB_PASSWORD=$(openssl rand -base64 24)

# .env.example (commiteado)
DB_PASSWORD=tu_password_seguro_minimo_12_caracteres
# Generar: openssl rand -base64 24
```

### Nivel 3: Avanzado ✅✅✅
```bash
# Usar gestores de secretos
# AWS Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id dev/db/password \
  --query SecretString \
  --output text)

# Azure Key Vault
DB_PASSWORD=$(az keyvault secret show \
  --vault-name my-vault \
  --name db-password \
  --query value -o tsv)
```

## 🚨 ¿Qué hacer si expusiste credenciales?

### Paso 1: Cambiar las credenciales INMEDIATAMENTE
```bash
# Cambiar password de MySQL
docker exec -it gestor-torneos mysql -u root -p
mysql> ALTER USER 'dsw'@'%' IDENTIFIED BY 'nueva_password_segura_2024';
mysql> FLUSH PRIVILEGES;
```

### Paso 2: Actualizar .env
```env
DB_PASSWORD=nueva_password_segura_2024
```

### Paso 3: Limpiar historial de Git
```bash
# Opción 1: BFG Repo Cleaner (recomendado)
bfg --replace-text passwords.txt

# Opción 2: git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch archivo_con_credenciales.md" \
  HEAD

# Force push (CUIDADO: coordinar con el equipo)
git push origin --force --all
```

### Paso 4: Revocar API keys expuestas
- **Resend**: https://resend.com/api-keys → Delete key → Create new
- **Google Maps**: https://console.cloud.google.com/ → Credentials → Delete → Create new
- **JWT_SECRET**: Generar nueva clave (todos los usuarios deben re-logearse)

### Paso 5: Notificar al equipo
```markdown
🚨 ALERTA DE SEGURIDAD

Se expusieron credenciales en el commit abc1234.

Acciones tomadas:
- ✅ Credenciales cambiadas
- ✅ API keys revocadas y regeneradas
- ✅ Historial de Git limpiado

Acción requerida para el equipo:
- Hacer pull de los cambios
- Actualizar archivo .env local con nuevas credenciales
- Verificar que no tienen copias de las credenciales antiguas
```

## 📚 Recursos Adicionales

- [OWASP: Hardcoded Passwords](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [GitHub: Token scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [GitGuardian: Secrets detection](https://www.gitguardian.com/)
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevenir commits con secretos

## 🎓 Resumen

> **Regla de Oro**: Si no pondrías la información en un billboard en la calle, no la pongas en documentación commiteada.

**Recuerda**:
- ✅ `.env` → credenciales reales (no commiteado)
- ✅ `.env.example` → placeholders (commiteado)
- ✅ Documentación → variables `${VAR}` (commiteado)
- ✅ Código → `process.env.VAR` (commiteado)
- ❌ Nunca hardcodear credenciales en archivos commiteados

La seguridad es un hábito, no un evento único. 🔐
