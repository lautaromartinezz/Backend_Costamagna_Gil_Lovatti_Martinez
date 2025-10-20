import { Router } from 'express';
import {
  sanitizeEventoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  buscarxcodigo,
  findSome,
  findXCreator,
  findXParticipant,
} from './evento.controller.js';
import { authMiddleware } from '../shared/authMiddleware.js';

export const eventoRouter = Router();

eventoRouter.get('/', findAll);
eventoRouter.get('/filter', findSome);
eventoRouter.get('/:id', findOne);
eventoRouter.get('/creador/:idCreador', findXCreator);
eventoRouter.get('/participacion/:idUsuario', findXParticipant);
eventoRouter.post('/', authMiddleware, sanitizeEventoInput, add);
eventoRouter.put('/:id', authMiddleware, sanitizeEventoInput, update);
eventoRouter.patch('/:id', authMiddleware, sanitizeEventoInput, update);
eventoRouter.delete('/:id', authMiddleware, remove);
eventoRouter.get('/codigo/:codigo', buscarxcodigo);
