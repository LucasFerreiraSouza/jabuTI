import express from 'express';
import request from 'supertest';
import aulasRoutes from '../../routes/aulas.routes';

jest.mock('../../controllers/aulas.controller', () => ({
  listarAulas: jest.fn((req, res) => res.status(200).json([])),
  buscarAulaPorId: jest.fn((req, res) => res.status(200).json({})),
  criarAula: jest.fn((req, res) => res.status(201).json({})),
  atualizarAula: jest.fn((req, res) => res.status(200).json({})),
  deletarAula: jest.fn((req, res) => res.status(200).json({}))
}));

jest.mock('../../middlewares/auth', () => ({
  auth: (req: any, _res: any, next: any) => {
    req.userId = 'user123';
    next();
  }
}));

describe('aulas.routes', () => {
  const app = express();

  beforeAll(() => {
    app.use(express.json());
    app.use('/aulas', aulasRoutes);
  });

  test('GET /aulas deve listar aulas', async () => {
    await request(app).get('/aulas').expect(200);
  });

  test('GET /aulas/:id deve buscar aula por id', async () => {
    await request(app).get('/aulas/123').expect(200);
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
