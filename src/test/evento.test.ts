import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const { findMock, findOneOrFailMock } = vi.hoisted(() => {
	return {
		findMock: vi.fn(),
		findOneOrFailMock: vi.fn(),
	};
});

vi.mock('../shared/db/orm.js', () => ({
	orm: {
		em: {
			find: findMock,
			findOneOrFail: findOneOrFailMock,
		},
	},
}));

import { Evento } from '../evento/evento.entity.js';
import { findAll, findOne } from '../evento/evento.controller.js';

function createResponseMock() {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	return { status, json };
}

describe('Evento controller', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('devuelve 200 y todos los eventos en findAll', async () => {
		const eventos = [{ id: 1, nombre: 'Copa Apertura' }];
		findMock.mockResolvedValue(eventos);

		const req = {} as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await findAll(req, res);

		expect(findMock).toHaveBeenCalledTimes(1);
		expect(resMock.status).toHaveBeenCalledWith(200);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'Eventos retrieved successfully',
			data: eventos,
		});
	});

	it('devuelve 200 y el evento cuando findOne lo encuentra', async () => {
		const evento = { id: 7, nombre: 'Torneo Relámpago' };
		findOneOrFailMock.mockResolvedValue(evento);

		const req = { params: { id: '7' } } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await findOne(req, res);

		expect(findOneOrFailMock).toHaveBeenCalledWith(
			Evento,
			{ id: 7 },
			expect.any(Object),
		);
		expect(resMock.status).toHaveBeenCalledWith(200);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'found evento',
			data: evento,
		});
	});

	it('devuelve 404 cuando findOne no encuentra el evento', async () => {
		findOneOrFailMock.mockRejectedValue(
			new Error('No Evento entity found for query'),
		);

		const req = { params: { id: '9999' } } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await findOne(req, res);

		expect(resMock.status).toHaveBeenCalledWith(404);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'Evento no encontrado',
		});
	});
});
