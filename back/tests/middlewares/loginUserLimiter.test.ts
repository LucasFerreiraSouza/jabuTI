import { adminOnly } from '../../middlewares/adminOnly';
import { Response } from 'express';

describe('adminOnly middleware', () => {
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  it('deve retornar 401 se usuário não autenticado', () => {
    const req: any = {};
    const res = mockRes();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se usuário não for ADMIN', () => {
    const req: any = { user: { role: 'ESTUDANTE' } };
    const res = mockRes();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Acesso restrito a administradores' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next se for ADMIN', () => {
    const req: any = { user: { role: 'ADMIN' } };
    const res = mockRes();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
