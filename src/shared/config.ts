/**
 * Archivo centralizado de configuración de variables de entorno
 * Evita duplicación y facilita el mantenimiento
 */

export const config = {
  // Servidor
  PORT: parseInt(process.env.PORT || '3000', 10),

  // Base de datos
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    NAME: process.env.DB_NAME || 'nombre_base_datos',
    USER: process.env.DB_USER || 'usuario_db',
    PASSWORD: process.env.DB_PASSWORD || 'password_db',
  },

  // Autenticación
  JWT: {
    SECRET: process.env.JWT_SECRET || 'clave_secreta_para_dev',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Email (Resend)
  EMAIL: {
    API_KEY: process.env.RESEND_API_KEY,
    FROM: process.env.EMAIL_FROM || 'noreply@tudominio.com',
  },

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Entorno
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Métodos helper
  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  },

  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },
};

/**
 * Validar que las variables críticas están configuradas
 * Llamar esta función al inicio de la aplicación
 */
export function validateConfig(): void {
  const missingVars: string[] = [];

  // Variables críticas
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    missingVars.push('JWT_SECRET');
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY no configurada - emails deshabilitados');
  }

  if (!process.env.DB_NAME) {
    missingVars.push('DB_NAME');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Variables de entorno faltantes: ${missingVars.join(', ')}\n` +
      `Por favor, configura estas variables en tu archivo .env`
    );
  }

  // Información útil en desarrollo
  if (config.isDevelopment()) {
    console.log(`📦 Base de datos: ${config.DB.USER}@${config.DB.HOST}:${config.DB.PORT}/${config.DB.NAME}`);
  }

  console.log('✅ Configuración validada correctamente');
}
