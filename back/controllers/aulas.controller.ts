/* Importa Request e Response do Express
   Representam a requisição e a resposta HTTP */
import { Request, Response } from 'express';

/* Importa o model Aula
   Responsável por acessar a collection "aulas" */
import Aula from '../models/aulas.model';

/* ============================
   LISTAR AULAS
   ============================ */
export const listarAulas = async (_req: Request, res: Response) => {
  try {
    /* Busca todas as aulas cadastradas */
    const aulas = await Aula.find();

    /* Retorna a lista de aulas */
    return res.status(200).json(aulas);
  } catch {
    return res.status(500).json({ erro: 'Erro ao listar aulas' });
  }
};

/* ============================
   BUSCAR AULA POR ID
   ============================ */
export const buscarAulaPorId = async (req: Request, res: Response) => {
  try {
    /* Extrai o ID da URL */
    const { id } = req.params;

    /* Busca a aula no banco */
    const aula = await Aula.findById(id);

    /* Caso não exista */
    if (!aula) {
      return res.status(404).json({ erro: 'Aula não encontrada' });
    }

    /* Retorna a aula */
    return res.status(200).json(aula);
  } catch {
    return res.status(400).json({ erro: 'ID inválido' });
  }
};

/* ============================
   CRIAR AULA
   ============================ */
export const criarAula = async (req: Request, res: Response) => {
  try {
    /* Extrai os dados enviados no body */
    const {
      titulo,
      descricao,
      texto,
      video,
      codigo,
      exercicio,
      imagem,
      publicada
    } = req.body;

    // pega o usuário logado pelo token
    const criadoPor = (req as any).userId;

    /* Validação mínima
       Evita salvar aula incompleta */
    if (
      !titulo ||
      !descricao ||
      !texto ||
      !video ||
      !codigo ||
      !exercicio ||
      !imagem ||
      !criadoPor
    ) {
      return res.status(400).json({
        erro: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    /* Cria a aula no banco */
    const novaAula = await Aula.create({
      titulo,
      descricao,
      texto,
      video,
      codigo,
      exercicio,
      imagem,
      criadoPor,
      publicada
    });

    /* Retorna a aula criada */
    return res.status(201).json(novaAula);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao criar aula' });
  }
};


/* ============================
   ATUALIZAR AULA
   ============================ */
export const atualizarAula = async (req: Request, res: Response) => {
  try {
    /* Extrai o ID da URL */
    const { id } = req.params;

    /* Extrai os novos dados */
    const dadosAtualizados = req.body;

    /* Atualiza a aula e retorna o novo valor */
    const aulaAtualizada = await Aula.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true }
    );

    /* Caso não exista */
    if (!aulaAtualizada) {
      return res.status(404).json({ erro: 'Aula não encontrada' });
    }

    /* Retorna a aula atualizada */
    return res.status(200).json(aulaAtualizada);
  } catch {
    return res.status(400).json({ erro: 'Erro ao atualizar aula' });
  }
};

/* ============================
   DELETAR AULA
   ============================ */
export const deletarAula = async (req: Request, res: Response) => {
  try {
    /* Extrai o ID da URL */
    const { id } = req.params;

    /* Remove a aula do banco */
    const aulaRemovida = await Aula.findByIdAndDelete(id);

    /* Caso não exista */
    if (!aulaRemovida) {
      return res.status(404).json({ erro: 'Aula não encontrada' });
    }

    /* Retorna mensagem de sucesso */
    return res.status(200).json({
      mensagem: 'Aula removida com sucesso'
    });
  } catch {
    return res.status(500).json({ erro: 'Erro ao deletar aula' });
  }
};
