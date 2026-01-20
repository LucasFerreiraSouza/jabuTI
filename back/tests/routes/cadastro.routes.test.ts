import request from 'supertest';
import express from 'express';

import cadastroRoutes from '../../routes/cadastro.routes';

jest.mock('../../controllers/cadastro.controller', () => ({
  registrarUsuario: jest.fn((req, res) => res.status(200).json({ ok: true })),
  ativarSenha: jest.fn((req, res) => res.status(200).json({ ok: true })),
  solicitarResetSenha: jest.fn((req, res) => res.status(200).json({ ok: true })),
  resetarSenha: jest.fn((req, res) => res.status(200).json({ ok: true })),
  solicitarResetEmail: jest.fn((req, res) => res.status(200).json({ ok: true })),
  resetarEmail: jest.fn((req, res) => res.status(200).json({ ok: true }))
}));

describe('cadastro.routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/cadastro', cadastroRoutes);

  test('POST /cadastro/registrar', async () => {
    const res = await request(app)
      .post('/cadastro/registrar')
      .send({ nome: 'Lucas', email: 'test@test.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('POST /cadastro/ativar-senha/:token', async () => {
    const res = await request(app)
      .post('/cadastro/ativar-senha/token123')
      .send({ senha: 'Senha@123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('POST /cadastro/solicitar-reset-senha', async () => {
    const res = await request(app)
      .post('/cadastro/solicitar-reset-senha')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('POST /cadastro/resetar-senha', async () => {
    const res = await request(app)
      .post('/cadastro/resetar-senha')
      .send({ token: 'token123', senha: 'Senha@123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('POST /cadastro/solicitar-reset-email', async () => {
    const res = await request(app)
      .post('/cadastro/solicitar-reset-email')
      .send({ email: 'test@test.com', novoEmail: 'novo@test.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('POST /cadastro/resetar-email', async () => {
    const res = await request(app)
      .post('/cadastro/resetar-email')
      .send({ token: 'token123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
