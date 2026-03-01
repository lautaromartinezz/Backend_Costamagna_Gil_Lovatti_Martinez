#!/usr/bin/env node

/**
 * Script para validar la configuración de variables de entorno
 * Ejecutar con: node check-config.js
 */

import 'dotenv/config';
import { config, validateConfig } from './dist/shared/config.js';

console.log('\n🔍 Validando configuración del Backend...\n');

try {
  validateConfig();

  console.log('📋 Configuración Actual:');
  console.log('─'.repeat(50));
  console.log(`✓ Puerto: ${config.PORT}`);
  console.log(`✓ Entorno: ${config.NODE_ENV}`);
  console.log(`✓ URL Frontend: ${config.FRONTEND_URL}`);
  console.log(`✓ BD Host: ${config.DB.HOST}:${config.DB.PORT}/${config.DB.NAME}`);
  console.log(`✓ JWT expira en: ${config.JWT.EXPIRES_IN}`);
  console.log(`✓ Email remitente: ${config.EMAIL.FROM}`);
  
  if (config.EMAIL.API_KEY) {
    console.log(`✓ Resend API configurada: ${config.EMAIL.API_KEY.substring(0, 5)}...`);
  } else {
    console.log(`⚠ Resend API NO configurada (emails deshabilitados)`);
  }

  console.log('─'.repeat(50));
  console.log('\n✅ Todas las configuraciones son válidas!\n');

} catch (error) {
  console.error('\n❌ Error en la configuración:');
  console.error(error.message);
  console.log('\n📝 Asegúrate de que tu archivo .env tiene:');
  console.log('   - PORT (opcional, por defecto 3000)');
  console.log('   - DB_HOST, DB_NAME, DB_USER, DB_PASSWORD');
  console.log('   - JWT_SECRET (crítico en producción)');
  console.log('   - RESEND_API_KEY (para enviar emails)');
  console.log('   - FRONTEND_URL (importante para CORS)\n');
  process.exit(1);
}
