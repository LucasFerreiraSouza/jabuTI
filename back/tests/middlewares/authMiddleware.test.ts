import { auth } from '../../middlewares/auth';
import { Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import Usuario from '../../models/usuarios.model';

jest.mock('jsonwebtoken');
jest.mock('../../models/usuarios.model');

describe('auth middleware', () => {
  let req: any;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('deve retornar 401 se não tiver token', async () => {
    await auth(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido' });
  });

  test('deve retornar 401 se token mal formatado', async () => {
    req.headers.authorization = 'BadToken';

    await auth(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token mal formatado' });
  });

  test('deve retornar 500 se JWT_SECRET não configurado', async () => {
    process.env.JWT_SECRET = '';
    req.headers.authorization = 'Bearer token';

    await auth(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'JWT_SECRET não configurado' });
  });

  test('deve retornar 401 se token inválido', async () => {
    process.env.JWT_SECRET = 'secret';
    req.headers.authorization = 'Bearer token';

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new JsonWebTokenError('invalid token');
    });

    await auth(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido' });
  });

  test('deve retornar 401 se token expirado', async () => {
    process.env.JWT_SECRET = 'secret';
    req.headers.authorization = 'Bearer token';

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new TokenExpiredError('expired', new Date());
    });

    await auth(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token expirado' });
  });

  test('deve retornar 401 se usuário não existe', async () => {
    process.env.JWT_SECRET = 'secret';
    req.headers.authorization = 'Bearer token';

    (jwt.verify as jest.Mock).mockReturnValue({ id: '123' });
    (Usuario.findById as jest.Mock).mockResolvedValue(null);

    await auth(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não existe mais' });
  });

  test('deve chamar next se tudo estiver ok', async () => {
    process.env.JWT_SECRET = 'secret';
    req.headers.authorization = 'Bearer token';

    (jwt.verify as jest.Mock).mockReturnValue({ id: '123' });
    (Usuario.findById as jest.Mock).mockResolvedValue({
      id: '123',
      role: 'admin'
    });

    await auth(req, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: '123', role: 'admin' });
  });
});
