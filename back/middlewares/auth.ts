import { Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AuthRequest } from '../types/AuthRequest';
import Usuario from '../models/usuarios.model';

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.trim()) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ erro: 'Token mal formatado' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ erro: 'JWT_SECRET não configurado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'seu-app',
      audience: 'seus-usuarios'
    }) as { id?: string };

    if (!decoded?.id) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não existe mais' });
    }

    req.user = {
      id: usuario.id,
      role: usuario.role
    };

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ erro: 'Token expirado' });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    console.error('Auth error:', error);
    return res.status(500).json({ erro: 'Erro ao validar token' });
  }
};
