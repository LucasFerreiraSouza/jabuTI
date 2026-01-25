import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import Usuario from '../../models/usuarios.model';
import { emailService } from '../../utils/emailService';
import validateCaptcha from '../../utils/reCaptcha';

import {
  login,
  confirmarCodigo,
  logout,
  habilitar2FA,
  desabilitar2FA
} from '../../controllers/auth.controller';

jest.mock('../../models/usuarios.model');
jest.mock('../../utils/emailService');
jest.mock('../../utils/reCaptcha');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('auth.controller', () => {
  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {}, user: undefined };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // login
  // =========================
  test('deve retornar 400 se email ou senha não enviados', async () => {
    req.body = { email: '' };

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Email e senha são obrigatórios'
    });
  });

  test('deve retornar 401 se usuário não existir', async () => {
    req.body = { email: 'test@test.com', senha: '123' };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve retornar 429 se usuário estiver bloqueado por tentativas', async () => {
    req.body = {
      email: 'test@test.com',
      senha: 'Senha@123',
      captchaToken: 'token'
    };

    const usuarioMock: any = {
      senha: 'hash',
      tentativasLogin: 5,
      bloqueioLoginExpira: new Date(Date.now() + 10 * 60 * 1000)
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(429);
  });

  test('deve retornar 400 se captcha não informado', async () => {
    req.body = { email: 'test@test.com', senha: '123' };

    const usuarioMock: any = { senha: 'hash' };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Captcha é obrigatório' });
  });


  test('deve retornar 400 se captcha não informado no confirmarCodigo', async () => {
    req.body = { usuarioId: '123', codigo: '111111' }; // sem captchaToken

    // Mock para garantir que não será chamado
    (Usuario.findById as jest.Mock).mockResolvedValue(null);

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Captcha é obrigatório' });
  });


  test('deve retornar 401 se captcha inválido', async () => {
    req.body = {
      email: 'test@test.com',
      senha: '123',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(false);

    const usuarioMock: any = { senha: 'hash' };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Captcha inválido' });
  });

  test('deve retornar 401 se senha inválida', async () => {
    req.body = {
      email: 'test@test.com',
      senha: 'errada',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const usuarioMock: any = {
      senha: 'hash',
      tentativasLogin: 0,
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });


  test('deve retornar 401 se usuário não tiver senha', async () => {
    req.body = { email: 'test@test.com', senha: '123', captchaToken: 'token' };

    const usuarioMock: any = { senha: undefined };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Credenciais inválidas' });
  });



  // 🔥 AJUSTE 1: Cobertura da linha onde bloqueia após 5 tentativas
  test('deve bloquear o usuário após 5 tentativas erradas', async () => {
    req.body = {
      email: 'test@test.com',
      senha: 'errada',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const usuarioMock: any = {
      senha: 'hash',
      tentativasLogin: 4,
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(usuarioMock.bloqueioLoginExpira).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve retornar 403 se usuário não aprovado', async () => {
    req.body = {
      email: 'test@test.com',
      senha: 'Senha@123',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      senha: 'hash',
      status: 'PENDENTE',
      tentativasLogin: 0,
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('deve retornar token quando login sem 2FA', async () => {
    req.body = {
      email: 'test@test.com',
      senha: 'Senha@123',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('token-jwt');

    const usuarioMock: any = {
      _id: '123',
      role: 'USER',
      senha: 'hash',
      status: 'APROVADO',
      doisFatoresAtivo: false,
      tentativasLogin: 0,
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'token-jwt' });
  });

  test('deve enviar código 2FA quando ativo', async () => {
    req.body = {
      email: 'test@test.com',
      senha: 'Senha@123',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      _id: '123',
      email: 'test@test.com',
      nome: 'Lucas',
      senha: 'hash',
      status: 'APROVADO',
      doisFatoresAtivo: true,
      tentativasLogin: 0,
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await login(req, res as Response);

    expect(emailService.codigo2FA).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: '123' })
    );
  });

  test('deve retornar 500 no catch do login', async () => {
    req.body = { email: 'test@test.com', senha: '123', captchaToken: 'token' };

    (Usuario.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('erro inesperado');
    });

    await login(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro no login' });
  });

  // =========================
  // confirmarCodigo
  // =========================
  test('deve retornar 400 se usuário ou código não enviados', async () => {
    req.body = {};

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deve retornar 404 se usuário não encontrado', async () => {
    req.body = { usuarioId: '123', codigo: '000000', captchaToken: 'token' };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve retornar 401 se captcha inválido', async () => {
    req.body = {
      usuarioId: '123',
      codigo: '000000',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(false);

    const usuarioMock: any = {
      codigo2FA: '123456',
      codigo2FAExpira: new Date(Date.now() + 10000),
      tentativas2FA: 0,
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve retornar 429 se 2FA estiver bloqueado', async () => {
    req.body = {
      usuarioId: '123',
      codigo: '000000',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      codigo2FA: '111111',
      codigo2FAExpira: new Date(Date.now() + 10000),
      tentativas2FA: 5,
      bloqueio2FAExpira: new Date(Date.now() + 10 * 60 * 1000),
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(429);
  });

  // 🔥 AJUSTE 2: desbloqueio quando bloqueio expira
  test('deve resetar bloqueio se expiração já passou', async () => {
    req.body = {
      usuarioId: '123',
      codigo: '123456',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      codigo2FA: '123456',
      codigo2FAExpira: new Date(Date.now() + 10000),
      tentativas2FA: 1,
      bloqueio2FAExpira: new Date(Date.now() - 1000),
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await confirmarCodigo(req, res as Response);

    expect(usuarioMock.tentativas2FA).toBe(0);
    expect(usuarioMock.bloqueio2FAExpira).toBeUndefined();
  });

  test('deve retornar 401 se código expirado', async () => {
    req.body = {
      usuarioId: '123',
      codigo: '123456',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      codigo2FA: '123456',
      codigo2FAExpira: new Date(Date.now() - 10000),
      tentativas2FA: 0,
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve bloquear 2FA após tentativas excedidas', async () => {
    req.body = {
      usuarioId: '123',
      codigo: '000000',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      codigo2FA: '111111',
      codigo2FAExpira: new Date(Date.now() + 10000),
      tentativas2FA: 4,
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await confirmarCodigo(req, res as Response);

    expect(usuarioMock.bloqueio2FAExpira).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve retornar 401 se código inválido e não bloquear ainda', async () => {
    req.body = {
      usuarioId: '123',
      codigo: '000000',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);

    const usuarioMock: any = {
      codigo2FA: '111111',
      codigo2FAExpira: new Date(Date.now() + 10000),
      tentativas2FA: 0,
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await confirmarCodigo(req, res as Response);

    expect(usuarioMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve retornar token ao confirmar código válido', async () => {
    req.body = {
      usuarioId: '123',
      codigo: '123456',
      captchaToken: 'token'
    };

    (validateCaptcha as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('token-jwt');

    const usuarioMock: any = {
      _id: '123',
      role: 'USER',
      codigo2FA: '123456',
      codigo2FAExpira: new Date(Date.now() + 10000),
      tentativas2FA: 0,
      save: jest.fn()
    };

    (Usuario.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'token-jwt' });
  });

  test('deve retornar 500 no catch do confirmarCodigo', async () => {
    req.body = { usuarioId: '123', codigo: '000000', captchaToken: 'token' };

    (Usuario.findById as jest.Mock).mockImplementation(() => {
      throw new Error('erro inesperado');
    });

    await confirmarCodigo(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao confirmar código' });
  });

  // =========================
  // logout
  // =========================
  test('deve realizar logout', async () => {
    await logout(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // =========================
  // habilitar / desabilitar 2FA
  // =========================
  test('deve retornar 401 se não autenticado ao habilitar 2FA', async () => {
    req.user = undefined;

    await habilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve retornar 404 se usuário não encontrado ao habilitar 2FA', async () => {
    req.user = { id: '123' };

    (Usuario.findById as jest.Mock).mockResolvedValue(null);

    await habilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve habilitar 2FA', async () => {
    req.user = { id: '123' };

    const usuarioMock: any = { save: jest.fn() };

    (Usuario.findById as jest.Mock).mockResolvedValue(usuarioMock);

    await habilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 500 no catch do habilitar2FA', async () => {
    req.user = { id: '123' };

    (Usuario.findById as jest.Mock).mockImplementation(() => {
      throw new Error('erro inesperado');
    });

    await habilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('deve retornar 401 se não autenticado ao desabilitar 2FA', async () => {
    req.user = undefined;

    await desabilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('deve retornar 404 se usuário não encontrado ao desabilitar 2FA', async () => {
    req.user = { id: '123' };

    (Usuario.findById as jest.Mock).mockResolvedValue(null);

    await desabilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deve desabilitar 2FA', async () => {
    req.user = { id: '123' };

    const usuarioMock: any = { save: jest.fn() };

    (Usuario.findById as jest.Mock).mockResolvedValue(usuarioMock);

    await desabilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve retornar 500 no catch do desabilitar2FA', async () => {
    req.user = { id: '123' };

    (Usuario.findById as jest.Mock).mockImplementation(() => {
      throw new Error('erro inesperado');
    });

    await desabilitar2FA(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
