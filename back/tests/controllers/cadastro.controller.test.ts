import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Usuario from '../../models/usuarios.model';
import { emailService } from '../../utils/emailService';
import { validarSenhaForte } from '../../utils/senha';
import validateCaptcha from '../../utils/reCaptcha';
import SistemaConfig from '../../models/sistema.model';

import {
  registrarUsuario,
  solicitarResetSenha,
  resetarSenha,
  solicitarResetEmail,
  resetarEmail,
  ativarSenha
} from '../../controllers/cadastro.controller';

// =========================
// MOCKS
// =========================
jest.mock('../../utils/reCaptcha');
jest.mock('../../utils/emailService');
jest.mock('../../utils/senha');
jest.mock('bcrypt');
jest.mock('../../models/usuarios.model');
jest.mock('../../models/sistema.model'); // mock do SistemaConfig

describe('cadastro.controller', () => {

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.resetAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // =========================
  // registrarUsuario
  // =========================
  test('deve retornar 400 se captcha não informado', async () => {
    req.body = { nome: 'Lucas', email: 'email@test.com' };
    await registrarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Captcha é obrigatório' });
  });

  test('deve retornar 401 se captcha inválido', async () => {
    req.body = { nome: 'Lucas', email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(false);
    await registrarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Captcha inválido' });
  });

  test('deve retornar 400 se nome ou email não enviados', async () => {
    req.body = { nome: 'Lucas', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    await registrarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Nome e email são obrigatórios'
    });
  });

  test('deve retornar 409 se email já cadastrado', async () => {
    req.body = { nome: 'Lucas', email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (Usuario.findOne as jest.Mock).mockResolvedValue({});
    await registrarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Email já cadastrado' });
  });

  test('deve registrar usuário e enviar email', async () => {
    req.body = { nome: 'Lucas', email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (Usuario.findOne as jest.Mock).mockResolvedValue(null);
    (Usuario.create as jest.Mock).mockResolvedValue({});
    await registrarUsuario(req, res as Response);
    expect(Usuario.create).toHaveBeenCalled();
    expect(emailService.cadastroRecebido).toHaveBeenCalledWith('email@test.com', 'Lucas');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: 'Cadastro realizado. Aguarde aprovação do administrador.'
    });
  });

  test('deve retornar 500 em registrarUsuario se ocorrer erro', async () => {
    req.body = { nome: 'Lucas', email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockRejectedValue(new Error('erro'));
    await registrarUsuario(req, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao registrar usuário' });
  });

  // =========================
  // registrarUsuario - aprovação automática
  // =========================
  test('deve registrar usuário com aprovação automática e enviar email de ativação', async () => {
    req.body = { nome: 'Lucas', email: 'email@test.com', captchaToken: 'token' };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (Usuario.findOne as jest.Mock).mockResolvedValue(null);
    (Usuario.create as jest.Mock).mockResolvedValue({});
    (emailService.enviarAtivacaoSenha as jest.Mock).mockResolvedValue(undefined);

    // MOCK de SistemaConfig.findOne
    (SistemaConfig.findOne as jest.Mock).mockResolvedValue({
      aprovacaoAutomaticaUsuarios: true
    });

    await registrarUsuario(req, res as Response);

    expect(Usuario.create).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Lucas',
      email: 'email@test.com',
      role: 'ESTUDANTE',
      status: 'APROVADO',
      senha: null,
      doisFatoresAtivo: false,
      tokenAtivacaoSenha: expect.any(String),
      tokenAtivacaoExpira: expect.any(Date)
    }));

    expect(emailService.enviarAtivacaoSenha).toHaveBeenCalledWith(
      'email@test.com',
      'Lucas',
      expect.stringContaining('ativar-senha?token=')
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: 'Cadastro realizado. Enviamos um e-mail para ativação da sua senha.'
    });
  });

  
  // =========================
  // solicitarResetSenha
  // =========================
  test('deve retornar 400 se captcha não informado em reset senha', async () => {
    req.body = { email: 'email@test.com' };

    await solicitarResetSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Captcha é obrigatório' });
  });

  test('deve retornar 401 se captcha inválido em reset senha', async () => {
    req.body = { email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(false);

    await solicitarResetSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Captcha inválido' });
  });

  test('deve retornar 400 se email não enviado', async () => {
    req.body = { captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(true);

    await solicitarResetSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Email é obrigatório' });
  });

  test('deve retornar 200 mesmo se email não existir (segurança)', async () => {
    req.body = { email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (Usuario.findOne as jest.Mock).mockResolvedValue(null);

    await solicitarResetSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensagem:
        'Se este email existir, você receberá um link para resetar a senha.'
    });
  });

  test('deve gerar token e enviar email de reset', async () => {
    req.body = { email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      email: 'email@test.com',
      nome: 'Lucas',
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockResolvedValue(usuarioMock);

    await solicitarResetSenha(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(emailService.resetSenha).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 500 em solicitarResetSenha se ocorrer erro', async () => {
    req.body = { email: 'email@test.com', captchaToken: 'token' };
    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (Usuario.findOne as jest.Mock).mockRejectedValue(new Error('erro'));

    await solicitarResetSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao solicitar reset de senha' });
  });

  // =========================
  // resetarSenha
  // =========================
  test('deve retornar 400 se token ou senha não enviados', async () => {
    req.body = { token: '', senha: '' };

    await resetarSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token e senha são obrigatórios' });
  });

  test('deve retornar 400 se senha fraca', async () => {
    req.body = { token: 'token', senha: 'fraca' };
    (validarSenhaForte as jest.Mock).mockReturnValue(false);

    await resetarSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro:
        'Senha fraca. Use no mínimo 8 caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial.'
    });
  });

  test('deve retornar 400 se token inválido em resetarSenha', async () => {
    req.body = { token: 'token', senha: 'Senha@123' };
    (validarSenhaForte as jest.Mock).mockReturnValue(true);

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await resetarSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido ou expirado' });
  });

  test('deve resetar senha com sucesso', async () => {
    req.body = { token: 'token', senha: 'Senha@123' };
    (validarSenhaForte as jest.Mock).mockReturnValue(true);

    const usuarioMock: any = {
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

    await resetarSenha(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: 'Senha redefinida com sucesso.'
    });
  });

  

  // =========================
  // solicitarResetEmail
  // =========================
  test('deve retornar 400 se email ou novoEmail não enviados', async () => {
    req.body = { email: 'email@test.com' };

    await solicitarResetEmail(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Email atual e novo email são obrigatórios'
    });
  });

  test('deve retornar 200 se usuário não existir em reset email', async () => {
    req.body = { email: 'email@test.com', novoEmail: 'novo@test.com' };

    (Usuario.findOne as jest.Mock).mockResolvedValue(null);

    await solicitarResetEmail(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensagem:
        'Se este email existir, você receberá um link para confirmar a troca.'
    });
  });

  test('deve retornar 409 se novoEmail já existe', async () => {
    req.body = { email: 'email@test.com', novoEmail: 'novo@test.com' };

    const usuarioMock: any = { save: jest.fn() };
    (Usuario.findOne as jest.Mock)
      .mockResolvedValueOnce(usuarioMock)
      .mockResolvedValueOnce({});

    await solicitarResetEmail(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Este novo email já está em uso' });
  });

  test('deve gerar token e enviar email de troca', async () => {
    req.body = { email: 'email@test.com', novoEmail: 'novo@test.com' };

    const usuarioMock: any = {
      email: 'email@test.com',
      nome: 'Lucas',
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock)
      .mockResolvedValueOnce(usuarioMock)
      .mockResolvedValueOnce(null);

    await solicitarResetEmail(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(emailService.resetEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 500 em solicitarResetEmail se ocorrer erro', async () => {
    req.body = { email: 'email@test.com', novoEmail: 'novo@test.com' };

    (Usuario.findOne as jest.Mock).mockRejectedValue(new Error('erro'));

    await solicitarResetEmail(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao solicitar troca de email' });
  });

  // =========================
  // resetarEmail
  // =========================
  test('deve retornar 400 se token não enviado', async () => {
    req.body = { token: '' };

    await resetarEmail(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token é obrigatório' });
  });

  test('deve retornar 400 se token inválido', async () => {
    req.body = { token: 'token' };
    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await resetarEmail(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido ou expirado' });
  });

  test('deve retornar 400 se token válido mas novoEmail não existe', async () => {
    req.body = { token: 'token' };

    const usuarioMock: any = { novoEmail: undefined };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await resetarEmail(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido ou expirado' });
  });

  test('deve alterar email com sucesso', async () => {
    req.body = { token: 'token' };

    const usuarioMock: any = {
      novoEmail: 'novo@test.com',
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await resetarEmail(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: 'Email alterado com sucesso.'
    });
  });



  // =========================
  // ativarSenha
  // =========================
  test('deve retornar 400 se token ou senha não enviados em ativarSenha', async () => {
    req.body = { token: '', senha: '' };

    await ativarSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token e senha são obrigatórios'
    });
  });

  test('deve retornar 400 se senha fraca em ativarSenha', async () => {
    req.body = { token: 'token', senha: 'fraca' };
    (validarSenhaForte as jest.Mock).mockReturnValue(false);

    await ativarSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro:
        'Senha fraca. Use no mínimo 8 caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial.'
    });
  });

  test('deve retornar 400 se token inválido em ativarSenha', async () => {
    req.body = { token: 'token', senha: 'Senha@123' };
    (validarSenhaForte as jest.Mock).mockReturnValue(true);

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await ativarSenha(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido ou expirado' });
  });

  test('deve ativar senha com sucesso', async () => {
    req.body = { token: 'token', senha: 'Senha@123' };
    (validarSenhaForte as jest.Mock).mockReturnValue(true);

    const usuarioMock: any = {
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

    await ativarSenha(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: 'Senha criada com sucesso. Você já pode fazer login.'
    });
  });

  test('deve retornar 500 em resetarSenha se ocorrer erro', async () => {
  req.body = { token: 'token', senha: 'Senha@123' };
  (validarSenhaForte as jest.Mock).mockReturnValue(true);

  (Usuario.findOne as jest.Mock).mockReturnValue({
    select: jest.fn().mockRejectedValueOnce(new Error('erro'))
  });

  await resetarSenha(req, res as Response);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao resetar senha' });
});

test('deve retornar 500 em resetarEmail se ocorrer erro', async () => {
  req.body = { token: 'token' };

  (Usuario.findOne as jest.Mock).mockReturnValue({
    select: jest.fn().mockRejectedValueOnce(new Error('erro'))
  });

  await resetarEmail(req, res as Response);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao alterar email' });
});


test('deve retornar 500 em ativarSenha se ocorrer erro', async () => {
  req.body = { token: 'token', senha: 'Senha@123' };
  (validarSenhaForte as jest.Mock).mockReturnValue(true);

  (Usuario.findOne as jest.Mock).mockReturnValue({
    select: jest.fn().mockRejectedValueOnce(new Error('erro'))
  });

  await ativarSenha(req, res as Response);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao ativar senha' });
});


});
