import request from 'supertest';
import express from 'express';

import adminRoutes from '../../routes/admin.routes';

jest.mock('../../controllers/admin.controller', () => ({
  listarUsuarios: jest.fn((req, res) => res.status(200).json({ ok: true })),
  buscarUsuarioPorId: jest.fn((req, res) => res.status(200).json({ ok: true })),
  criarUsuario: jest.fn((req, res) => res.status(201).json({ ok: true })),
  atualizarUsuario: jest.fn((req, res) => res.status(200).json({ ok: true })),
  deletarUsuario: jest.fn((req, res) => res.status(200).json({ ok: true })),
  aprovarUsuario: jest.fn((req, res) => res.status(200).json({ ok: true })),
  reprovarUsuario: jest.fn((req, res) => res.status(200).json({ ok: true })),
  promoverAdmin: jest.fn((req, res) => res.status(200).json({ ok: true })),
  despromoverAdmin: jest.fn((req, res) => res.status(200).json({ ok: true }))
}));

jest.mock('../../middlewares/auth', () => ({
  auth: (_req: any, _res: any, next: any) => next()
}));

jest.mock('../../middlewares/adminOnly', () => ({
  adminOnly: (_req: any, _res: any, next: any) => next()
}));

jest.mock('../../middlewares/rateLimit', () => ({
  emailLimiter: (_req: any, _res: any, next: any) => next()
}));

describe('admin.routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/admin', adminRoutes);

  test('GET /admin', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(200);
  });

  test('GET /admin/:id', async () => {
    const res = await request(app).get('/admin/123');
    expect(res.status).toBe(200);
  });

  test('POST /admin', async () => {
    const res = await request(app).post('/admin').send({});
    expect(res.status).toBe(201);
  });

  test('PUT /admin/:id', async () => {
    const res = await request(app).put('/admin/123').send({});
    expect(res.status).toBe(200);
  });

  test('DELETE /admin/:id', async () => {
    const res = await request(app).delete('/admin/123');
    expect(res.status).toBe(200);
  });

  test('PATCH /admin/:id/aprovar', async () => {
    const res = await request(app).patch('/admin/123/aprovar');
    expect(res.status).toBe(200);
  });

  test('PATCH /admin/:id/reprovar', async () => {
    const res = await request(app).patch('/admin/123/reprovar');
    expect(res.status).toBe(200);
  });

  test('PATCH /admin/:id/promover-admin', async () => {
    const res = await request(app).patch('/admin/123/promover-admin');
    expect(res.status).toBe(200);
  });

  test('PATCH /admin/:id/despromover-admin', async () => {
    const res = await request(app).patch('/admin/123/despromover-admin');
    expect(res.status).toBe(200);
  });
});
