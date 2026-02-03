import { Request, Response } from "express";
import mongoose from "mongoose";
import { Aula } from "../models/aulas.model";

export const dashboardExercicio = async (req: Request, res: Response) => {
  try {

    const aulaId = Array.isArray(req.params.aulaId)
      ? req.params.aulaId[0]
      : req.params.aulaId!;

    const conteudoId = Array.isArray(req.params.conteudoId)
      ? req.params.conteudoId[0]
      : req.params.conteudoId!;

    const exercicioId = Array.isArray(req.params.exercicioId)
      ? req.params.exercicioId[0]
      : req.params.exercicioId!;

    const { inicio, fim, usuarioId } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(aulaId) ||
      !mongoose.Types.ObjectId.isValid(conteudoId) ||
      !mongoose.Types.ObjectId.isValid(exercicioId)
    ) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    if (usuarioId && !mongoose.Types.ObjectId.isValid(usuarioId as string)) {
      return res.status(400).json({ erro: "Usuário inválido" });
    }

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo || conteudo.tipo !== "exercicio")
      return res.status(404).json({ erro: "Conteúdo inválido" });

    const exercicio = conteudo.exercicio.id(exercicioId) as any;
    if (!exercicio)
      return res.status(404).json({ erro: "Exercício não encontrado" });

    let respostas = exercicio.respostas || [];

    // filtro por período
    if (inicio || fim) {
      const dataInicio = inicio
        ? new Date(inicio as string)
        : new Date(0);

      const dataFim = fim
        ? new Date(fim as string)
        : new Date();

      respostas = respostas.filter((r: any) => {
        const d = new Date(r.dataResposta);
        return d >= dataInicio && d <= dataFim;
      });
    }

    // ✅ filtro por aluno
    if (usuarioId) {
      respostas = respostas.filter(
        (r: any) => r.usuario.toString() === usuarioId
      );
    }

    const totalTentativas = respostas.length;

    const totalAcertos = respostas.reduce(
      (t: number, r: any) => r.correta ? t + 1 : t,
      0
    );

    const totalErros = totalTentativas - totalAcertos;

    const tempos = respostas
      .map((r: any) => r.tempoSegundos)
      .filter((t: number) => typeof t === "number" && t > 0);

    const tempoMedio =
      tempos.length > 0
        ? tempos.reduce((a: number, b: number) => a + b, 0) / tempos.length
        : 0;

    const usuariosUnicos = new Set(
      respostas.map((r: any) => r.usuario.toString())
    ).size;

    return res.status(200).json({
      totalTentativas,
      totalAcertos,
      totalErros,
      taxaAcerto:
        totalTentativas > 0
          ? (totalAcertos / totalTentativas) * 100
          : 0,
      tempoMedioSegundos: Number(tempoMedio.toFixed(2)),
      usuariosUnicos
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao gerar dashboard" });
  }
};

export const rankingExercicio = async (req: Request, res: Response) => {
  try {

    const aulaId = Array.isArray(req.params.aulaId)
      ? req.params.aulaId[0]
      : req.params.aulaId!;

    const conteudoId = Array.isArray(req.params.conteudoId)
      ? req.params.conteudoId[0]
      : req.params.conteudoId!;

    const exercicioId = Array.isArray(req.params.exercicioId)
      ? req.params.exercicioId[0]
      : req.params.exercicioId!;

    const { inicio, fim, usuarioId } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(aulaId) ||
      !mongoose.Types.ObjectId.isValid(conteudoId) ||
      !mongoose.Types.ObjectId.isValid(exercicioId)
    ) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    if (usuarioId && !mongoose.Types.ObjectId.isValid(usuarioId as string)) {
      return res.status(400).json({ erro: "Usuário inválido" });
    }

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo || conteudo.tipo !== "exercicio")
      return res.status(404).json({ erro: "Conteúdo inválido" });

    const exercicio = conteudo.exercicio.id(exercicioId) as any;
    if (!exercicio)
      return res.status(404).json({ erro: "Exercício não encontrado" });

    let respostas = exercicio.respostas || [];

    if (inicio || fim) {
      const dataInicio = inicio
        ? new Date(inicio as string)
        : new Date(0);

      const dataFim = fim
        ? new Date(fim as string)
        : new Date();

      respostas = respostas.filter((r: any) => {
        const d = new Date(r.dataResposta);
        return d >= dataInicio && d <= dataFim;
      });
    }

    const mapa: Record<string, any> = {};

    for (const r of respostas) {

      const userId = r.usuario.toString();

      if (!mapa[userId]) {
        mapa[userId] = {
          usuario: userId,
          tentativas: 0,
          acertos: 0,
          tempos: []
        };
      }

      mapa[userId].tentativas++;

      if (r.correta) {
        mapa[userId].acertos++;
      }

      if (typeof r.tempoSegundos === "number" && r.tempoSegundos > 0) {
        mapa[userId].tempos.push(r.tempoSegundos);
      }
    }

    let ranking = Object.values(mapa).map((u: any) => {

      const tempoMedio =
        u.tempos.length > 0
          ? u.tempos.reduce((a: number, b: number) => a + b, 0) / u.tempos.length
          : 0;

      return {
        usuario: u.usuario,
        tentativas: u.tentativas,
        acertos: u.acertos,
        erros: u.tentativas - u.acertos,
        taxaAcerto:
          u.tentativas > 0
            ? (u.acertos / u.tentativas) * 100
            : 0,
        tempoMedioSegundos: Number(tempoMedio.toFixed(2))
      };
    });

    ranking.sort((a: any, b: any) => {
      if (b.taxaAcerto !== a.taxaAcerto) {
        return b.taxaAcerto - a.taxaAcerto;
      }

      return a.tempoMedioSegundos - b.tempoMedioSegundos;
    });

    // ✅ se quiser apenas um aluno no retorno
    if (usuarioId) {
      ranking = ranking.filter(
        (r: any) => r.usuario === usuarioId
      );
    }

    return res.status(200).json(ranking);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao gerar ranking" });
  }
};
