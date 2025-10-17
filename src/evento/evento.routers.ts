import { Router } from 'express';
import {
  sanitizeEventoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './evento.controller.js';
import { authMiddleware } from '../shared/authMiddleware.js';

export const eventoRouter = Router();

eventoRouter.get('/', findAll);

eventoRouter.get('/:id', findOne);
eventoRouter.post('/', authMiddleware, sanitizeEventoInput, add);
eventoRouter.put('/:id', authMiddleware, sanitizeEventoInput, update);
eventoRouter.patch('/:id', authMiddleware, sanitizeEventoInput, update);
eventoRouter.delete('/:id', authMiddleware, remove);
