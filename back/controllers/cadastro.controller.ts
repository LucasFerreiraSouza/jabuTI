import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Usuario from '../models/usuarios.model';
import { emailService } from '../utils/emailService';
import { validarSenhaForte } from '../utils/senha';
import validateCaptcha from '../utils/reCaptcha';

export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const { email, nome, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ erro: 'Captcha é obrigatório' });
    }

    const captchaOk = await validateCaptcha(captchaToken);

    if (!captchaOk) {
      return res.status(401).json({ erro: 'Captcha inválido' });
    }

    if (!nome || !email) {
      return res.status(400).json({
        erro: 'Nome e email são obrigatórios'
      });
    }

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    await Usuario.create({
      nome,
      email,
      role: 'ESTUDANTE',
      status: 'PENDENTE',
      senha: null,
      doisFatoresAtivo: false
    });

    await emailService.cadastroRecebido(email, nome);

    return res.status(201).json({
      mensagem: 'Cadastro realizado. Aguarde aprovação do administrador.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
};

export const solicitarResetSenha = async (req: Request, res: Response) => {
  try {
    const { email, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ erro: 'Captcha é obrigatório' });
    }

    const captchaOk = await validateCaptcha(captchaToken);

    if (!captchaOk) {
      return res.status(401).json({ erro: 'Captcha inválido' });
    }

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(200).json({
        mensagem:
          'Se este email existir, você receberá um link para resetar a senha.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    usuario.tokenResetSenha = token;
    usuario.resetSenhaExpira = new Date(Date.now() + 60 * 60 * 1000);

    await usuario.save();

    const link = `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`;

    await emailService.resetSenha(usuario.email, usuario.nome, link);

    return res.status(200).json({
      mensagem:
        'Se este email existir, você receberá um link para resetar a senha.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao solicitar reset de senha' });
  }
};

export const resetarSenha = async (req: Request, res: Response) => {
  try {
    const { token, senha } = req.body;

    if (!token || !senha) {
      return res.status(400).json({ erro: 'Token e senha são obrigatórios' });
    }

    if (!validarSenhaForte(senha)) {
      return res.status(400).json({
        erro:
          'Senha fraca. Use no mínimo 8 caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial.'
      });
    }

    const usuario = await Usuario.findOne({
      tokenResetSenha: token,
      resetSenhaExpira: { $gt: new Date() }
    }).select('+tokenResetSenha');

    if (!usuario) {
      return res.status(400).json({ erro: 'Token inválido ou expirado' });
    }

    usuario.senha = await bcrypt.hash(senha, 10);
    usuario.tokenResetSenha = undefined;
    usuario.resetSenhaExpira = undefined;

    await usuario.save();

    return res.status(200).json({
      mensagem: 'Senha redefinida com sucesso.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao resetar senha' });
  }
};

export const solicitarResetEmail = async (req: Request, res: Response) => {
  try {
    const { email, novoEmail } = req.body;

    if (!email || !novoEmail) {
      return res.status(400).json({
        erro: 'Email atual e novo email são obrigatórios'
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(200).json({
        mensagem:
          'Se este email existir, você receberá um link para confirmar a troca.'
      });
    }

    const emailExiste = await Usuario.findOne({ email: novoEmail });
    if (emailExiste) {
      return res.status(409).json({ erro: 'Este novo email já está em uso' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    usuario.tokenResetEmail = token;
    usuario.resetEmailExpira = new Date(Date.now() + 60 * 60 * 1000);
    usuario.novoEmail = novoEmail;

    await usuario.save();

    const link = `${process.env.FRONTEND_URL}/confirmar-email?token=${token}`;

    await emailService.resetEmail(usuario.email, usuario.nome, link, novoEmail);

    return res.status(200).json({
      mensagem:
        'Se este email existir, você receberá um link para confirmar a troca.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao solicitar troca de email' });
  }
};

export const resetarEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ erro: 'Token é obrigatório' });
    }

    const usuario = await Usuario.findOne({
      tokenResetEmail: token,
      resetEmailExpira: { $gt: new Date() }
    }).select('+tokenResetEmail +novoEmail'); // <-- aqui

    if (!usuario || !usuario.novoEmail) {
      return res.status(400).json({ erro: 'Token inválido ou expirado' });
    }

    usuario.email = usuario.novoEmail;
    usuario.novoEmail = undefined;
    usuario.tokenResetEmail = undefined;
    usuario.resetEmailExpira = undefined;

    await usuario.save();

    return res.status(200).json({
      mensagem: 'Email alterado com sucesso.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao alterar email' });
  }
};


export const ativarSenha = async (req: Request, res: Response) => {
  try {
    const { token, senha } = req.body;

    if (!token || !senha) {
      return res.status(400).json({
        erro: 'Token e senha são obrigatórios'
      });
    }

    // validação forte
    if (!validarSenhaForte(senha)) {
      return res.status(400).json({
        erro:
          'Senha fraca. Use no mínimo 8 caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial.'
      });
    }

    const usuario = await Usuario.findOne({
      tokenAtivacaoSenha: token,
      tokenAtivacaoExpira: { $gt: new Date() }
    }).select('+tokenAtivacaoSenha');

    if (!usuario) {
      return res.status(400).json({
        erro: 'Token inválido ou expirado'
      });
    }

    usuario.senha = await bcrypt.hash(senha, 10);
    usuario.tokenAtivacaoSenha = undefined;
    usuario.tokenAtivacaoExpira = undefined;
    usuario.status = 'APROVADO'; // garante que fique aprovado

    await usuario.save();

    return res.status(200).json({
      mensagem: 'Senha criada com sucesso. Você já pode fazer login.'
    });
  } catch {
    return res.status(500).json({
      erro: 'Erro ao ativar senha'
    });
  }
};