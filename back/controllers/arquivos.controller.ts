import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import Usuario from "../models/usuarios.model";
import Aula from "../models/aulas.model";
import { AuthRequest } from "../types/AuthRequest";

/* =========================
   Helper: extrai public_id da URL do Cloudinary
   Exemplo:
   https://res.cloudinary.com/.../avatars/abc123.jpg
   -> public_id = avatars/abc123
   ========================= */
const extractPublicIdFromUrl = (url: string) => {
  // Remove query params caso exista ?v=...
  const cleanUrl = url.split("?")[0];

  // Pega a parte após "/upload/"
  const afterUpload = cleanUrl.split("/upload/")[1];

  // Remove a versão "v123456789/" se existir
  const withoutVersion = afterUpload.replace(/^v\d+\//, "");

  // Remove extensão do arquivo
  const withoutExt = withoutVersion.split(".")[0];

  return withoutExt; // ex: avatars/abc123
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

    // salvar no usuário
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
   DELETE AVATAR (APENAS URL)
   ========================= */
export const deleteAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ erro: "url é obrigatória" });

    const public_id = extractPublicIdFromUrl(url);

    // Deleta do Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // remove do usuário
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
   UPLOAD IMAGEM AULA
   ========================= */
export const uploadImagemAula = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const { aulaId } = req.body;

    if (!file) return res.status(400).json({ erro: "Arquivo não enviado" });
    if (!aulaId) return res.status(400).json({ erro: "aulaId é obrigatório" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "aulas",
    });

    // Atualiza a aula com a nova imagem
    aula.imagem = {
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
   DELETE IMAGEM AULA (APENAS URL)
   ========================= */
export const deleteImagemAula = async (req: AuthRequest, res: Response) => {
  try {
    const { url, aulaId } = req.body;

    if (!url) return res.status(400).json({ erro: "url é obrigatória" });
    if (!aulaId) return res.status(400).json({ erro: "aulaId é obrigatório" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const public_id = extractPublicIdFromUrl(url);

    // Deleta do Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Remove a imagem do documento da aula
    aula.imagem = { url: "" };
    await aula.save();

    return res.status(200).json({ message: "Imagem de aula deletada com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar arquivo" });
  }
};
