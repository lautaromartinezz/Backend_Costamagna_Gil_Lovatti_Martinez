import { Router } from 'express';
import {
  sanitizeparticipacionInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './participacion.controller.js';

export const participacionRouter = Router();

participacionRouter.get('/', findAll);

participacionRouter.get('/:id', findOne);
participacionRouter.post('/', sanitizeparticipacionInput, add);
participacionRouter.put('/:id', sanitizeparticipacionInput, update);
participacionRouter.patch('/:id', sanitizeparticipacionInput, update);
participacionRouter.delete('/:id', remove);
