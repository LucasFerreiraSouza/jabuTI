import { Response } from "express";
import cloudinary from "../config/cloudinary";
import Usuario from "../models/usuarios.model";
import { Aula } from "../models/aulas.model";
import { AuthRequest } from "../types/AuthRequest";

/* =========================
   Helper: extrai public_id da URL do Cloudinary
========================= */
const extractPublicIdFromUrl = (url: string) => {
  const cleanUrl = url.split("?")[0];

  if (!cleanUrl.includes("/upload/")) {
    throw new Error("URL inválida do Cloudinary");
  }

  const afterUpload = cleanUrl.split("/upload/")[1];

  const withoutVersion = afterUpload.replace(/^v\d+\//, "");

  const withoutExt = withoutVersion.replace(/\.[^/.]+$/, "");

  return withoutExt;
};

/* =========================
   UPLOAD AVATAR
========================= */
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ erro: "Arquivo não enviado" });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "avatars",
    });

    await Usuario.findByIdAndUpdate(req.user?.id, {
      avatar: {
        url: result.secure_url,
      },
    });

    return res.status(201).json({
      url: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao enviar arquivo" });
  }
};

/* =========================
   DELETE AVATAR
========================= */
export const deleteAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ erro: "url é obrigatória" });
    }

    const public_id = extractPublicIdFromUrl(url);

    await cloudinary.uploader.destroy(public_id);

    await Usuario.findByIdAndUpdate(req.user?.id, {
      $unset: { avatar: "" },
    });

    return res.status(200).json({ message: "Avatar deletado com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar arquivo" });
  }
};

/* =========================
   UPLOAD IMAGEM EM CONTEÚDO DE AULA
========================= */
export const uploadImagemConteudo = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const { aulaId, conteudoId } = req.body;

    if (!file) return res.status(400).json({ erro: "Arquivo não enviado" });
    if (!aulaId) return res.status(400).json({ erro: "aulaId é obrigatório" });
    if (!conteudoId) return res.status(400).json({ erro: "conteudoId é obrigatório" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId);
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "aulas",
    });

    conteudo.imagem = {
      url: result.secure_url,
    };

    await aula.save();

    return res.status(201).json({
      url: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao enviar arquivo" });
  }
};

/* =========================
   DELETE IMAGEM EM CONTEÚDO DE AULA
========================= */
export const deleteImagemConteudo = async (req: AuthRequest, res: Response) => {
  try {
    const { url, aulaId, conteudoId } = req.body;

    if (!aulaId) return res.status(400).json({ erro: "aulaId é obrigatório" });
    if (!conteudoId) return res.status(400).json({ erro: "conteudoId é obrigatório" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId);
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });

    // se não tiver url salva, só limpa no banco
    if (url) {
      const public_id = extractPublicIdFromUrl(url);
      await cloudinary.uploader.destroy(public_id);
    }

    // remove a imagem do conteúdo
    conteudo.imagem = undefined as any;

    await aula.save();

    return res.status(200).json({
      message: "Imagem de conteúdo removida com sucesso",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar arquivo" });
  }
};
