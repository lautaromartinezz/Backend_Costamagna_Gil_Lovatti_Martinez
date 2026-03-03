import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const {
	createMock,
	flushMock,
	findOneOrFailMock,
	assignMock,
	getReferenceMock,
	removeAndFlushMock,
} = vi.hoisted(() => {
	return {
		createMock: vi.fn(),
		flushMock: vi.fn(),
		findOneOrFailMock: vi.fn(),
		assignMock: vi.fn(),
		getReferenceMock: vi.fn(),
		removeAndFlushMock: vi.fn(),
	};
});

vi.mock('../shared/db/orm.js', () => ({
	orm: {
		em: {
			create: createMock,
			flush: flushMock,
			findOneOrFail: findOneOrFailMock,
			assign: assignMock,
			getReference: getReferenceMock,
			removeAndFlush: removeAndFlushMock,
		},
	},
}));

import { Deporte } from '../deporte/deporte.entity.js';
import { add, update, remove } from '../deporte/deporte.controller.js';

function createResponseMock() {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	return { status, json };
}

describe('Deporte controller', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('crea un deporte y devuelve 201', async () => {
		const input = {
			nombre: 'Fútbol 5',
			cantMinJugadores: 5,
			cantMaxJugadores: 10,
			duracion: 50,
		};
		const deporteCreado = { id: 1, ...input };

		createMock.mockReturnValue(deporteCreado);
		flushMock.mockResolvedValue(undefined);

		const req = { body: { sanitizedInput: input } } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await add(req, res);

		expect(createMock).toHaveBeenCalledWith(Deporte, input);
		expect(flushMock).toHaveBeenCalledTimes(1);
		expect(resMock.status).toHaveBeenCalledWith(201);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'deporte created',
			data: deporteCreado,
		});
	});

	it('modifica un deporte y devuelve 200', async () => {
		const deporteExistente = {
			id: 7,
			nombre: 'Básquet',
			cantMinJugadores: 5,
			cantMaxJugadores: 12,
			duracion: 40,
		};
		const cambios = { duracion: 48 };

		findOneOrFailMock.mockResolvedValue(deporteExistente);
		assignMock.mockImplementation((target, patch) => Object.assign(target, patch));
		flushMock.mockResolvedValue(undefined);

		const req = {
			params: { id: '7' },
			body: { sanitizedInput: cambios },
		} as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await update(req, res);

		expect(findOneOrFailMock).toHaveBeenCalledWith(Deporte, { id: 7 });
		expect(assignMock).toHaveBeenCalledWith(deporteExistente, cambios);
		expect(flushMock).toHaveBeenCalledTimes(1);
		expect(resMock.status).toHaveBeenCalledWith(200);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'deporte updated',
			data: deporteExistente,
		});
	});

	it('elimina un deporte y devuelve 200', async () => {
		const referenciaDeporte = { id: 9 };

		getReferenceMock.mockReturnValue(referenciaDeporte);
		removeAndFlushMock.mockResolvedValue(undefined);

		const req = { params: { id: '9' } } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await remove(req, res);

		expect(getReferenceMock).toHaveBeenCalledWith(Deporte, 9);
		expect(removeAndFlushMock).toHaveBeenCalledWith(referenciaDeporte);
		expect(resMock.status).toHaveBeenCalledWith(200);
		expect(resMock.json).toHaveBeenCalledWith({ message: 'deporte deleted' });
	});
});
