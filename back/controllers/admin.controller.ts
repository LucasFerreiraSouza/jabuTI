import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import cloudinary from "../config/cloudinary";


import SistemaConfig from '../models/sistema.model';
import Usuario from '../models/usuarios.model';
import {Aula} from '../models/aulas.model';

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
    const { nome, email, role = 'ESTUDANTE' } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        erro: 'Nome e email são obrigatórios'
      });
    }

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const config = await SistemaConfig.findOne();

    // 👉 se a aprovação automática estiver ligada
    if (config?.aprovacaoAutomaticaUsuarios) {

      const token = crypto.randomBytes(32).toString('hex');

      const usuario = await Usuario.create({
        nome,
        email,
        role,
        status: 'APROVADO',
        senha: null,
        doisFatoresAtivo: false,
        tokenAtivacaoSenha: token,
        tokenAtivacaoExpira: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        )
      });

      const linkAtivacao =
        `${process.env.FRONTEND_URL}/ativar-senha?token=${token}`;

      await emailService.enviarAtivacaoSenha(
        usuario.email,
        usuario.nome,
        linkAtivacao
      );

      return res.status(201).json({
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        status: usuario.status,
        mensagem: 'Usuário criado e e-mail de ativação enviado.'
      });
    }

    // 👉 se NÃO estiver ligada
    const usuario = await Usuario.create({
      nome,
      email,
      role,
      status: 'PENDENTE',
      senha: null,
      doisFatoresAtivo: false
    });

    return res.status(201).json({
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      status: usuario.status,
      mensagem: 'Usuário criado como pendente.'
    });

  } catch (err) {
    console.error(err);
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

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Deleta avatar do Cloudinary, se existir
    if (usuario.avatar?.url) {
      try {
        const url = usuario.avatar.url;
        const extractPublicIdFromUrl = (url: string) => {
          const cleanUrl = url.split("?")[0];
          const afterUpload = cleanUrl.split("/upload/")[1];
          const withoutVersion = afterUpload.replace(/^v\d+\//, "");
          return withoutVersion.split(".")[0];
        };
        const public_id = extractPublicIdFromUrl(url);
        await cloudinary.uploader.destroy(public_id);
      } catch (err) {
        console.error("Erro ao deletar avatar no Cloudinary:", err);
      }
    }

    // Deleta o usuário
    await Usuario.findByIdAndDelete(id);

    // Deleta todas as aulas criadas pelo usuário
    await Aula.deleteMany({ criadoPor: id });

    return res.status(200).json({
      mensagem: 'Usuário e avatar removidos com sucesso'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
};

export const aprovarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id)
      .select("+tokenAtivacaoSenha +tokenAtivacaoExpira");

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


export const aprovacaoAutomatica = async (
  _req: Request,
  res: Response
) => {
  try {
    const config = await SistemaConfig.findOne();

    if (!config?.aprovacaoAutomaticaUsuarios) {
      return res.status(403).json({
        erro: 'Aprovação automática desabilitada'
      });
    }

    const usuariosPendentes = await Usuario.find({
      status: 'PENDENTE'
    }).select('+tokenAtivacaoSenha +tokenAtivacaoExpira');

    let aprovados = 0;
    let ignorados = 0;

    const tarefas: Promise<void>[] = [];

    for (const usuario of usuariosPendentes) {

      if (
        usuario.tokenAtivacaoSenha &&
        usuario.tokenAtivacaoExpira &&
        usuario.tokenAtivacaoExpira > new Date()
      ) {
        ignorados++;
        continue;
      }

      const token = crypto.randomBytes(32).toString('hex');

      usuario.status = 'APROVADO';
      usuario.tokenAtivacaoSenha = token;
      usuario.tokenAtivacaoExpira = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      await usuario.save();

      const linkAtivacao =
        `${process.env.FRONTEND_URL}/ativar-senha?token=${token}`;

      tarefas.push(
        emailService.enviarAtivacaoSenha(
          usuario.email,
          usuario.nome,
          linkAtivacao
        )
      );

      aprovados++;
    }

    await Promise.allSettled(tarefas);

    return res.status(200).json({
      mensagem: 'Aprovação automática concluída',
      aprovados,
      ignorados
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      erro: 'Erro ao aprovar usuários'
    });
  }
};

