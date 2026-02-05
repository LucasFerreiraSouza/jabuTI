import { Request, Response } from "express";
import mongoose from "mongoose";
import { Aula } from "../models/aulas.model";

/* ============================
   Função auxiliar para validar cor hex
   ============================ */
const isValidHex = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

/* ============================
   LISTAR CONTEÚDOS DE UMA AULA
   ============================ */
export const listarConteudos = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId;

    if (!mongoose.Types.ObjectId.isValid(aulaId))
      return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    return res.status(200).json(aula.conteudos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar conteúdos" });
  }
};

/* ============================
   ADICIONAR CONTEÚDO A UMA AULA
   ============================ */
export const adicionarConteudo = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId;

    if (!mongoose.Types.ObjectId.isValid(aulaId))
      return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const criadoPor = (req as any).user?.id;
    const criadoPorUsername = (req as any).user?.username || "";

    const c = req.body;

    const backgroundColor = c.backgroundColor && isValidHex(c.backgroundColor)
      ? c.backgroundColor
      : "#ffffff";

    const textColor = c.textColor && isValidHex(c.textColor)
      ? c.textColor
      : "#000000";

    aula.conteudos.push({
      tipo: c.tipo || "texto",
      titulo: c.titulo || "",
      descricao: c.descricao || "",
      texto: c.texto || "",
      codigo: c.codigo || "",
      video: c.video || "",
      imagem: c.imagem || { url: "" },
      exercicio: Array.isArray(c.exercicio) ? c.exercicio : [],
      ordem: c.ordem ?? aula.conteudos.length,
      backgroundColor,
      textColor,
      criadoPor,
      criadoPorUsername,
    });

    await aula.save();
    return res.status(201).json(aula.conteudos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao adicionar conteúdo" });
  }
};

/* ============================
   ATUALIZAR CONTEÚDO DE UMA AULA
   ============================ */
export const atualizarConteudo = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId;
    const conteudoId = Array.isArray(req.params.conteudoId) ? req.params.conteudoId[0] : req.params.conteudoId;

    if (!mongoose.Types.ObjectId.isValid(aulaId) || !mongoose.Types.ObjectId.isValid(conteudoId))
      return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId);
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });

    const c = req.body;

    if (c.tipo) conteudo.tipo = c.tipo;
    if (c.titulo) conteudo.titulo = c.titulo;
    if (c.descricao) conteudo.descricao = c.descricao;
    if (c.texto) conteudo.texto = c.texto;
    if (c.codigo) conteudo.codigo = c.codigo;
    if (c.video) conteudo.video = c.video;
    if (c.imagem) conteudo.imagem = c.imagem;
    if (Array.isArray(c.exercicio)) conteudo.exercicio = c.exercicio;
    if (c.ordem !== undefined) conteudo.ordem = c.ordem;
    if (c.backgroundColor && isValidHex(c.backgroundColor)) conteudo.backgroundColor = c.backgroundColor;
    if (c.textColor && isValidHex(c.textColor)) conteudo.textColor = c.textColor;

    await aula.save();
    return res.status(200).json(conteudo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar conteúdo" });
  }
};

/* ============================
   DELETAR CONTEÚDO
   ============================ */
export const deletarConteudo = async (req: Request, res: Response) => {
  try {
    const aulaId = Array.isArray(req.params.aulaId) ? req.params.aulaId[0] : req.params.aulaId;
    const conteudoId = Array.isArray(req.params.conteudoId) ? req.params.conteudoId[0] : req.params.conteudoId;

    if (
      !mongoose.Types.ObjectId.isValid(aulaId) ||
      !mongoose.Types.ObjectId.isValid(conteudoId)
    )
      return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId);
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });

    aula.conteudos.pull({ _id: conteudoId });

    await aula.save();

    return res.status(200).json({ mensagem: "Conteúdo removido com sucesso" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar conteúdo" });
  }
};
