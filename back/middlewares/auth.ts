import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/AuthRequest';

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: 'Token mal formatado' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    // aqui ele PASSA a existir
    req.userId = decoded.id;

    return next();
  });
};

export default auth;
