import loginUserLimiter, { RequestWithUser } from '../../middlewares/loginUserLimiter';
import { Response } from 'express';
import Usuario from '../../models/usuarios.model';

jest.mock('../../models/usuarios.model');

describe('loginUserLimiter middleware', () => {

  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockNext = () => jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 400 se não enviar email', async () => {

    const req = {
      body: {}
    } as RequestWithUser;

    const res = mockRes();
    const next = mockNext();

    await loginUserLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Email é obrigatório.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next se usuário não existir', async () => {

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = {
      body: { email: 'teste@email.com' }
    } as RequestWithUser;

    const res = mockRes();
    const next = mockNext();

    await loginUserLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('deve retornar 429 se usuário estiver bloqueado', async () => {

    const usuarioMock = {
      bloqueioLoginExpira: new Date(Date.now() + 60000)
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    const req = {
      body: { email: 'teste@email.com' }
    } as RequestWithUser;

    const res = mockRes();
    const next = mockNext();

    await loginUserLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Conta bloqueada por tentativas. Tente novamente mais tarde.'
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('deve resetar bloqueio quando bloqueio estiver expirado', async () => {

    const usuarioMock: any = {
      tentativasLogin: 3,
      bloqueioLoginExpira: new Date(Date.now() - 60000),
      save: jest.fn()
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    const req = {
      body: { email: 'teste@email.com' }
    } as RequestWithUser;

    const res = mockRes();
    const next = mockNext();

    await loginUserLimiter(req, res, next);

    expect(usuarioMock.tentativasLogin).toBe(0);
    expect(usuarioMock.bloqueioLoginExpira).toBeUndefined();
    expect(usuarioMock.save).toHaveBeenCalled();
    expect(req.userForLimiter).toBe(usuarioMock);
    expect(next).toHaveBeenCalled();
  });

  it('deve apenas anexar userForLimiter e seguir quando não estiver bloqueado', async () => {

    const usuarioMock: any = {
      tentativasLogin: 0,
      bloqueioLoginExpira: undefined
    };

    (Usuario.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(usuarioMock)
    });

    const req = {
      body: { email: 'teste@email.com' }
    } as RequestWithUser;

    const res = mockRes();
    const next = mockNext();

    await loginUserLimiter(req, res, next);

    expect(req.userForLimiter).toBe(usuarioMock);
    expect(next).toHaveBeenCalled();
  });

});