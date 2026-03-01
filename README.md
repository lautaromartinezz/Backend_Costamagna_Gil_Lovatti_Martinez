# Backend_Costamagna_Gil_Lovatti_Martinez
Repositorio para el back del trabajo practico de dsw

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno
```bash
# Copiar plantilla
Copy-Item .env.example .env  # Windows
cp .env.example .env         # Linux/Mac

# Editar .env con tus valores
```

Ver [CONFIGURACION_ENV.md](CONFIGURACION_ENV.md) para detalles completos.

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Iniciar servidor en desarrollo
```bash
pnpm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

### 4. (Opcional) Validar configuración
```bash
pnpm run build
node check-config.js
```

## 📁 Estructura

- `src/shared/config.ts` - Configuración centralizada (variables de entorno)
- `src/app.ts` - Punto de entrada
- Módulos por recurso (deportes, equipos, usuarios, etc.)

## 📝 Variables de Entorno Requeridas

Ver [.env.example](.env.example) para la lista completa. Las más críticas:
- `JWT_SECRET` - Clave para firmar tokens
- `DB_*` - Credenciales de base de datos
- `RESEND_API_KEY` - Para enviar emails
- `FRONTEND_URL` - URL del frontend (para CORS)

