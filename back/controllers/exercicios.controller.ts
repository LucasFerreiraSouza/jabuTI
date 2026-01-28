import { Request, Response } from "express";
import mongoose from "mongoose";
import { Aula } from "../models/aulas.model";

/* ============================
   LISTAR EXERCÍCIOS
============================ */
export const listarExercicios = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId!;
    const conteudoId = Array.isArray(req.params.conteudoId) ? req.params.conteudoId[0] : req.params.conteudoId!;

    if (!mongoose.Types.ObjectId.isValid(aulaId) || !mongoose.Types.ObjectId.isValid(conteudoId))
      return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });
    if (conteudo.tipo !== "exercicio") return res.status(400).json({ erro: "Conteúdo não é do tipo exercício" });

    return res.status(200).json(conteudo.exercicio);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar exercícios" });
  }
};

/* ============================
   ADICIONAR EXERCÍCIO
============================ */
export const adicionarExercicio = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId!;
    const conteudoId = Array.isArray(req.params.conteudoId) ? req.params.conteudoId[0] : req.params.conteudoId!;

    if (!mongoose.Types.ObjectId.isValid(aulaId) || !mongoose.Types.ObjectId.isValid(conteudoId))
      return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });
    if (conteudo.tipo !== "exercicio") return res.status(400).json({ erro: "Conteúdo não é do tipo exercício" });

    const e = req.body;
    if (!e.pergunta || !Array.isArray(e.alternativas) || typeof e.respostaCorreta !== "number") {
      return res.status(400).json({ erro: "Campos obrigatórios do exercício não preenchidos ou inválidos" });
    }

    conteudo.exercicio.push({
      pergunta: e.pergunta,
      alternativas: e.alternativas,
      respostaCorreta: e.respostaCorreta,
      acertos: 0,
      erros: 0,
      tempoLimiteSegundos: e.tempoLimiteSegundos || 0,
      respostas: [] // inicializa o array de respostas individuais
    });

    await aula.save();
    return res.status(201).json(conteudo.exercicio);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao adicionar exercício" });
  }
};

/* ============================
   DELETAR EXERCÍCIO
============================ */
export const deletarExercicio = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId!;
    const conteudoId = Array.isArray(req.params.conteudoId) ? req.params.conteudoId[0] : req.params.conteudoId!;
    const exercicioId = Array.isArray(req.params.exercicioId) ? req.params.exercicioId[0] : req.params.exercicioId!;

    if (!mongoose.Types.ObjectId.isValid(aulaId) ||
        !mongoose.Types.ObjectId.isValid(conteudoId) ||
        !mongoose.Types.ObjectId.isValid(exercicioId))
      return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });
    if (conteudo.tipo !== "exercicio") return res.status(400).json({ erro: "Conteúdo não é do tipo exercício" });

    conteudo.exercicio.pull(exercicioId);

    await aula.save();
    return res.status(200).json({ mensagem: "Exercício removido com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar exercício" });
  }
};

/* ============================
   RESPONDER EXERCÍCIO (Mantendo histórico)
============================ */
export const responderExercicio = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId!;
    const conteudoId = Array.isArray(req.params.conteudoId) ? req.params.conteudoId[0] : req.params.conteudoId!;
    const exercicioId = Array.isArray(req.params.exercicioId) ? req.params.exercicioId[0] : req.params.exercicioId!;
    const usuarioId = req.body.usuarioId;
    const { respostaEscolhida, tempoSegundos } = req.body;

    if (!usuarioId) return res.status(400).json({ erro: "Usuário não fornecido" });

    if (!mongoose.Types.ObjectId.isValid(aulaId) ||
        !mongoose.Types.ObjectId.isValid(conteudoId) ||
        !mongoose.Types.ObjectId.isValid(exercicioId) ||
        !mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });
    if (conteudo.tipo !== "exercicio") return res.status(400).json({ erro: "Conteúdo não é do tipo exercício" });

    const exercicio = conteudo.exercicio.id(exercicioId) as any;
    if (!exercicio) return res.status(404).json({ erro: "Exercício não encontrado" });

    const correta = respostaEscolhida === exercicio.respostaCorreta;

    // Sempre adiciona uma nova resposta ao histórico
    exercicio.respostas.push({
      usuario: usuarioId,
      correta,
      tempoSegundos: tempoSegundos || 0,
    });

    // Recalcula totais de acertos e erros
    exercicio.acertos = exercicio.respostas.filter((r: any) => r.correta).length;
    exercicio.erros = exercicio.respostas.filter((r: any) => !r.correta).length;

    await aula.save();

    return res.status(200).json({
      resultado: correta ? "acertou" : "errou",
      acertos: exercicio.acertos,
      erros: exercicio.erros,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao responder exercício" });
  }
};
