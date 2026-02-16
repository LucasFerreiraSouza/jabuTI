import { Response } from 'express';
import crypto from 'crypto';

import Usuario from '../../models/usuarios.model';
import { Aula } from '../../models/aulas.model';
import SistemaConfig from '../../models/sistema.model';

import { emailService } from '../../utils/emailService';

import {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  aprovarUsuario,
  reprovarUsuario,
  promoverAdmin,
  despromoverAdmin,
  aprovacaoAutomatica
} from '../../controllers/admin.controller';

jest.mock('../../models/usuarios.model');
jest.mock('../../models/aulas.model');
jest.mock('../../models/sistema.model');
jest.mock('../../utils/emailService');

describe('admin.controller', () => {

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

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
  test('listarUsuarios - deve listar usuários', async () => {
    (Usuario.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
    await listarUsuarios(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('listarUsuarios - retorna 500 em caso de erro', async () => {
    (Usuario.find as jest.Mock).mockImplementation(() => { throw new Error(); });
    await listarUsuarios(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // buscarUsuarioPorId
  // =========================
  test('buscarUsuarioPorId - retorna 404 se não existir', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await buscarUsuarioPorId(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('buscarUsuarioPorId - retorna usuário existente', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: '123' }) });
    await buscarUsuarioPorId(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('buscarUsuarioPorId - retorna 400 se id inválido', async () => {
    req.params.id = 'invalid';
    (Usuario.findById as jest.Mock).mockImplementation(() => { throw new Error(); });
    await buscarUsuarioPorId(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // criarUsuario
  // =========================
  test('criarUsuario - retorna 400 se nome ou email ausentes', async () => {
    req.body = { nome: 'Lucas' };
    await criarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('criarUsuario - retorna 409 se email já existir', async () => {
    req.body = { nome: 'Lucas', email: 'test@test.com' };
    (Usuario.findOne as jest.Mock).mockResolvedValue({});
    await criarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('criarUsuario - cria usuário como pendente', async () => {
    req.body = { nome: 'Lucas', email: 'test@test.com' };
    (Usuario.findOne as jest.Mock).mockResolvedValue(null);
    (SistemaConfig.findOne as jest.Mock).mockResolvedValue({ aprovacaoAutomaticaUsuarios: false });
    (Usuario.create as jest.Mock).mockResolvedValue({ _id: '123', nome: 'Lucas', email: 'test@test.com', role: 'ESTUDANTE', status: 'PENDENTE' });
    await criarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('criarUsuario - retorna 500 se ocorrer erro', async () => {
    req.body = { nome: 'Lucas', email: 'test@test.com' };
    (Usuario.findOne as jest.Mock).mockResolvedValue(null);
    (SistemaConfig.findOne as jest.Mock).mockResolvedValue({ aprovacaoAutomaticaUsuarios: false });
    (Usuario.create as jest.Mock).mockImplementation(() => { throw new Error(); });
    await criarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // atualizarUsuario
  // =========================
  test('atualizarUsuario - retorna 404 se não existir', async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    await atualizarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('atualizarUsuario - atualiza usuário', async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
    await atualizarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('atualizarUsuario - retorna 400 em caso de erro', async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockImplementation(() => { throw new Error(); });
    await atualizarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // deletarUsuario
  // =========================
  test('deletarUsuario - retorna 404 se não existir', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockResolvedValue(null);
    await deletarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deletarUsuario - deleta usuário e aulas', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockResolvedValue({ _id: '123', avatar: null });
    (Usuario.findByIdAndDelete as jest.Mock).mockResolvedValue({});
    (Aula.deleteMany as jest.Mock).mockResolvedValue({});
    await deletarUsuario(req, res as Response);
    expect(Aula.deleteMany).toHaveBeenCalledWith({ criadoPor: '123' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deletarUsuario - retorna 500 se ocorrer erro', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockImplementation(() => { throw new Error(); });
    await deletarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // aprovarUsuario
  // =========================
  test('aprovarUsuario - retorna 404 se não existir', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await aprovarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('aprovarUsuario - retorna 400 se já aprovado', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ status: 'APROVADO', email: 'test@test.com', nome: 'Lucas' }) });
    await aprovarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('aprovarUsuario - retorna 400 se token válido', async () => {
    req.params.id = '123';
    const usuarioMock: any = { status: 'PENDENTE', email: 'test@test.com', nome: 'Lucas', tokenAtivacaoSenha: 'token', tokenAtivacaoExpira: new Date(Date.now() + 10000) };
    (Usuario.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(usuarioMock) });
    await aprovarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('aprovarUsuario - aprova usuário e envia email', async () => {
    req.params.id = '123';
    const usuarioMock: any = { status: 'PENDENTE', email: 'test@test.com', nome: 'Lucas', save: jest.fn() };
    (Usuario.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(usuarioMock) });
    jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.from('token') as any);
    await aprovarUsuario(req, res as Response);
    expect(emailService.enviarAtivacaoSenha).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('aprovarUsuario - retorna 500 se ocorrer erro', async () => {
    req.params.id = '123';
    (Usuario.findById as jest.Mock).mockImplementation(() => { throw new Error(); });
    await aprovarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // reprovarUsuario
  // =========================
  test('reprovarUsuario - retorna 404 se não existir', async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    await reprovarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('reprovarUsuario - reprova usuário', async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue({ email: 'test@test.com', nome: 'Lucas' });
    await reprovarUsuario(req, res as Response);
    expect(emailService.reprovado).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('reprovarUsuario - retorna 400 se ocorrer erro', async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockImplementation(() => { throw new Error(); });
    await reprovarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =========================
  // promoverAdmin / despromoverAdmin
  // =========================
  const adminTests = [
    { fn: promoverAdmin, mockMethod: 'promovidoAdmin', msg: 'promover' },
    { fn: despromoverAdmin, mockMethod: 'despromovidoAdmin', msg: 'despromover' }
  ];

  adminTests.forEach(({ fn, mockMethod, msg }) => {
  test(`${msg}Admin - retorna 404 se não existir`, async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    await fn(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test(`${msg}Admin - envia email e retorna 200`, async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      email: 'test@test.com',
      nome: 'Lucas'
    });

    await fn(req, res as Response);

    // Chamada correta usando mockMethod
    expect((emailService as any)[mockMethod]).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test(`${msg}Admin - retorna 400 se erro`, async () => {
    req.params.id = '123';
    (Usuario.findByIdAndUpdate as jest.Mock).mockImplementation(() => { throw new Error(); });
    await fn(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

  // =========================
  // aprovacaoAutomatica
  // =========================
  test('aprovacaoAutomatica - retorna 403 se desabilitado', async () => {
    (SistemaConfig.findOne as jest.Mock).mockResolvedValue({ aprovacaoAutomaticaUsuarios: false });
    await aprovacaoAutomatica(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('aprovacaoAutomatica - aprova usuários pendentes e envia emails', async () => {
    const usuarioMock: any = { status: 'PENDENTE', email: 'test@test.com', nome: 'Lucas', save: jest.fn(), tokenAtivacaoSenha: null, tokenAtivacaoExpira: null };
    (SistemaConfig.findOne as jest.Mock).mockResolvedValue({ aprovacaoAutomaticaUsuarios: true });
    (Usuario.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue([usuarioMock]) });

    jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.from('token') as any);

    await aprovacaoAutomatica(req, res as Response);

    expect(emailService.enviarAtivacaoSenha).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('aprovacaoAutomatica - ignora usuários com token válido', async () => {
    const usuarioMock: any = { status: 'PENDENTE', email: 'test@test.com', nome: 'Lucas', tokenAtivacaoSenha: 'token', tokenAtivacaoExpira: new Date(Date.now() + 10000), save: jest.fn() };
    (SistemaConfig.findOne as jest.Mock).mockResolvedValue({ aprovacaoAutomaticaUsuarios: true });
    (Usuario.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue([usuarioMock]) });

    await aprovacaoAutomatica(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('aprovacaoAutomatica - retorna 500 se erro', async () => {
    (SistemaConfig.findOne as jest.Mock).mockImplementation(() => { throw new Error(); });
    await aprovacaoAutomatica(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
  });

});