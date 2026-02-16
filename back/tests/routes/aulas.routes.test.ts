import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import aulasRoutes from '../../routes/aulas.routes';

jest.mock('../../controllers/aulas.controller', () => ({
  listarAulas: jest.fn((req: Request, res: Response) =>
    res.status(200).json([])
  ),
  buscarAulaPorId: jest.fn((req: Request, res: Response) =>
    res.status(200).json({})
  ),
  criarAula: jest.fn((req: Request, res: Response) =>
    res.status(201).json({})
  ),
  atualizarAula: jest.fn((req: Request, res: Response) =>
    res.status(200).json({})
  ),
  deletarAula: jest.fn((req: Request, res: Response) =>
    res.status(200).json({})
  )
}));

jest.mock('../../middlewares/auth', () => ({
  auth: (req: Request, _res: Response, next: NextFunction) => {
    (req as any).user = { id: 'user123', role: 'ADMIN' };
    next();
  }
}));

jest.mock('../../middlewares/adminOnly', () => ({
  adminOnly: (_req: Request, _res: Response, next: NextFunction) => next()
}));

describe('aulas.routes', () => {
  const app = express();

  beforeAll(() => {
    app.use(express.json());
    app.use('/aulas', aulasRoutes);
  });

  test('GET /aulas deve listar aulas', async () => {
    await request(app)
      .get('/aulas')
      .expect(200);
  });

  test('GET /aulas/:id deve buscar aula por id', async () => {
    await request(app)
      .get('/aulas/123')
      .expect(200);
  });

  test('POST /aulas deve criar aula (rota protegida)', async () => {
    await request(app)
      .post('/aulas')
      .send({ titulo: 'Aula' })
      .expect(201);
  });

  test('PUT /aulas/:id deve atualizar aula', async () => {
    await request(app)
      .put('/aulas/123')
      .send({ titulo: 'Novo' })
      .expect(200);
  });

  test('DELETE /aulas/:id deve deletar aula', async () => {
    await request(app)
      .delete('/aulas/123')
      .expect(200);
  });
});