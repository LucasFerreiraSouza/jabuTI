import request from 'supertest';
import app from '../app';

describe('Aulas routes', () => {
  let token: string;
  let aulaId: string;
  let userId: string;

  it('should create user and login', async () => {
    // cria user
    const userRes = await request(app)
      .post('/api/usuarios') // <-- ajuste aqui
      .send({
        nome: 'Usuário Aula',
        email: 'aula@teste.com',
        senha: '123456'
      });

    userId = userRes.body._id;

    // login
    const loginRes = await request(app)
      .post('/api/usuarios/login') // <-- ajuste aqui
      .send({
        email: 'aula@teste.com',
        senha: '123456'
      });

    token = loginRes.body.token;
  });

  it('should create aula', async () => {
    const response = await request(app)
      .post('/api/aulas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Aula Teste',
        descricao: 'Descrição da aula',
        texto: 'Texto explicativo',
        video: 'http://video.com',
        codigo: 'console.log("teste")',
        exercicio: 'Faça X',
        imagem: 'http://imagem.com',
        publicada: true
      });

    expect(response.status).toBe(201);
    aulaId = response.body._id;
  });


  it('should list aulas', async () => {
    const response = await request(app)
      .get('/api/aulas'); // <-- ajuste aqui

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get aula by id', async () => {
    const response = await request(app)
      .get(`/api/aulas/${aulaId}`); // <-- ajuste aqui

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('titulo', 'Aula Teste');
  });

  it('should update aula', async () => {
    const response = await request(app)
      .put(`/api/aulas/${aulaId}`) // <-- ajuste aqui
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Aula Atualizada'
      });

    expect(response.status).toBe(200);
    expect(response.body.titulo).toBe('Aula Atualizada');
  });

  it('should delete aula', async () => {
    const response = await request(app)
      .delete(`/api/aulas/${aulaId}`) // <-- ajuste aqui
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('mensagem');
  });
});
