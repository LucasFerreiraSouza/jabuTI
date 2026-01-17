import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/AuthRequest';
import Usuario from '../models/usuarios.model';

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: 'Token mal formatado' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ erro: 'JWT_SECRET não configurado' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    // ❗️ Verifica se o usuário ainda existe no banco
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não existe mais' });
    }

    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

export default auth;
