import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


import Usuario from '../models/usuarios.model';
import { emailService } from '../utils/emailService';
import validateCaptcha from '../utils/reCaptcha';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha, captchaToken } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const usuario = await Usuario.findOne({ email }).select(
      '+senha +tentativasLogin +bloqueioLoginExpira'
    );

    if (!usuario || !usuario.senha) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const agora = new Date();

    if (usuario.bloqueioLoginExpira && usuario.bloqueioLoginExpira > agora) {
      const minutos = Math.ceil(
        (usuario.bloqueioLoginExpira.getTime() - agora.getTime()) / 60000
      );

      return res.status(429).json({
        erro: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).`
      });
    }

    if (!captchaToken) {
      return res.status(400).json({ erro: 'Captcha é obrigatório' });
    }

    const captchaOk = await validateCaptcha(captchaToken);

    if (!captchaOk) {
      return res.status(401).json({ erro: 'Captcha inválido' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      usuario.tentativasLogin += 1;

      const MAX_TENTATIVAS = 5;
      if (usuario.tentativasLogin >= MAX_TENTATIVAS) {
        usuario.bloqueioLoginExpira = new Date(Date.now() + 15 * 60 * 1000);
      }

      await usuario.save();
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    usuario.tentativasLogin = 0;
    usuario.bloqueioLoginExpira = undefined;
    await usuario.save();

    if (usuario.status !== 'APROVADO') {
      return res.status(403).json({ erro: 'Usuário ainda não aprovado' });
    }

    if (!usuario.doisFatoresAtivo) {
      usuario.ultimoLogin = new Date();
      await usuario.save();

      const token = jwt.sign(
        { id: usuario._id, role: usuario.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h', issuer: 'seu-app', audience: 'seus-usuarios' }
      );

      return res.status(200).json({ token });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    usuario.codigo2FA = codigo;
    usuario.codigo2FAExpira = new Date(Date.now() + 10 * 60 * 1000);
    usuario.tentativas2FA = 0;

    await usuario.save();

    await emailService.codigo2FA(usuario.email, usuario.nome, codigo);

    return res.status(200).json({
      mensagem: 'Código de verificação enviado para o e-mail',
      usuarioId: usuario._id
    });
  } catch {
    return res.status(500).json({ erro: 'Erro no login' });
  }
};

export const confirmarCodigo = async (req: Request, res: Response) => {
  try {
    const { usuarioId, codigo, captchaToken } = req.body;

    if (!usuarioId || !codigo) {
      return res.status(400).json({
        erro: 'Usuário e código são obrigatórios'
      });
    }

    // 🚀 valida captcha antes de tudo
    if (!captchaToken) {
      return res.status(400).json({ erro: 'Captcha é obrigatório' });
    }

    const captchaOk = await validateCaptcha(captchaToken);
    if (!captchaOk) {
      return res.status(401).json({ erro: 'Captcha inválido' });
    }

    const usuario = await Usuario.findById(usuarioId).select(
      '+codigo2FA +codigo2FAExpira +tentativas2FA +bloqueio2FAExpira'
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const agora = new Date();

    if (usuario.bloqueio2FAExpira && usuario.bloqueio2FAExpira <= agora) {
      usuario.tentativas2FA = 0;
      usuario.bloqueio2FAExpira = undefined;
      await usuario.save();
    }

    if (usuario.bloqueio2FAExpira && usuario.bloqueio2FAExpira > agora) {
      const minutos = Math.ceil(
        (usuario.bloqueio2FAExpira.getTime() - agora.getTime()) / 60000
      );

      return res.status(429).json({
        erro: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).`
      });
    }

    const MAX_TENTATIVAS = 5;

    const codigoInvalido =
      !usuario.codigo2FA ||
      usuario.codigo2FA !== codigo ||
      !usuario.codigo2FAExpira ||
      usuario.codigo2FAExpira < new Date();

    if (codigoInvalido) {
      usuario.tentativas2FA += 1;

      if (usuario.tentativas2FA >= MAX_TENTATIVAS) {
        usuario.bloqueio2FAExpira = new Date(Date.now() + 15 * 60 * 1000);
      }

      await usuario.save();

      return res.status(401).json({
        erro: 'Código inválido ou expirado'
      });
    }

    usuario.codigo2FA = undefined;
    usuario.codigo2FAExpira = undefined;
    usuario.tentativas2FA = 0;
    usuario.bloqueio2FAExpira = undefined;
    usuario.ultimoLogin = new Date();

    await usuario.save();

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h', issuer: 'seu-app', audience: 'seus-usuarios' }
    );

    return res.status(200).json({ token });
  } catch {
    return res.status(500).json({ erro: 'Erro ao confirmar código' });
  }
};


export const logout = async (_req: Request, res: Response) => {
  return res.status(200).json({
    mensagem: 'Logout realizado com sucesso'
  });
};

export const habilitar2FA = async (req: Request, res: Response) => {
  try {
    const reqAny = req as any;

    if (!reqAny.user || !reqAny.user.id) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    const usuario = await Usuario.findById(reqAny.user.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.doisFatoresAtivo = true;
    await usuario.save();

    return res.status(200).json({ mensagem: '2FA habilitado com sucesso' });
  } catch {
    return res.status(500).json({ erro: 'Erro ao habilitar 2FA' });
  }
};

export const desabilitar2FA = async (req: Request, res: Response) => {
  try {
    const reqAny = req as any;

    if (!reqAny.user || !reqAny.user.id) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    const usuario = await Usuario.findById(reqAny.user.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.doisFatoresAtivo = false;
    await usuario.save();

    return res.status(200).json({ mensagem: '2FA desabilitado com sucesso' });
  } catch {
    return res.status(500).json({ erro: 'Erro ao desabilitar 2FA' });
  }
};
