import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Usuario from '../../models/usuarios.model';
import Aula from '../../models/aulas.model';
import { emailService } from '../../utils/emailService';
import { validarSenhaForte } from '../../utils/senha';

import {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  aprovarUsuario,
  reprovarUsuario,
  promoverAdmin,
  despromoverAdmin
} from '../../controllers/admin.controller';

jest.mock('../../models/usuarios.model');
jest.mock('../../models/aulas.model');
jest.mock('../../utils/emailService');
jest.mock('../../utils/senha');
jest.mock('bcrypt');

describe('admin.controller', () => {
  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // listarUsuarios
  // =========================
  test('deve listar usuários', async () => {
    (Usuario.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });

    await listarUsuarios(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 500 em caso de erro ao listar usuários', async () => {
    (Usuario.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await listarUsuarios(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // buscarUsuarioPorId
  // =========================
  test('deve retornar 404 se usuário não existir', async () => {
    req.params.id = '123';

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await buscarUsuarioPorId(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve retornar usuário por id', async () => {
    req.params.id = '123';

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: '123' })
    });

    await buscarUsuarioPorId(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 400 se id inválido', async () => {
    req.params.id = 'invalid';

    (Usuario.findById as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await buscarUsuarioPorId(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // criarUsuario
  // =========================
  test('deve retornar 400 se campos obrigatórios não enviados', async () => {
    req.body = { nome: 'Lucas' };

    await criarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deve retornar 400 se senha fraca', async () => {
    req.body = {
      nome: 'Lucas',
      email: 'test@test.com',
      senha: 'fraca'
    };

    (validarSenhaForte as jest.Mock).mockReturnValue(false);

    await criarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deve retornar 409 se email já existir', async () => {
    req.body = {
      nome: 'Lucas',
      email: 'test@test.com',
      senha: 'Senha@123'
    };

    (validarSenhaForte as jest.Mock).mockReturnValue(true);
    (Usuario.findOne as jest.Mock).mockResolvedValue({});

    await criarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('deve criar usuário com sucesso', async () => {
    req.body = {
      nome: 'Lucas',
      email: 'test@test.com',
      senha: 'Senha@123'
    };

    (validarSenhaForte as jest.Mock).mockReturnValue(true);
    (Usuario.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    (Usuario.create as jest.Mock).mockResolvedValue({
      _id: '123',
      nome: 'Lucas',
      email: 'test@test.com',
      role: 'ESTUDANTE',
      status: 'APROVADO'
    });

    await criarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('deve retornar 500 se ocorrer erro ao criar usuário', async () => {
    req.body = {
      nome: 'Lucas',
      email: 'test@test.com',
      senha: 'Senha@123'
    };

    (validarSenhaForte as jest.Mock).mockReturnValue(true);
    (Usuario.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    (Usuario.create as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await criarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // atualizarUsuario
  // =========================
  test('deve retornar 404 se usuário não existir ao atualizar', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await atualizarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve atualizar usuário', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    await atualizarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 400 se ocorrer erro ao atualizar usuário', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await atualizarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // deletarUsuario
  // =========================
  test('deve retornar 404 se usuário não existir ao deletar', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await deletarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve deletar usuário e aulas', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndDelete as jest.Mock).mockResolvedValue({});
    (Aula.deleteMany as jest.Mock).mockResolvedValue({});

    await deletarUsuario(req, res as Response);

    expect(Aula.deleteMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 500 se ocorrer erro ao deletar usuário', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndDelete as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await deletarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // aprovarUsuario
  // =========================
  test('deve retornar 404 se usuário não existir ao aprovar', async () => {
    req.params.id = '123';

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await aprovarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve retornar 400 se usuário já estiver aprovado', async () => {
    req.params.id = '123';

    const usuarioMock: any = {
      status: 'APROVADO',
      email: 'test@test.com',
      nome: 'Lucas'
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await aprovarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deve retornar 400 se usuário já possui token válido', async () => {
    req.params.id = '123';

    const usuarioMock: any = {
      status: 'PENDENTE',
      email: 'test@test.com',
      nome: 'Lucas',
      tokenAtivacaoSenha: 'token',
      tokenAtivacaoExpira: new Date(Date.now() + 10000)
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await aprovarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deve aprovar usuário e enviar email', async () => {
    req.params.id = '123';

    const usuarioMock: any = {
      status: 'PENDENTE',
      email: 'test@test.com',
      nome: 'Lucas',
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    jest.spyOn(crypto, 'randomBytes').mockReturnValue(
      Buffer.from('token') as any
    );

    await aprovarUsuario(req, res as Response);

    expect(emailService.enviarAtivacaoSenha).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 500 se ocorrer erro ao aprovar usuário', async () => {
    req.params.id = '123';

    (Usuario.findById as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await aprovarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // reprovarUsuario
  // =========================
  test('deve retornar 404 se usuário não existir ao reprovar', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await reprovarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve reprovar usuário', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      email: 'test@test.com',
      nome: 'Lucas'
    });

    await reprovarUsuario(req, res as Response);

    expect(emailService.reprovado).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 400 se ocorrer erro ao reprovar usuário', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await reprovarUsuario(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // promover / despromover admin
  // =========================
  test('deve retornar 404 se usuário não existir ao promover', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await promoverAdmin(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve promover usuário a admin', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      email: 'test@test.com',
      nome: 'Lucas'
    });

    await promoverAdmin(req, res as Response);

    expect(emailService.promovidoAdmin).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 400 se ocorrer erro ao promover usuário', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await promoverAdmin(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deve retornar 404 se usuário não existir ao despromover', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    await despromoverAdmin(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve despromover admin', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      email: 'test@test.com',
      nome: 'Lucas'
    });

    await despromoverAdmin(req, res as Response);

    expect(emailService.despromovidoAdmin).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 400 se ocorrer erro ao despromover usuário', async () => {
    req.params.id = '123';

    (Usuario.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await despromoverAdmin(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
