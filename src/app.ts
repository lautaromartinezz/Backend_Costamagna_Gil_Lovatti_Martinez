import 'reflect-metadata';
import express from 'express';
import { deporteRouter } from './deporte/deporte.routes.js';
import { establecimientoRouter } from './establecimiento/establecimiento.routes.js';
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { noticiaRouter } from './noticia/noticia.routes.js';
import { eventoRouter } from './evento/evento.routers.js';
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});
app.use('/api/deportes', deporteRouter);

app.use('/api/establecimientos', establecimientoRouter);

app.use('/api/noticias', noticiaRouter);

app.use('/api/eventos', eventoRouter);

app.use((_, res) => {
  res.status(404).send({ message: 'Resource not found' });
});

await syncSchema();

app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/');
});
