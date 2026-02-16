import request from 'supertest';
import express from 'express';

import analiticosRoutes from '../../routes/analiticos.routes';

jest.mock('../../controllers/analiticos.controller', () => ({
  dashboardExercicio: jest.fn((req, res) =>
    res.status(200).json({ ok: true })
  ),
  rankingExercicio: jest.fn((req, res) =>
    res.status(200).json({ ok: true })
  )
}));

jest.mock('../../middlewares/auth', () => ({
  auth: (_req: any, _res: any, next: any) => next()
}));

jest.mock('../../middlewares/adminOnly', () => ({
  adminOnly: (_req: any, _res: any, next: any) => next()
}));

describe('analiticos.routes', () => {
  const app = express();

  app.use(express.json());
  app.use('/analiticos', analiticosRoutes);

  test('GET /analiticos/exercicio/:aulaId/:conteudoId/:exercicioId/dashboard', async () => {
    const res = await request(app).get(
      '/analiticos/exercicio/1/2/3/dashboard'
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('GET /analiticos/exercicio/:aulaId/:conteudoId/:exercicioId/ranking', async () => {
    const res = await request(app).get(
      '/analiticos/exercicio/1/2/3/ranking'
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('GET /analiticos/exercicio/:aulaId/:conteudoId/:exercicioId/dashboard com query', async () => {
    const res = await request(app).get(
      '/analiticos/exercicio/1/2/3/dashboard?inicio=2026-02-01&fim=2026-02-02'
    );

    expect(res.status).toBe(200);
  });

  test('GET /analiticos/exercicio/:aulaId/:conteudoId/:exercicioId/ranking com query', async () => {
    const res = await request(app).get(
      '/analiticos/exercicio/1/2/3/ranking?inicio=2026-02-01&fim=2026-02-02'
    );

    expect(res.status).toBe(200);
  });
});