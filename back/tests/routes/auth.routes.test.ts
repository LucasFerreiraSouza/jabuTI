import request from 'supertest';
import express from 'express';

import authRoutes from '../../routes/auth.routes';

jest.mock('../../controllers/auth.controller', () => ({
  login: jest.fn((req, res) => res.status(200).json({ ok: true })),
  confirmarCodigo: jest.fn((req, res) => res.status(200).json({ ok: true })),
  logout: jest.fn((req, res) => res.status(200).json({ ok: true })),
  habilitar2FA: jest.fn((req, res) => res.status(200).json({ ok: true })),
  desabilitar2FA: jest.fn((req, res) => res.status(200).json({ ok: true }))
}));

jest.mock('../../middlewares/auth', () => ({
  auth: (_req: any, _res: any, next: any) => next()
}));

describe('auth.routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);

  test('POST /auth/login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', senha: '123' });

    expect(res.status).toBe(200);
  });

  test('POST /auth/confirmar-codigo', async () => {
    const res = await request(app)
      .post('/auth/confirmar-codigo')
      .send({ usuarioId: '123', codigo: '123456' });

    expect(res.status).toBe(200);
  });

  test('POST /auth/logout', async () => {
    const res = await request(app).post('/auth/logout');

    expect(res.status).toBe(200);
  });

  test('PATCH /auth/2fa/habilitar', async () => {
    const res = await request(app).patch('/auth/2fa/habilitar');

    expect(res.status).toBe(200);
  });

  test('PATCH /auth/2fa/desabilitar', async () => {
    const res = await request(app).patch('/auth/2fa/desabilitar');

    expect(res.status).toBe(200);
  });
});
