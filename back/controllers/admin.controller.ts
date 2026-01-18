import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';


import Usuario from '../models/usuarios.model';
import Aula from '../models/aulas.model';

import { emailService } from '../utils/emailService';
import { validarSenhaForte } from '../utils/senha';


const usuarioSafeSelect =
  '-senha -codigo2FA -codigo2FAExpira -tentativas2FA -tokenAtivacaoSenha -tokenAtivacaoExpira -tentativasLogin -bloqueioLoginExpira';

/* ADMIN */
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.find().select(usuarioSafeSelect);
    return res.status(200).json(usuarios);
  } catch {
    return res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id).select(usuarioSafeSelect);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch {
    return res.status(400).json({ erro: 'ID inválido' });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, role = 'ESTUDANTE', status = 'APROVADO' } =
      req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Nome, email e senha são obrigatórios'
      });
    }

    if (!validarSenhaForte(senha)) {
      return res.status(400).json({
        erro:
          'Senha fraca. Use no mínimo 8 caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial.'
      });
    }

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role,
      status
    });

    return res.status(201).json({
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      status: usuario.status
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dadosAtualizados = req.body;

    delete dadosAtualizados.senha;
    delete dadosAtualizados.codigo2FA;
    delete dadosAtualizados.codigo2FAExpira;
    delete dadosAtualizados.tentativas2FA;

    const usuario = await Usuario.findByIdAndUpdate(id, dadosAtualizados, {
      new: true
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch {
    return res.status(400).json({ erro: 'Erro ao atualizar usuário' });
  }
};

export const deletarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await Aula.deleteMany({ criadoPor: id });

    return res.status(200).json({
      mensagem: 'Usuário removido com sucesso'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
};

export const aprovarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    if (usuario.status === 'APROVADO') {
      return res.status(400).json({
        erro: 'Usuário já está aprovado'
      });
    }

    if (
      usuario.tokenAtivacaoSenha &&
      usuario.tokenAtivacaoExpira &&
      usuario.tokenAtivacaoExpira > new Date()
    ) {
      return res.status(400).json({
        erro: 'Usuário já possui um link de ativação válido'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    usuario.status = 'APROVADO';
    usuario.tokenAtivacaoSenha = token;
    usuario.tokenAtivacaoExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await usuario.save();

    const linkAtivacao = `${process.env.FRONTEND_URL}/ativar-senha?token=${token}`;

    await emailService.enviarAtivacaoSenha(
      usuario.email,
      usuario.nome,
      linkAtivacao
    );

    return res.status(200).json({
      mensagem: 'Usuário aprovado e e-mail de ativação enviado'
    });
  } catch {
    return res.status(500).json({
      erro: 'Erro ao aprovar usuário'
    });
  }
};

export const reprovarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { status: 'REPROVADO' },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await emailService.reprovado(usuario.email, usuario.nome);

    return res.status(200).json({
      mensagem: 'Usuário reprovado'
    });
  } catch {
    return res.status(400).json({ erro: 'Erro ao reprovar usuário' });
  }
};

export const promoverAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { role: 'ADMIN' },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await emailService.promovidoAdmin(usuario.email, usuario.nome);

    return res.status(200).json({
      mensagem: 'Usuário promovido a administrador'
    });
  } catch {
    return res.status(400).json({ erro: 'Erro ao promover usuário' });
  }
};

export const despromoverAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { role: 'ESTUDANTE' },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await emailService.despromovidoAdmin(usuario.email, usuario.nome);

    return res.status(200).json({
      mensagem: 'Usuário despromovido para estudante'
    });
  } catch {
    return res.status(400).json({ erro: 'Erro ao despromover usuário' });
  }
};
