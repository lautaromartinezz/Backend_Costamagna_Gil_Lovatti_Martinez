#!/usr/bin/env node

/**
 * Script para detectar credenciales potencialmente expuestas en archivos commiteados
 * Ejecutar: node check-credentials.js
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Auditando credenciales en archivos commiteados...\n');

const issues = [];

// 1. Verificar que .env no está trackeado
console.log('1️⃣ Verificando .gitignore...');
try {
  const gitignore = readFileSync('.gitignore', 'utf-8');
  if (!gitignore.includes('.env')) {
    issues.push('⚠️  .env no está en .gitignore');
  } else {
    console.log('   ✅ .env está en .gitignore');
  }
} catch (error) {
  issues.push('⚠️  No se encontró archivo .gitignore');
}

// 2. Verificar que .env no está trackeado en Git
console.log('\n2️⃣ Verificando archivos trackeados...');
try {
  const trackedFiles = execSync('git ls-files', { encoding: 'utf-8' });
  if (trackedFiles.includes('.env\n') || trackedFiles.includes('.env ')) {
    issues.push('❌ CRÍTICO: Archivo .env está trackeado en Git');
  } else {
    console.log('   ✅ .env no está trackeado');
  }
} catch (error) {
  console.log('   ⚠️  No se pudo verificar (¿no es un repositorio Git?)');
}

// 3. Buscar patrones de credenciales en archivos commiteados
console.log('\n3️⃣ Buscando credenciales hardcodeadas...');
const patterns = [
  { pattern: /password\s*=\s*["'][^"']+["']/gi, name: 'Contraseñas hardcodeadas' },
  { pattern: /mysql:\/\/[^:]+:[^@]+@/gi, name: 'Connection strings MySQL' },
  { pattern: /mongodb:\/\/[^:]+:[^@]+@/gi, name: 'Connection strings MongoDB' },
  { pattern: /postgres:\/\/[^:]+:[^@]+@/gi, name: 'Connection strings PostgreSQL' },
  // Patrones más específicos para evitar falsos positivos
  { pattern: /DB_PASSWORD\s*=\s*["'](?!tu_|your_|change_|example_|placeholder|CHANGE_ME|\$\{)[^"']{3,}["']/gi, name: 'DB_PASSWORD con valor real' },
  { pattern: /JWT_SECRET\s*=\s*["'](?!generar_|your_|change_|example_|placeholder|\$\{)[^"']{8,}["']/gi, name: 'JWT_SECRET con valor real' },
];

const filesToCheck = ['.env.example', 'README.md', 'DOCKER_DATABASE.md', 'CONFIGURACION_ENV.md'];

for (const file of filesToCheck) {
  if (!existsSync(file)) continue;
  
  const content = readFileSync(file, 'utf-8');
  
  for (const { pattern, name } of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push(`⚠️  ${file}: Posible ${name} (${matches.length} coincidencias)`);
    }
  }
}

if (issues.length === 0) {
  console.log('   ✅ No se encontraron credenciales hardcodeadas');
} else {
  console.log('   ⚠️  Se encontraron posibles problemas');
}

// 4. Verificar que credenciales en .env son diferentes a .env.example
console.log('\n4️⃣ Comparando .env y .env.example...');
if (existsSync('.env') && existsSync('.env.example')) {
  try {
    const env = readFileSync('.env', 'utf-8');
    const envExample = readFileSync('.env.example', 'utf-8');
    
    // Extraer valores de DB_PASSWORD y JWT_SECRET
    const extractValue = (content, key) => {
      const match = content.match(new RegExp(`${key}\\s*=\\s*(.+)`, 'i'));
      return match ? match[1].trim() : null;
    };
    
    const dbPassEnv = extractValue(env, 'DB_PASSWORD');
    const dbPassExample = extractValue(envExample, 'DB_PASSWORD');
    const jwtEnv = extractValue(env, 'JWT_SECRET');
    const jwtExample = extractValue(envExample, 'JWT_SECRET');
    
    if (dbPassEnv === dbPassExample && !dbPassExample?.startsWith('tu_')) {
      issues.push('⚠️  DB_PASSWORD es idéntica en .env y .env.example');
    }
    
    if (jwtEnv === jwtExample && !jwtExample?.startsWith('generar_')) {
      issues.push('⚠️  JWT_SECRET es idéntica en .env y .env.example');
    }
    
    if (dbPassEnv !== dbPassExample && jwtEnv !== jwtExample) {
      console.log('   ✅ Credenciales son diferentes entre .env y .env.example');
    }
  } catch (error) {
    console.log('   ⚠️  No se pudo comparar archivos');
  }
} else {
  console.log('   ⚠️  Falta .env o .env.example');
}

// 5. Buscar en el historial de Git (commits recientes)
console.log('\n5️⃣ Buscando en historial reciente de Git...');
try {
  // Buscar en últimos 10 commits
  const history = execSync('git log --all -10 -p', { encoding: 'utf-8' });
  const sensitivePatterns = ['password', 'secret', 'api_key', 'apikey'];
  
  let foundInHistory = false;
  for (const pattern of sensitivePatterns) {
    if (history.toLowerCase().includes(pattern)) {
      // No reportar si es solo en comentarios o placeholders
      const lines = history.split('\n').filter(line => 
        line.toLowerCase().includes(pattern) && 
        line.includes('+') && 
        !line.includes('placeholder') &&
        !line.includes('tu_') &&
        !line.includes('your_')
      );
      if (lines.length > 0) {
        foundInHistory = true;
      }
    }
  }
  
  if (foundInHistory) {
    issues.push('⚠️  Se encontraron patrones sensibles en commits recientes');
    console.log('   ⚠️  Revisar historial manualmente con: git log -p | grep -i password');
  } else {
    console.log('   ✅ No se encontraron patrones obvios en historial reciente');
  }
} catch (error) {
  console.log('   ⚠️  No se pudo verificar historial');
}

// Resumen
console.log('\n' + '═'.repeat(70));
console.log('📊 RESUMEN DE AUDITORÍA');
console.log('═'.repeat(70));

if (issues.length === 0) {
  console.log('\n✅ ¡Excelente! No se encontraron problemas de seguridad.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Se encontraron los siguientes problemas:\n');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
  
  console.log('\n📝 Recomendaciones:');
  console.log('   - Revisa SECURITY_CREDENTIALS.md para mejores prácticas');
  console.log('   - Usa placeholders en .env.example (tu_, your_, change_me)');
  console.log('   - Asegúrate de que .env está en .gitignore');
  console.log('   - Si commiteaste credenciales, limpia el historial de Git');
  console.log('\n❌ Auditoría completada con advertencias\n');
  process.exit(1);
}
