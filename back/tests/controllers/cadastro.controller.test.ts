import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import Usuario from '../../models/usuarios.model';
import { emailService } from '../../utils/emailService';
import { validarSenhaForte } from '../../utils/senha';
import validateCaptcha from '../../utils/reCaptcha';

import {
  registrarUsuario,
  solicitarResetSenha,
  resetarSenha,
  solicitarResetEmail,
  resetarEmail,
  ativarSenha
} from '../../controllers/cadastro.controller';

jest.mock('../../utils/reCaptcha');
jest.mock('../../utils/emailService');
jest.mock('../../models/usuarios.model');
jest.mock('../../utils/senha');
jest.mock('bcrypt');

describe('cadastro.controller', () => {
  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  test('deve retornar 409 se novoEmail já existe', async () => {
    req.body = { email: 'email@test.com', novoEmail: 'novo@test.com' };

    const usuarioMock: any = { save: jest.fn() };
    (Usuario.findOne as jest.Mock)
      .mockResolvedValueOnce(usuarioMock) // encontra usuário atual
      .mockResolvedValueOnce({}); // novo email já existe

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
      .mockResolvedValueOnce(usuarioMock) // encontra usuário atual
      .mockResolvedValueOnce(null); // novo email não existe

    await solicitarResetEmail(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(emailService.resetEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
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
});
