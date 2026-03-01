# 🔐 Guía de Configuración de Variables de Entorno

## 📋 Configuración Inicial

### 1. Crear tu archivo `.env`

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Linux/Mac
cp .env.example .env
```

### 2. Completar las Variables Requeridas

Edita el archivo `.env` con tus valores reales:

#### **JWT_SECRET** (CRÍTICO)
Esta es la clave para firmar tus tokens de autenticación. NUNCA uses la clave por defecto en producción.

**Generar una clave segura:**
```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -base64 64

# Opción 3: PowerShell
-join (1..64 | ForEach-Object { '{0:X2}' -f (Get-Random -Max 256) })
```

#### **RESEND_API_KEY**
1. Regístrate en [Resend](https://resend.com)
2. Ve a [API Keys](https://resend.com/api-keys)
3. Crea una nueva API key
4. Copia la key que empieza con `re_`

#### **Base de Datos**
Configura según tu instalación local de MySQL/MariaDB.

## 🚀 Diferentes Entornos

### Desarrollo Local
```env
NODE_ENV=development
JWT_SECRET=clave_local_desarrollo
FRONTEND_URL=http://localhost:5173
```

### Producción
```env
NODE_ENV=production
JWT_SECRET=clave_super_segura_generada_aleatoriamente_64_caracteres_minimo
FRONTEND_URL=https://tudominio.com
```

## ✅ Mejores Prácticas

### ✔️ HACER:
- ✅ Mantener `.env` en el `.gitignore` (ya configurado)
- ✅ Usar `.env.example` para documentar variables necesarias
- ✅ Generar claves secretas fuertes y aleatorias
- ✅ Usar diferentes valores entre desarrollo y producción
- ✅ Rotar las claves regularmente en producción
- ✅ Documentar cada variable en `.env.example`
- ✅ **NUEVO**: Usar el archivo `src/shared/config.ts` para acceder a las variables (centralizado)

### ❌ NO HACER:
- ❌ Commitear archivos `.env` al repositorio
- ❌ Compartir claves secretas por email o chat
- ❌ Usar contraseñas débiles o predecibles
- ❌ Reutilizar la misma `JWT_SECRET` en múltiples proyectos
- ❌ Hard-codear valores sensibles en el código
- ❌ Incluir claves reales en screenshots o documentación

## 🔒 Seguridad en Producción

### Servicios de Gestión de Secretos (Recomendado):
- **AWS**: AWS Secrets Manager, AWS Parameter Store
- **Azure**: Azure Key Vault
- **Google Cloud**: Secret Manager
- **Otros**: HashiCorp Vault, Doppler

### Variables de Entorno del Sistema:
```bash
# Linux/Mac
export JWT_SECRET="tu_clave_aqui"

# Windows (PowerShell)
$env:JWT_SECRET="tu_clave_aqui"

# Windows (CMD)
set JWT_SECRET=tu_clave_aqui
```

### En Servicios de Hosting:
- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Environment variables
- **Heroku**: Settings → Config Vars
- **Railway**: Variables tab
- **Render**: Environment → Environment Variables

## 📁 Uso de Configuración Centralizada

El backend ahora usa un sistema centralizado de configuración en `src/shared/config.ts`:

```typescript
import { config } from './shared/config.js';

// Acceder a cualquier variable:
config.PORT              // 3000
config.NODE_ENV          // development
config.JWT.SECRET        // tu clave secreta
config.EMAIL.API_KEY     // Resend API key
config.FRONTEND_URL      // http://localhost:5173

// Métodos helper:
if (config.isDevelopment()) { ... }
if (config.isProduction()) { ... }
```

### Ventajas:
- **Centralizado**: Una única fuente de verdad para todas las variables
- **Type-safe**: TypeScript valida los accesos
- **Validado**: La función `validateConfig()` verifica variables críticas
- **Sin duplicación**: No más variables hardcodeadas o duplicadas en varios archivos

### Validar la configuración:
```bash
# Después de compilar con: npm run build
node check-config.js
```

## 🧪 Verificar Configuración

Crea un script `check-env.js` para verificar que todas las variables están configuradas:

```javascript
import dotenv from 'dotenv';
dotenv.config();

const requiredVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'RESEND_API_KEY'
];

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Faltan las siguientes variables de entorno:');
  missing.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}

console.log('✅ Todas las variables de entorno están configuradas');
```

## 📝 Checklist de Configuración

- [ ] Copiar `.env.example` a `.env`
- [ ] Generar `JWT_SECRET` seguro
- [ ] Configurar credenciales de base de datos
- [ ] Obtener `RESEND_API_KEY`
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Probar que el servidor inicia correctamente
- [ ] Documentar variables adicionales en `.env.example`

## 🆘 Problemas Comunes

### "JWT_SECRET is not defined"
→ Asegúrate de que `dotenv/config` está importado al inicio de `app.ts`

### "Invalid API key"
→ Verifica que tu `RESEND_API_KEY` es válida y está activa

### "Cannot connect to database"
→ Revisa las credenciales de `DB_*` y que el servidor MySQL está corriendo

---

**Nota**: Si expones accidentalmente tus claves en Git, debes:
1. Revocar/regenerar las claves inmediatamente
2. Actualizar los servicios con las nuevas claves
3. Hacer commit de la corrección
