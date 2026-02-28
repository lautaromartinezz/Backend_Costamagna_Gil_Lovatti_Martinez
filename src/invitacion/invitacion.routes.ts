import { Router } from 'express';
import {
  sendInvitation,
  acceptInvitation,
  getInvitationDetails,
} from './invitacion.controller.js';
import { authMiddleware } from '../shared/authMiddleware.js';

export const invitacionRouter = Router();

// Send an invitation email (requires authentication, only captain can send)
invitacionRouter.post('/enviar', authMiddleware, sendInvitation);

// Accept an invitation (requires authentication)
invitacionRouter.post('/aceptar', authMiddleware, acceptInvitation);

// Get invitation details by token (public endpoint to preview invitation)
invitacionRouter.get('/:token', getInvitationDetails);
