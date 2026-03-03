import { Router } from 'express';
import {
  sanitizeparticipacionInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  traerparticipacionesporequipo,
  traerParticipacionesPorUsuarioEnTorneo,
  traerParticipacionesPorTorneo,
  traerParticipacionesTotalesPorTorneo,
  traerParticipacionesPorUsuario,
} from './participacion.controller.js';

export const participacionRouter = Router();

participacionRouter.get('/', findAll);
// Specific routes should come BEFORE dynamic parameter routes like "/:id"
participacionRouter.get(
  '/participacionesxequipo',
  traerparticipacionesporequipo,
);

participacionRouter.get(
  '/participacionesTotalesPorTorneo',
  traerParticipacionesTotalesPorTorneo,
);
participacionRouter.get(
  '/participacionesportorneo',
  traerParticipacionesPorTorneo,
);
participacionRouter.get(
  '/participacionesPorUsuarioEnTorneo',
  traerParticipacionesPorUsuarioEnTorneo,
);
participacionRouter.get(
  '/participacionesPorUsuario',
  traerParticipacionesPorUsuario,
);
participacionRouter.get('/:id', findOne);
participacionRouter.post('/', sanitizeparticipacionInput, add);
participacionRouter.put('/:id', sanitizeparticipacionInput, update);
participacionRouter.patch('/:id', sanitizeparticipacionInput, update);
participacionRouter.delete('/:id', remove);
// (kept above)
