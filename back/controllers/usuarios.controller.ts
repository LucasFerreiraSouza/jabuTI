/* Importa os tipos Request e Response do Express
   Eles representam a requisição que chega e a resposta que será enviada */
import { Request, Response } from 'express';

/* Importa a lib de JWT */
import jwt from 'jsonwebtoken';

/* Importa o model de usuários
   Esse model é o responsável por conversar com o banco de dados */
import Usuario from '../models/usuarios.model';

/* ============================
   LISTAR TODOS OS USUÁRIOS
   ============================ */
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    /* Busca todos os usuários
       .select('-senha') remove a senha da resposta */
    const usuarios = await Usuario.find().select('-senha');

    return res.status(200).json(usuarios);
  } catch {
    return res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

/* ============================
   BUSCAR USUÁRIO POR ID
   ============================ */
export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id).select('-senha');

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch {
    return res.status(400).json({ erro: 'ID inválido' });
  }
};

/* ============================
   CRIAR USUÁRIO (CADASTRO)
   ============================ */
export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    /* Validação básica
       Evita spam, dados vazios e abuso da rota */
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Nome, email e senha são obrigatórios'
      });
    }

    /* Verifica se o email já existe
       Evita criação infinita do mesmo usuário */
    const usuarioExiste = await Usuario.findOne({ email });

    if (usuarioExiste) {
      return res.status(409).json({
        erro: 'Email já cadastrado'
      });
    }

    /* ⚠️ Aqui futuramente entra bcrypt
       senha: await bcrypt.hash(senha, 10) */
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha
    });

    /* Nunca retorne a senha */
    return res.status(201).json({
      id: novoUsuario._id,
      nome: novoUsuario.nome,
      email: novoUsuario.email
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
};

/* ============================
   ATUALIZAR USUÁRIO
   ============================ */
export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dadosAtualizados = req.body;

    /* Nunca permitir atualização direta da senha aqui
       (boa prática de segurança) */
    delete dadosAtualizados.senha;

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true }
    ).select('-senha');

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuarioAtualizado);
  } catch {
    return res.status(400).json({ erro: 'Erro ao atualizar usuário' });
  }
};

/* ============================
   DELETAR USUÁRIO
   ============================ */
export const deletarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuarioRemovido = await Usuario.findByIdAndDelete(id);

    if (!usuarioRemovido) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json({
      mensagem: 'Usuário removido com sucesso'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
};

/* ============================
   LOGIN DO USUÁRIO
   ============================ */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    /* Validação básica */
    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios'
      });
    }

    const usuario = await Usuario.findOne({ email });

    /* Mensagem genérica por segurança
       (não revela se o email existe) */
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      });
    }

    /* Gera token JWT */
    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });
  } catch {
    return res.status(500).json({ erro: 'Erro no login' });
  }
};

/* ============================
   LOGOUT (JWT)
   ============================ */
export const logout = async (_req: Request, res: Response) => {
  /* Em JWT o logout é feito no frontend
     apagando o token armazenado */
  return res.status(200).json({
    mensagem: 'Logout realizado com sucesso'
  });
};
