import request from 'supertest';
import Usuario from '../models/usuarios.model';
import app from '../app';

describe('Cadastro Routes', () => {

  afterEach(async () => {
    await Usuario.deleteMany({});
  });

  it('POST /api/cadastro/registrar - should register user', async () => {
    const res = await request(app)
      .post('/api/cadastro/registrar')
      .send({
        nome: 'Lucas',
        email: 'lucas@test.com',
        captchaToken: 'token123'
      });

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe(
      'Cadastro realizado. Aguarde aprovação do administrador.'
    );

    const usuario = await Usuario.findOne({ email: 'lucas@test.com' });

    expect(usuario).toBeDefined();
    expect(usuario?.status).toBe('PENDENTE');

    // ✅ Ajuste aqui:
    expect(usuario?.senha).toBeUndefined();
  });
});
