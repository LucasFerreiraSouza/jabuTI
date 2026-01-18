import { Request, Response, NextFunction } from 'express';
import Usuario from '../models/usuarios.model';

export interface RequestWithUser extends Request {
  userForLimiter?: any;
}

export default async function loginUserLimiter(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: 'Email é obrigatório.' });
  }

  const usuario = await Usuario.findOne({ email }).select(
    '+tentativasLogin +bloqueioLoginExpira'
  ) as any;

  // Se não existir usuário, deixa passar (não vaza info)
  if (!usuario) {
    return next();
  }

  // Se bloqueado
  if (usuario.bloqueioLoginExpira && usuario.bloqueioLoginExpira > new Date()) {
    return res.status(429).json({
      erro: 'Conta bloqueada por tentativas. Tente novamente mais tarde.'
    });
  }

  // Se bloqueio expirou, resetar
  if (usuario.bloqueioLoginExpira && usuario.bloqueioLoginExpira <= new Date()) {
    usuario.tentativasLogin = 0;
    usuario.bloqueioLoginExpira = undefined;
    await usuario.save();
  }

  req.userForLimiter = usuario;
  next();
}
