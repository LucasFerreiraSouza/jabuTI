import request from 'supertest';
import app from '../app';

describe('Usuarios routes', () => {
  let token: string;
  let userId: string;

  it('should create user', async () => {
    const response = await request(app)
      .post('/api/usuarios') // <-- ajuste aqui
      .send({
        nome: 'Usuário Teste',
        email: 'teste@teste.com',
        senha: '123456'
      });

    expect(response.status).toBe(201);
    userId = response.body._id;
  });

  it('should login user', async () => {
    const response = await request(app)
      .post('/api/usuarios/login') // <-- ajuste aqui
      .send({
        email: 'teste@teste.com',
        senha: '123456'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    token = response.body.token;
  });

  it('should get user by id', async () => {
    const response = await request(app)
      .get(`/api/usuarios/${userId}`) // <-- ajuste aqui
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'teste@teste.com');
  });

  it('should update user', async () => {
    const response = await request(app)
      .put(`/api/usuarios/${userId}`) // <-- ajuste aqui
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Nome Atualizado'
      });

    expect(response.status).toBe(200);
    expect(response.body.nome).toBe('Nome Atualizado');
  });

  it('should delete user', async () => {
    const response = await request(app)
      .delete(`/api/usuarios/${userId}`) // <-- ajuste aqui
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('mensagem');
  });
});
