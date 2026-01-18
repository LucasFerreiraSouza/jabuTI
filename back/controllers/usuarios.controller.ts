import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';


import Usuario from '../models/usuarios.model';
import Aula from '../models/aulas.model';

import { emailService } from '../utils/emailService';
import { validarSenhaForte } from '../utils/senha';

import validateCaptcha from '../utils/reCaptcha';




const usuarioSafeSelect =
  '-senha -codigo2FA -codigo2FAExpira -tentativas2FA -tokenAtivacaoSenha -tokenAtivacaoExpira -tentativasLogin -bloqueioLoginExpira';


/* =====================================================
   LISTAR TODOS OS USUÁRIOS (ADMIN)
   ===================================================== */
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.find().select(usuarioSafeSelect);
    return res.status(200).json(usuarios);
  } catch {
    return res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};


/* =====================================================
   BUSCAR USUÁRIO POR ID (ADMIN)
   ===================================================== */
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


/* =====================================================
   CRIAR USUÁRIO (ADMIN)
   Uso interno / seeds / testes
   ===================================================== */
export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, role = 'ESTUDANTE', status = 'APROVADO' } =
      req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Nome, email e senha são obrigatórios'
      });
    }

    // validação forte
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



/* =====================================================
   ATUALIZAR USUÁRIO (ADMIN)
   ===================================================== */
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

/* =====================================================
   DELETAR USUÁRIO (ADMIN)
   ===================================================== */
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

/* =====================================================
   LOGIN – ETAPA 1 (EMAIL + SENHA)
   ===================================================== */
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

    // ✅ BLOQUEIO POR TENTATIVAS (LOGIN)
    const agora = new Date();

    if (usuario.bloqueioLoginExpira && usuario.bloqueioLoginExpira > agora) {
      const minutos = Math.ceil(
        (usuario.bloqueioLoginExpira.getTime() - agora.getTime()) / 60000
      );

      return res.status(429).json({
        erro: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).`
      });
    }

    // Captcha validado apenas após passar pelo bloqueio
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

    // ✅ resetar tentativas após sucesso (senha correta)
    usuario.tentativasLogin = 0;
    usuario.bloqueioLoginExpira = undefined;
    await usuario.save();

    if (usuario.status !== 'APROVADO') {
      return res.status(403).json({ erro: 'Usuário ainda não aprovado' });
    }

    /* =====================
       LOGIN SEM 2FA
       ===================== */
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

    /* =====================
       LOGIN COM 2FA
       ===================== */

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

/* =====================================================
   LOGIN – ETAPA 2 (2FA)
   ===================================================== */
export const confirmarCodigo = async (req: Request, res: Response) => {
  try {
    const { usuarioId, codigo, captchaToken } = req.body;

    if (!usuarioId || !codigo) {
      return res.status(400).json({
        erro: 'Usuário e código são obrigatórios'
      });
    }

    const usuario = await Usuario.findById(usuarioId).select(
      '+codigo2FA +codigo2FAExpira +tentativas2FA +bloqueio2FAExpira'
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // ✅ Bloqueio 2FA (separado)
    const agora = new Date();

    // Se o bloqueio expirou, resetar
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

    // Captcha validado apenas após passar pelo bloqueio
    if (!captchaToken) {
      return res.status(400).json({ erro: 'Captcha é obrigatório' });
    }

    const captchaOk = await validateCaptcha(captchaToken);

    if (!captchaOk) {
      return res.status(401).json({ erro: 'Captcha inválido' });
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

    /* =====================
       SUCESSO
       ===================== */

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

/* =====================================================
   LOGIN – ETAPA 2 (2FA) - HABILITADO
   ===================================================== */
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


/* =====================================================
   LOGIN – ETAPA 2 (2FA) - Desabilitado
   ===================================================== */

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
    return res.status(500).json({ erro: 'Erro ao habilitar 2FA' });
  }
};


/* =====================================================
   LOGOUT JWT é stateless, logout é apenas no front-end
   ===================================================== */
export const logout = async (_req: Request, res: Response) => {
  return res.status(200).json({
    mensagem: 'Logout realizado com sucesso'
  });
};

/* =====================================================
   REGISTRO DE USUÁRIO (ESTUDANTE)
   ===================================================== */
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

    /* ✉️ email */
    await emailService.cadastroRecebido(email, nome);


    return res.status(201).json({
      mensagem: 'Cadastro realizado. Aguarde aprovação do administrador.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
};

/* =====================================================
   APROVAR USUÁRIO + ENVIAR LINK DE ATIVAÇÃO
   ===================================================== */
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


    /* =====================
       GERAR TOKEN
       ===================== */
    const token = crypto.randomBytes(32).toString('hex');

    usuario.status = 'APROVADO';
    usuario.tokenAtivacaoSenha = token;
    usuario.tokenAtivacaoExpira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

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

/* =====================================================
   ATIVAR SENHA (LINK DO EMAIL)
   ===================================================== */
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



/* =====================================================
   REPROVAR USUÁRIO (ADMIN)
   ===================================================== */
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

    await emailService.reprovado(
      usuario.email,
      usuario.nome
    );


    return res.status(200).json({
      mensagem: 'Usuário reprovado'
    });
  } catch {
    return res.status(400).json({ erro: 'Erro ao reprovar usuário' });
  }
};
/* =====================================================
   PROMOVER PARA ADMIN (ADMIN)
   ===================================================== */
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

    await emailService.promovidoAdmin(
      usuario.email,
      usuario.nome
    );


    return res.status(200).json({
      mensagem: 'Usuário promovido a administrador'
    });
  } catch {
    return res.status(400).json({ erro: 'Erro ao promover usuário' });
  }
};

/* =====================================================
   DESPROMOVER ADMIN (ADMIN)
   ===================================================== */
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

    await emailService.despromovidoAdmin(
      usuario.email,
      usuario.nome
    );

    return res.status(200).json({
      mensagem: 'Usuário despromovido para estudante'
    });
  } catch {
    return res.status(400).json({ erro: 'Erro ao despromover usuário' });
  }
};


/* =====================================================
   SOLICITAR RESET DE SENHA (EMAIL)
   ===================================================== */
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
      // NÃO vaza info
      return res.status(200).json({
        mensagem: 'Se este email existir, você receberá um link para resetar a senha.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    usuario.tokenResetSenha = token;
    usuario.resetSenhaExpira = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await usuario.save();

    const link = `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`;

    await emailService.resetSenha(usuario.email, usuario.nome, link);

    return res.status(200).json({
      mensagem: 'Se este email existir, você receberá um link para resetar a senha.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao solicitar reset de senha' });
  }
};


/* =====================================================
   RESETAR SENHA (TOKEN)
   ===================================================== */
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


/* =====================================================
   SOLICITAR TROCA DE EMAIL
   ===================================================== */
export const solicitarResetEmail = async (req: Request, res: Response) => {
  try {
    const { email, novoEmail } = req.body;

    if (!email || !novoEmail) {
      return res.status(400).json({ erro: 'Email atual e novo email são obrigatórios' });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(200).json({
        mensagem: 'Se este email existir, você receberá um link para confirmar a troca.'
      });
    }

    const emailExiste = await Usuario.findOne({ email: novoEmail });
    if (emailExiste) {
      return res.status(409).json({ erro: 'Este novo email já está em uso' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    usuario.tokenResetEmail = token;
    usuario.resetEmailExpira = new Date(Date.now() + 60 * 60 * 1000); // 1h
    usuario.novoEmail = novoEmail;

    await usuario.save();

    const link = `${process.env.FRONTEND_URL}/confirmar-email?token=${token}`;

    await emailService.resetEmail(usuario.email, usuario.nome, link, novoEmail);

    return res.status(200).json({
      mensagem: 'Se este email existir, você receberá um link para confirmar a troca.'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao solicitar troca de email' });
  }
};


/* =====================================================
   CONFIRMAR TROCA DE EMAIL (TOKEN)
   ===================================================== */
export const resetarEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ erro: 'Token é obrigatório' });
    }

    const usuario = await Usuario.findOne({
      tokenResetEmail: token,
      resetEmailExpira: { $gt: new Date() }
    }).select('+tokenResetEmail');

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
