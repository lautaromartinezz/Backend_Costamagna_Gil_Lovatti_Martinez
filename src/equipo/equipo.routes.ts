import { Router } from 'express';
import {
  sanitizeEquipoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  postAddMember,
  deleteSelfFromMembers,
} from './equipo.controller.js';
import { authMiddleware } from '../shared/authMiddleware.js';

export const equipoRouter = Router();

equipoRouter.get('/', findAll);

equipoRouter.get('/:id', findOne);
equipoRouter.post('/', sanitizeEquipoInput, add);
equipoRouter.put('/:id', sanitizeEquipoInput, update);
equipoRouter.patch('/:id', sanitizeEquipoInput, update);
equipoRouter.post('/:id/miembros', postAddMember);
equipoRouter.patch('/:id/miembros', authMiddleware, (req, res) => {
  deleteSelfFromMembers(req, res);
});
equipoRouter.delete('/:id', remove);
