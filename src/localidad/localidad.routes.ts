import { Router } from 'express';
import {
  sanitizeLocalidadInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './localidad.controller.js';
import { authMiddleware, requireAdmin } from '../shared/authMiddleware.js';

export const localidadRouter = Router();

localidadRouter.get('/', findAll);

localidadRouter.get('/:id', findOne);
localidadRouter.post('/', authMiddleware, requireAdmin ,sanitizeLocalidadInput, add);
localidadRouter.put('/:id', authMiddleware, requireAdmin, sanitizeLocalidadInput, update);
localidadRouter.patch('/:id', authMiddleware, requireAdmin, sanitizeLocalidadInput, update);
localidadRouter.delete('/:id', authMiddleware, requireAdmin, remove);
