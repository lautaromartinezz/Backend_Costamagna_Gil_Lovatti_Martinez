# 🏆 Backend - Gestor de Torneos
**Sistema de gestión de torneos deportivos** | Trabajo Práctico DSW - UTN FRRO

> 📖 **¿Primera vez con el proyecto?** Esta guía está diseñada para que puedas configurar y ejecutar el backend aunque no tengas experiencia previa. Sigue cada paso en orden y funcionará.

---

## 📋 Tabla de Contenidos

- [Pre-requisitos](#-pre-requisitos)
- [Instalación Completa](#-instalación-completa-paso-a-paso)
- [Uso Diario](#-uso-diario)
- [Tests](#-tests)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Troubleshooting](#-problemas-comunes-troubleshooting)
- [Documentación Completa](#-documentación-completa)
- [Glosario](#-glosario-para-principiantes)

---

## 🔧 Pre-requisitos

**Necesitas instalar estas herramientas ANTES de continuar:**

### 1. Node.js (versión 18 o superior)
- **¿Qué es?** Entorno para ejecutar JavaScript en el servidor
- **Descargar:** https://nodejs.org/
- **Verificar instalación:**
  ```bash
  node --version
  # Debe mostrar algo como: v20.x.x
  ```

### 2. pnpm (gestor de paquetes)
- **¿Qué es?** Herramienta para instalar dependencias del proyecto
- **Instalar:**
  ```bash
  npm install -g pnpm
  ```
- **Verificar instalación:**
  ```bash
  pnpm --version
  # Debe mostrar algo como: 10.x.x
  ```

### 3. Docker Desktop
- **¿Qué es?** Herramienta para ejecutar la base de datos en un contenedor
- **Descargar:** https://www.docker.com/products/docker-desktop/
- **Verificar instalación:**
  ```bash
  docker --version
  # Debe mostrar algo como: Docker version 24.x.x
  ```
  
  **Importante:** Abre Docker Desktop y déjalo corriendo en segundo plano.

### 4. Git (para clonar el repositorio)
- **¿Qué es?** Sistema de control de versiones
- **Descargar:** https://git-scm.com/
- **Verificar instalación:**
  ```bash
  git --version
  # Debe mostrar algo como: git version 2.x.x
  ```

### 5. Editor de Código (recomendado)
- **Visual Studio Code:** https://code.visualstudio.com/
- O cualquier editor de texto que te guste

---

## 📥 Instalación Completa (Paso a Paso)

### **PASO 1: Obtener el Código**

#### Opción A: Si tienes acceso al repositorio Git
```bash
# 1. Navegar a la carpeta donde quieres el proyecto
cd C:\Proyectos  # Cambia la ruta según prefieras

# 2. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# 3. Entrar a la carpeta del backend
cd Backend_Costamagna_Gil_Lovatti_Martinez
```

#### Opción B: Si tienes el código en un ZIP
```bash
# 1. Descomprime el archivo ZIP
# 2. Abre una terminal en la carpeta del backend
cd ruta\a\Backend_Costamagna_Gil_Lovatti_Martinez
```

---

### **PASO 2: Configurar la Base de Datos (Docker)**

#### 2.1 - Verificar que Docker está corriendo
```bash
docker ps
```
**✅ Éxito:** Si ves una tabla (aunque esté vacía), Docker funciona.  
**❌ Error:** Si dice "error connecting", abre Docker Desktop primero.

#### 2.2 - Crear el contenedor de base de datos

**Si YA tienes el contenedor "gestor-torneos":** (puedes verificar con `docker ps -a`)
```bash
docker start gestor-torneos
```

**Si es la PRIMERA VEZ (no tienes el contenedor):**
```bash
# Crear nuevo contenedor
docker run -d `
  --name gestor-torneos `
  -e MYSQL_DATABASE=gestortorneos `
  -e MYSQL_USER=tu_usuario `
  -e MYSQL_PASSWORD=tu_password `
  -e MYSQL_ROOT_PASSWORD=tu_password `
  -p 3307:3306 `
  -v gestor-torneos-data:/var/lib/mysql `
  percona/percona-server
```

**⚠️ Importante:** Recuerda el usuario y contraseña que pongas aquí, los necesitarás en el siguiente paso.

#### 2.3 - Verificar que la base de datos está corriendo
```bash
docker ps
```
**Debes ver algo como:**
```
NAMES            IMAGE                    PORTS
gestor-torneos   percona/percona-server   0.0.0.0:3307->3306/tcp
```

📚 **Más detalles:** Ver [docs/DOCKER_DATABASE.md](docs/DOCKER_DATABASE.md)

---

### **PASO 3: Configurar Variables de Entorno**

#### 3.1 - Crear archivo .env
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

#### 3.2 - Editar el archivo .env
Abre el archivo `.env` con tu editor favorito (Notepad, VSCode, etc.)

**Configuración MÍNIMA necesaria:**

```env
# Puerto del servidor (puedes dejarlo así)
PORT=3000

# Base de datos (DEBE coincidir con lo que pusiste en Docker)
DB_HOST=localhost
DB_PORT=3307
DB_NAME=gestortorneos
DB_USER=tu_usuario          # ← Cambia esto
DB_PASSWORD=tu_password      # ← Cambia esto

# JWT Secret (generar uno único)
JWT_SECRET=pega_aqui_la_clave_que_generes

# Email (opcional por ahora, ver más abajo)
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=tu_app_password_de_16_caracteres
EMAIL_FROM=noreply@tudominio.com
# RESEND_API_KEY=re_...   # Legacy opcional

# Frontend (puedes dejarlo así)
FRONTEND_URL=http://localhost:5173

# Entorno
NODE_ENV=development
```

#### 3.3 - Generar JWT_SECRET

**Abre una nueva terminal y ejecuta:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Esto genera algo como:**
```
abc123def456789...  (128 caracteres)
```

**Copia ese texto y pégalo** en `JWT_SECRET=` en tu archivo `.env`

#### 3.4 - (Opcional) Configurar Email

Si quieres que el sistema envíe emails de invitación:
1. Usa una cuenta de Gmail para envío SMTP
2. Habilita verificación en 2 pasos en Google
3. Genera una contraseña de aplicación en https://myaccount.google.com/apppasswords
4. Pega los valores en `GMAIL_USER=` y `GMAIL_APP_PASSWORD=` en tu `.env`
5. (Opcional) Usa `RESEND_API_KEY` solo por compatibilidad legacy

**Si no configuras esto ahora, el sistema funcionará pero no enviará emails.**

📚 **Más detalles:** Ver [docs/CONFIGURACION_ENV.md](docs/CONFIGURACION_ENV.md)

---

### **PASO 4: Instalar Dependencias**

```bash
pnpm install
```

**⏱️ Esto puede tomar 2-5 minutos la primera vez.**

**✅ Éxito:** Verás muchas líneas de texto y al final algo como "Done in XXs"

**❌ Error "pnpm: command not found":**
```bash
# Instalar pnpm primero
npm install -g pnpm
```

---

### **PASO 5: Compilar el Proyecto**

```bash
pnpm run build
```

**✅ Éxito:** Si no hay errores rojos, está listo.

**❌ Si hay errores:**  
Lee el mensaje de error, usualmente indica un problema en el archivo `.env`

---

### **PASO 6: Validar Configuración** (Opcional pero Recomendado)

```bash
node check-config.js
```

**Debes ver algo como:**
```
🔍 Validando configuración del Backend...

📦 Base de datos: usuario@localhost:3307/gestortorneos
✅ Configuración validada correctamente
────────────────────────────────────────────────
✓ Puerto: 3000
✓ Entorno: development
✓ URL Frontend: http://localhost:5173
✓ BD Host: localhost:3307/gestortorneos
...
✅ Todas las configuraciones son válidas!
```

**❌ Si hay errores:** El script te dirá qué variable falta o está mal configurada.

---

### **PASO 7: ¡Iniciar el Servidor! 🚀**

```bash
pnpm run start:dev
```

**✅ Éxito - Debes ver:**
```
🚀 Server running on http://localhost:3000/
Environment: development
📦 Base de datos: usuario@localhost:3307/gestortorneos
✅ Configuración validada correctamente
```

**¡El servidor está funcionando!** 🎉

**Para probarlo:** Abre tu navegador y ve a http://localhost:3000

---

## 🔄 Uso Diario

### Iniciar el servidor (cada vez que trabajes)

```bash
# 1. Asegúrate de que Docker Desktop está abierto

# 2. Inicia la base de datos (si no está corriendo)
docker start gestor-torneos

# 3. Navega a la carpeta del proyecto
cd ruta\a\Backend_Costamagna_Gil_Lovatti_Martinez

# 4. Inicia el servidor
pnpm run start:dev
```

### Detener el servidor

**En la terminal donde corre el servidor:**
- **Windows/Linux:** Presiona `Ctrl + C`
- **Mac:** Presiona `Cmd + C`

### Ver logs del servidor

El servidor mostrará en tiempo real toda la actividad:
- Peticiones HTTP recibidas
- Consultas a la base de datos
- Errores (si los hay)

---

## 🧪 Tests

### Ejecutar tests de backend

```bash
# Ejecuta tests en modo interactivo (watch)
pnpm test

# Ejecuta tests una sola vez (ideal para CI)
pnpm run test:run

# Interfaz visual de Vitest
pnpm run test:ui
```

---

## 📁 Estructura del Proyecto

```
Backend_Costamagna_Gil_Lovatti_Martinez/
├── src/
│   ├── app.ts                    # Punto de entrada del servidor
│   ├── shared/
│   │   ├── config.ts             # Configuración centralizada
│   │   └── db/
│   │       └── orm.ts            # Conexión a base de datos
│   ├── deporte/                  # Módulo de deportes
│   ├── equipo/                   # Módulo de equipos
│   ├── usuario/                  # Módulo de usuarios
│   ├── evento/                   # Módulo de eventos/torneos
│   └── ...                       # Otros módulos
├── docs/                         # Documentación técnica
│   ├── CONFIGURACION_ENV.md
│   ├── DOCKER_DATABASE.md
│   ├── JWT_SECURITY.md
│   └── SECURITY_CREDENTIALS.md
├── dist/                         # Código compilado (generado)
├── node_modules/                 # Dependencias (generado)
├── .env                          # TU configuración (NO commitear)
├── .env.example                  # Plantilla de configuración
├── package.json                  # Dependencias del proyecto
├── tsconfig.json                 # Configuración TypeScript
└── README.md                     # Este archivo
```

---

## 🆘 Problemas Comunes (Troubleshooting)

### ❌ "Cannot connect to database"

**Problema:** El servidor no puede conectarse a la base de datos.

**Soluciones:**
1. **Verifica que Docker está corriendo:**
   ```bash
   docker ps
   ```
   Debes ver el contenedor `gestor-torneos`

2. **Inicia el contenedor si está detenido:**
   ```bash
   docker start gestor-torneos
   ```

3. **Verifica las credenciales en .env:**
   - `DB_USER` y `DB_PASSWORD` deben coincidir con lo que configuraste en Docker
   - Revisa que no haya espacios extra

4. **Verifica el puerto:**
   ```bash
   netstat -ano | findstr :3307
   ```
   Debe mostrar que algo está escuchando en 3307

---

### ❌ "Port 3000 is already in use"

**Problema:** Otro programa está usando el puerto 3000.

**Solución 1:** Cambiar el puerto en tu `.env`:
```env
PORT=3001  # O cualquier otro puerto libre
```

**Solución 2:** Encontrar y cerrar el programa que usa el puerto:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <número_del_PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

---

### ❌ "pnpm: command not found"

**Problema:** pnpm no está instalado.

**Solución:**
```bash
npm install -g pnpm
```

---

### ❌ "Docker daemon is not running"

**Problema:** Docker Desktop no está abierto.

**Solución:**
1. Abre Docker Desktop
2. Espera a que el ícono en la barra de tareas deje de parpadear
3. Intenta nuevamente

---

### ❌ Errores de compilación TypeScript

**Problema:** Errores al ejecutar `pnpm run build`

**Solución:**
1. Borra las carpetas generadas:
   ```bash
   # Windows
   Remove-Item -Recurse -Force node_modules, dist
   
   # Linux/Mac
   rm -rf node_modules dist
   ```

2. Reinstala dependencias:
   ```bash
   pnpm install
   ```

3. Compila nuevamente:
   ```bash
   pnpm run build
   ```

---

### ❌ "JWT_SECRET is not defined"

**Problema:** Falta configurar JWT_SECRET en .env

**Solución:**
1. Genera una clave:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Copia el resultado

3. Pégalo en tu `.env`:
   ```env
   JWT_SECRET=el_texto_que_copiaste
   ```

---

## 📚 Documentación Completa

### Guías Detalladas

- **[docs/CONFIGURACION_ENV.md](docs/CONFIGURACION_ENV.md)** - Todo sobre variables de entorno
  - Cómo generar claves seguras
  - Diferencia entre desarrollo y producción
  - Variables opcionales vs obligatorias

- **[docs/JWT_SECURITY.md](docs/JWT_SECURITY.md)** - Entender JWT y seguridad
  - Qué es JWT y cómo funciona
  - Por qué es importante JWT_SECRET
  - Demo interactivo

- **[docs/DOCKER_DATABASE.md](docs/DOCKER_DATABASE.md)** - Gestión de base de datos
  - Comandos útiles de Docker
  - Cómo hacer backup
  - Cómo restaurar datos
  - Recrear el contenedor

- **[docs/SECURITY_CREDENTIALS.md](docs/SECURITY_CREDENTIALS.md)** - Seguridad de credenciales
  - Por qué no documentar credenciales
  - Mejores prácticas
  - Qué hacer si expusiste credenciales

### Scripts Útiles

```bash
# Validar configuración
node check-config.js

# Ejecutar tests una vez
pnpm run test:run

# Auditar seguridad de credenciales
node check-credentials.js

# Demo de cómo funciona JWT
node dist/ejemplos/jwt-demo.js
```

---

## 📖 Glosario para Principiantes

**Backend:** La parte del servidor que maneja la lógica y datos.

**API:** Interfaz que permite al frontend comunicarse con el backend.

**Base de datos:** Donde se guardan todos los datos (usuarios, torneos, equipos, etc.)

**Docker:** Tecnología para ejecutar aplicaciones en contenedores aislados.

**Contenedor:** Como una "caja" donde corre una aplicación (en este caso, MySQL).

**Variables de entorno (.env):** Archivo con configuración sensible (contraseñas, claves).

**JWT (JSON Web Token):** Sistema de autenticación usado para login de usuarios.

**TypeScript:** Lenguaje de programación (JavaScript con tipos).

**pnpm:** Gestor de paquetes, instala las dependencias del proyecto.

**Puerto:** Número que identifica un servicio (ej: 3000, 3307).

**localhost:** Tu propia computadora (dirección: 127.0.0.1).

**Compilar:** Convertir código TypeScript a JavaScript que Node.js puede ejecutar.

---

## 🤝 ¿Necesitas Ayuda?

### Antes de pedir ayuda:

1. ✅ Lee el mensaje de error completo
2. ✅ Busca el error en la sección [Troubleshooting](#-problemas-comunes-troubleshooting)
3. ✅ Verifica que seguiste todos los pasos en orden
4. ✅ Ejecuta `node check-config.js` para ver si hay errores de configuración

### Al pedir ayuda, incluye:

- ❓ Qué estabas intentando hacer
- ❌ El mensaje de error completo (captura de pantalla o texto)
- 💻 Tu sistema operativo (Windows/Mac/Linux)
- 📋 Resultado de `node check-config.js`
- 🐋 Resultado de `docker ps`

---

## ✅ Checklist de Instalación Exitosa

Marca cada paso a medida que lo completes:

- [ ] Node.js instalado (`node --version`)
- [ ] pnpm instalado (`pnpm --version`)
- [ ] Docker instalado y corriendo (`docker ps`)
- [ ] Contenedor de base de datos creado y corriendo
- [ ] Archivo `.env` creado y configurado
- [ ] JWT_SECRET generado y configurado
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Proyecto compilado (`pnpm run build`)
- [ ] Validación exitosa (`node check-config.js`)
- [ ] Servidor iniciado (`pnpm run start:dev`)
- [ ] Servidor accesible en http://localhost:3000

**¡Si todos los pasos están marcados, tu backend está listo! 🎉**

---

## 📝 Notas de Desarrollo

### Variables de Entorno Importantes

| Variable | Descripción | ¿Obligatoria? |
|----------|-------------|---------------|
| `PORT` | Puerto del servidor | ❌ (default: 3000) |
| `DB_HOST` | Host de la base de datos | ✅ |
| `DB_PORT` | Puerto de la base de datos | ✅ |
| `DB_NAME` | Nombre de la base de datos | ✅ |
| `DB_USER` | Usuario de MySQL | ✅ |
| `DB_PASSWORD` | Contraseña de MySQL | ✅ |
| `JWT_SECRET` | Clave para firmar tokens | ✅ |
| `JWT_EXPIRES_IN` | Tiempo de expiración de tokens | ❌ (default: 24h) |
| `GMAIL_USER` | Cuenta Gmail usada como emisor SMTP | ❌ (emails deshabilitados sin esto) |
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación Gmail (16 chars) | ❌ (emails deshabilitados sin esto) |
| `RESEND_API_KEY` | API key legacy (compatibilidad) | ❌ |
| `EMAIL_FROM` | Email remitente | ❌ |
| `FRONTEND_URL` | URL del frontend para CORS | ✅ |
| `NODE_ENV` | Entorno (development/production) | ❌ (default: development) |

### Endpoints Principales

Una vez que el servidor esté corriendo, estos endpoints estarán disponibles:

- `GET /api/deportes` - Listar deportes
- `GET /api/equipos` - Listar equipos
- `GET /api/usuarios` - Listar usuarios
- `GET /api/eventos` - Listar torneos/eventos
- `POST /api/usuarios/login` - Login de usuario
- ... (ver archivos `.http` en cada módulo para más)

### Modo Desarrollo vs Producción

**En Desarrollo (actual):**
- Hot reload (cambios se aplican automáticamente)
- Logs detallados
- Credenciales pueden ser simples
- JWT_SECRET puede ser de desarrollo

**En Producción:**
- Compilar con `pnpm run build`
- Ejecutar con `node dist/app.js`
- Credenciales MUY seguras
- JWT_SECRET diferente y ultra seguro
- Variables en el servidor de hosting, NO en .env commiteado

---

**Hecho con ❤️ por Costamagna, Gil, Lovatti, Martinez**

