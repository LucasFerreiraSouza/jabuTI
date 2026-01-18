import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest';

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ erro: 'Usuário não autenticado' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }

  return next();
};
