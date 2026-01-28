import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import cloudinary from "../config/cloudinary";
import { Aula, SiteConfig } from "../models/aulas.model";

/* ============================
   Função auxiliar para validar cor hex
   ============================ */
const isValidHex = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

/* ============================
   LISTAR AULAS
   ============================ */
export const listarAulas = async (_req: Request, res: Response) => {
  try {
    const aulas = await Aula.find().sort({ ordem: 1, createdAt: 1 });
    return res.status(200).json(aulas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar aulas" });
  }
};

/* ============================
   BUSCAR AULA POR ID
   ============================ */
export const buscarAulaPorId = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(id);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    return res.status(200).json(aula);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar aula" });
  }
};

/* ============================
   CRIAR AULA
   ============================ */
export const criarAula = async (req: Request, res: Response) => {
  try {
    const { titulo, descricao, publicada, conteudos } = req.body;
    const criadoPor: Types.ObjectId = (req as any).user?.id;

    if (!titulo || !descricao || !criadoPor) {
      return res.status(400).json({ erro: "Campos obrigatórios não preenchidos" });
    }

    const conteudosFormatados = Array.isArray(conteudos)
      ? conteudos.map((c: any) => ({
          tipo: c.tipo || "texto",
          titulo: c.titulo || "",
          descricao: c.descricao || "",
          texto: c.texto || "",
          codigo: c.codigo || "",
          video: c.video || "",
          imagem: c.imagem || { url: "" },
          exercicio: Array.isArray(c.exercicio) ? c.exercicio : [],
          ordem: c.ordem ?? 0,
          backgroundColor: c.backgroundColor || "#ffffff",
          textColor: c.textColor || "#000000",
          criadoPor,
          criadoPorUsername: (req as any).user?.username || "",
        }))
      : [];

    const novaAula = await Aula.create({
      titulo,
      descricao,
      publicada: publicada ?? false,
      criadoPor,
      conteudos: conteudosFormatados,
    });

    return res.status(201).json(novaAula);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao criar aula" });
  }
};

/* ============================
   ATUALIZAR AULA
   ============================ */
export const atualizarAula = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ erro: "ID inválido" });

    const { titulo, descricao, publicada, conteudos } = req.body;

    const aula = await Aula.findById(id);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    if (titulo !== undefined) aula.titulo = titulo;
    if (descricao !== undefined) aula.descricao = descricao;
    if (publicada !== undefined) aula.publicada = publicada;

    if (Array.isArray(conteudos)) {
      conteudos.forEach((c: any) => {
        if (c._id) {
          const conteudo = aula.conteudos.id(c._id);
          if (conteudo) {
            conteudo.tipo = c.tipo ?? conteudo.tipo;
            conteudo.titulo = c.titulo ?? conteudo.titulo;
            conteudo.descricao = c.descricao ?? conteudo.descricao;
            conteudo.texto = c.texto ?? conteudo.texto;
            conteudo.codigo = c.codigo ?? conteudo.codigo;
            conteudo.video = c.video ?? conteudo.video;
            conteudo.imagem = c.imagem ?? conteudo.imagem;
            conteudo.exercicio = Array.isArray(c.exercicio) ? c.exercicio : conteudo.exercicio;
            conteudo.ordem = c.ordem ?? conteudo.ordem;
            conteudo.backgroundColor = c.backgroundColor ?? conteudo.backgroundColor;
            conteudo.textColor = c.textColor ?? conteudo.textColor;
          }
        } else {
          aula.conteudos.push({
            tipo: c.tipo || "texto",
            titulo: c.titulo || "",
            descricao: c.descricao || "",
            texto: c.texto || "",
            codigo: c.codigo || "",
            video: c.video || "",
            imagem: c.imagem || { url: "" },
            exercicio: Array.isArray(c.exercicio) ? c.exercicio : [],
            ordem: c.ordem ?? 0,
            backgroundColor: c.backgroundColor || "#ffffff",
            textColor: c.textColor || "#000000",
            criadoPor: aula.criadoPor,
            criadoPorUsername: (req as any).user?.username || "",
          });
        }
      });
    }

    await aula.save();
    return res.status(200).json(aula);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar aula" });
  }
};

/* ============================
   DELETAR AULA COM IMAGENS NO CLOUDINARY
   ============================ */
export const deletarAula = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ erro: "ID inválido" });

    const aula = await Aula.findById(id);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    for (const conteudo of aula.conteudos) {
      if (conteudo.imagem?.url) {
        try {
          const url = conteudo.imagem.url;
          const public_id = url.split("/upload/")[1].split(".")[0].replace(/^v\d+\//, "");
          await cloudinary.uploader.destroy(public_id);
        } catch (err) {
          console.error("Erro ao deletar imagem no Cloudinary:", err);
        }
      }
    }

    await Aula.findByIdAndDelete(id);
    return res.status(200).json({ mensagem: "Aula e imagens deletadas com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar aula" });
  }
};

