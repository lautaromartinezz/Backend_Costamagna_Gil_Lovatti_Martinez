import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import { config, validateConfig } from './shared/config.js';
import { deporteRouter } from './deporte/deporte.routes.js';
import { establecimientoRouter } from './establecimiento/establecimiento.routes.js';
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { noticiaRouter } from './noticia/noticia.routes.js';
import { eventoRouter } from './evento/evento.routes.js';
import { partidoRouter } from './evento/partido.routers.js';
import { equipoRouter } from './equipo/equipo.routes.js';
import { usuarioRouter } from './usuario/usuario.routes.js';
import { participacionRouter } from './participacion/participacion.routes.js';
import { localidadRouter } from './localidad/localidad.routes.js';
import { adminRouter } from './admin/admin.routes.js';
import { invitacionRouter } from './invitacion/invitacion.routes.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

const normalizeOrigin = (value: string) => value.replace(/\/+$/, '');
const allowedOrigins = new Set([
  normalizeOrigin(config.FRONTEND_URL),
  'http://localhost:5173',
  'https://gestor-torneos.up.railway.app',
]);

console.log('🔧 CORS orígenes permitidos:', [...allowedOrigins].join(', '));

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.use(corsMiddleware);
app.options('*', corsMiddleware);

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});
app.use('/api/deportes', deporteRouter);

app.use('/api/establecimientos', establecimientoRouter);

app.use('/api/noticias', noticiaRouter);

app.use('/api/eventos', eventoRouter);

app.use('/api/partidos', partidoRouter);

app.use('/api/equipos', equipoRouter);

app.use('/api/usuarios', usuarioRouter);

app.use('/api/participaciones', participacionRouter);

app.use('/api/localidades', localidadRouter);

app.use('/api/admin', adminRouter);

app.use('/api/invitaciones', invitacionRouter);

app.use((_, res) => {
  res.status(404).send({ message: 'Resource not found' });
});

// Validar configuración antes de iniciar
validateConfig();

await syncSchema();

app.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}/`);
  console.log(`Environment: ${config.NODE_ENV}`);
});
