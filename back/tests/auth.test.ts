import request from 'supertest';
import app from '../app';

jest.setTimeout(30000);

describe('Auth routes', () => {

  it('should register user', async () => {
    const response = await request(app)
      .post('/api/usuarios')
      .send({
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456'
      });

    expect(response.status).toBe(201);
  });

  it('should login user', async () => {
    // ⚠️ precisa criar o usuário de novo aqui
    await request(app)
      .post('/api/usuarios')
      .send({
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456'
      });

    const response = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: 'teste@teste.com',
        senha: '123456'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
