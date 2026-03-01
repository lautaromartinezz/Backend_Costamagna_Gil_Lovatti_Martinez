# 🔐 Guía de JWT_SECRET: Seguridad y Mejores Prácticas

## ¿Qué es JWT_SECRET?

`JWT_SECRET` es la **clave criptográfica** que tu backend usa para:
1. **Firmar** tokens JWT cuando un usuario inicia sesión
2. **Verificar** que los tokens no han sido manipulados

### Flujo de Autenticación JWT

```
┌─────────────┐                    ┌─────────────┐
│   Cliente   │                    │   Servidor  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. POST /login                  │
       │  { email, password }             │
       ├─────────────────────────────────>│
       │                                  │
       │                         2. Verifica credenciales
       │                         3. Crea token con JWT_SECRET
       │                            jwt.sign(payload, JWT_SECRET)
       │                                  │
       │  4. Token JWT                    │
       │<─────────────────────────────────┤
       │                                  │
       │  5. GET /api/protegida           │
       │  Authorization: Bearer {token}   │
       ├─────────────────────────────────>│
       │                                  │
       │                         6. Verifica token
       │                            jwt.verify(token, JWT_SECRET)
       │                         7. Extrae datos del payload
       │                                  │
       │  8. Respuesta con datos          │
       │<─────────────────────────────────┤
```

## 🎯 ¿Cómo funciona la firma JWT?

### Token JWT tiene 3 partes:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJyb2xlIjoiYWRtaW4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└─────────────── HEADER ────────────┘└──────────── PAYLOAD ──────────┘└────────── SIGNATURE ───────────┘
```

1. **Header**: Algoritmo de encriptación (HS256)
2. **Payload**: Datos del usuario (id, role, email, etc.)
3. **Signature**: `HMACSHA256(header + payload, JWT_SECRET)`

### 🔐 La firma es la clave:
```javascript
// Crear token (servidor)
const token = jwt.sign(
  { id: 123, role: 'admin' },  // Payload
  JWT_SECRET                     // ← Clave secreta
);

// Verificar token (servidor)
const decoded = jwt.verify(token, JWT_SECRET);  // ← Misma clave
console.log(decoded.id);  // 123
```

**Si alguien modifica el payload, la firma no coincidirá y el token será inválido.**

## ⚡ ¿Por qué claves diferentes para dev/prod?

### 🧪 **Desarrollo** (local)
```env
JWT_SECRET=ec93f6a9a3755c52f7851bb8245cd7b96c6e6bcdaedac008ff5a9c2e8cc3672a
```

**Características:**
- ✅ Compartida entre el equipo de desarrollo
- ✅ Incluida en `.env.example` (sin valor real)
- ✅ Puede regenerarse sin problema
- ⚠️ Los tokens de dev NO funcionan en producción

**Ventajas:**
- Fácil configuración para nuevos desarrolladores
- No afecta a usuarios reales si se filtra
- Separación clara entre entornos

### 🚀 **Producción** (servidor real)
```env
JWT_SECRET=<clave_ultra_secreta_nunca_compartida_88_caracteres_mínimo>
```

**Características:**
- 🔒 **Única y diferente** a la de desarrollo
- 🔒 Solo conocida por el servidor de producción
- 🔒 Almacenada en variables de entorno del hosting
- 🔒 NUNCA commiteada al repositorio
- 🔒 Rotada cada 3-6 meses

**Consecuencias si se filtra:**
- ❌ Atacante puede crear tokens para cualquier usuario
- ❌ Puede hacerse pasar por administradores
- ❌ Acceso total a la aplicación
- ❌ Debe regenerarse INMEDIATAMENTE

## 🛡️ Mejores Prácticas

### ✅ HACER

#### 1. **Generar claves fuertes**
```bash
# Node.js (64 bytes = 128 caracteres hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -base64 64

# PowerShell
-join (1..88 | ForEach-Object { [char](Get-Random -Min 33 -Max 126) })
```

#### 2. **Diferentes claves por entorno**
```
Desarrollo:  ec93f6a9a3755c52...
Staging:     7b4f2e8c1a9d6e3f...
Producción:  a3f7c2e9d4b8f1a6...
```

#### 3. **Variables de entorno en hosting**
```bash
# Vercel
vercel env add JWT_SECRET

# Heroku
heroku config:set JWT_SECRET="tu_clave_aqui"

# Railway
# Settings → Variables → JWT_SECRET

# Render
# Environment → Environment Variables
```

#### 4. **Rotar regularmente en producción**
```javascript
// Configurar 2 secretos: actual y anterior
const JWT_SECRET_CURRENT = process.env.JWT_SECRET_CURRENT;
const JWT_SECRET_PREVIOUS = process.env.JWT_SECRET_PREVIOUS;

// Intentar verificar con ambos durante la rotación
try {
  return jwt.verify(token, JWT_SECRET_CURRENT);
} catch {
  return jwt.verify(token, JWT_SECRET_PREVIOUS);
}
```

#### 5. **Expiración apropiada**
```env
# Desarrollo: tokens largos (24h)
JWT_EXPIRES_IN=24h

# Producción: tokens cortos (1-2h)
JWT_EXPIRES_IN=1h

# Refresh tokens: más largos (7d)
JWT_REFRESH_EXPIRES_IN=7d
```

### ❌ NO HACER

- ❌ Usar claves débiles: `"secret"`, `"123456"`, `"miapp"`
- ❌ Commitear `.env` con JWT_SECRET al repositorio
- ❌ Usar la misma clave en desarrollo y producción
- ❌ Compartir la clave de producción por email/Slack/WhatsApp
- ❌ Hardcodear la clave en el código fuente
- ❌ Reutilizar JWT_SECRET entre proyectos
- ❌ No rotar las claves nunca

## 🚨 ¿Qué hacer si se filtra JWT_SECRET?

### Pasos inmediatos:

1. **Generar nueva clave**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Actualizar en el servidor**
   ```bash
   # Ejemplo en Vercel
   vercel env rm JWT_SECRET production
   vercel env add JWT_SECRET production
   ```

3. **Redeploy la aplicación**
   ```bash
   git push  # O redeploy manual en tu hosting
   ```

4. **Invalidar todos los tokens**
   - Todos los usuarios deberán hacer login nuevamente
   - Es el precio de la seguridad

5. **Investigar el breach**
   - ¿Cómo se filtró?
   - ¿Fue commiteada a Git?
   - ¿Fue compartida por error?
   - Corregir el proceso para evitar repetición

## 📊 Ejemplo de tu proyecto

### Desarrollo (tu máquina local)
```env
# .env
JWT_SECRET=ec93f6a9a3755c52f7851bb8245cd7b96c6e6bcdaedac008ff5a9c2e8cc3672a5a69da6b92ddd8e10c17a83dc319f6095b21a1943a47957eb7414bbe0955eb25
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Producción (servidor)
```env
# Variables de entorno del servidor (NO commitear)
JWT_SECRET=<clave_completamente_diferente_y_ultra_secreta>
JWT_EXPIRES_IN=2h
NODE_ENV=production
```

## 🔍 Verificar tu configuración

```bash
# Compilar y verificar
npm run build
node check-config.js
```

Deberías ver:
```
✅ Configuración validada correctamente
✓ JWT expira en: 24h
```

## 📚 Recursos Adicionales

- [JWT.io](https://jwt.io/) - Debugger de tokens JWT
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - Especificación oficial JWT

## ❓ Preguntas Frecuentes

### ¿Por qué 64 bytes?
- Mayor entropía = más seguridad
- Protección contra ataques de fuerza bruta
- Estándar de la industria para HMAC-SHA256

### ¿Token expira = más seguro?
- Sí, limita el tiempo de compromiso
- Pero puede molestar a usuarios (deben re-autenticarse)
- Balance: 1-2h con refresh tokens de 7d

### ¿Puedo usar la misma clave en varios proyectos?
- **NO**. Cada proyecto debe tener su propia clave
- Si un proyecto se compromete, todos están en riesgo

### ¿Debo rotar JWT_SECRET regularmente?
- En producción: **Sí**, cada 3-6 meses
- En desarrollo: No es crítico
- Después de un breach: **Inmediatamente**

---

**Recuerda**: JWT_SECRET es como la llave de tu casa. No la compartes, no la pierdes, y cambias la cerradura si sospechas que alguien tiene una copia. 🔑
