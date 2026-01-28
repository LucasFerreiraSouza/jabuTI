import { Request, Response } from "express";
import mongoose from "mongoose";
import { Aula, SiteConfig } from "../models/aulas.model";

/* ============================
   FUNÇÃO AUXILIAR PARA NORMALIZAR ID
============================ */
const getId = (param?: string | string[]) => {
  if (!param) return null;
  return Array.isArray(param) ? param[0] : param;
};

/* ============================
   ALTERAR BACKGROUND DA AULA
============================ */
export const alterarBackgroundAula = async (req: Request, res: Response) => {
  try {
    const aulaId = getId(req.params.aulaId);
    const { cor } = req.body;

    if (!aulaId || !mongoose.Types.ObjectId.isValid(aulaId)) 
      return res.status(400).json({ erro: "ID inválido" });
    if (!cor) return res.status(400).json({ erro: "Cor não fornecida" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    aula.backgroundColor = cor;
    await aula.save();

    return res.status(200).json({ mensagem: "Background da aula alterado", backgroundColor: cor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar background da aula" });
  }
};

/* ============================
   ALTERAR BACKGROUND DO CONTEÚDO
============================ */
export const alterarBackgroundConteudo = async (req: Request, res: Response) => {
  try {
    const aulaId = getId(req.params.aulaId);
    const conteudoId = getId(req.params.conteudoId);
    const { cor } = req.body;

    if (!aulaId || !conteudoId || 
        !mongoose.Types.ObjectId.isValid(aulaId) || 
        !mongoose.Types.ObjectId.isValid(conteudoId)) 
      return res.status(400).json({ erro: "ID inválido" });

    if (!cor) return res.status(400).json({ erro: "Cor não fornecida" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });

    conteudo.backgroundColor = cor;
    await aula.save();

    return res.status(200).json({ mensagem: "Background do conteúdo alterado", backgroundColor: cor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar background do conteúdo" });
  }
};

/* ============================
   ALTERAR TEXT COLOR DA AULA
============================ */
export const alterarTextAula = async (req: Request, res: Response) => {
  try {
    const aulaId = getId(req.params.aulaId);
    const { cor } = req.body;

    if (!aulaId || !mongoose.Types.ObjectId.isValid(aulaId)) 
      return res.status(400).json({ erro: "ID inválido" });
    if (!cor) return res.status(400).json({ erro: "Cor não fornecida" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    aula.textColor = cor;
    await aula.save();

    return res.status(200).json({ mensagem: "Text color da aula alterado", textColor: cor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar text color da aula" });
  }
};

/* ============================
   ALTERAR TEXT COLOR DO CONTEÚDO
============================ */
export const alterarTextConteudo = async (req: Request, res: Response) => {
  try {
    const aulaId = getId(req.params.aulaId);
    const conteudoId = getId(req.params.conteudoId);
    const { cor } = req.body;

    if (!aulaId || !conteudoId || 
        !mongoose.Types.ObjectId.isValid(aulaId) || 
        !mongoose.Types.ObjectId.isValid(conteudoId)) 
      return res.status(400).json({ erro: "ID inválido" });

    if (!cor) return res.status(400).json({ erro: "Cor não fornecida" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });

    conteudo.textColor = cor;
    await aula.save();

    return res.status(200).json({ mensagem: "Text color do conteúdo alterado", textColor: cor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar text color do conteúdo" });
  }
};

/* ============================
   ALTERAR ORDEM DA AULA
============================ */
export const alterarOrdemAula = async (req: Request, res: Response) => {
  try {
    const aulaId = getId(req.params.aulaId);
    const { ordem } = req.body;

    if (!aulaId || !mongoose.Types.ObjectId.isValid(aulaId)) 
      return res.status(400).json({ erro: "ID inválido" });
    if (typeof ordem !== "number") return res.status(400).json({ erro: "Ordem inválida" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    aula.ordem = ordem;
    await aula.save();

    return res.status(200).json({ mensagem: "Ordem da aula alterada", ordem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar ordem da aula" });
  }
};

/* ============================
   ALTERAR ORDEM DO CONTEÚDO
============================ */
export const alterarOrdemConteudo = async (req: Request, res: Response) => {
  try {
    const aulaId = getId(req.params.aulaId);
    const conteudoId = getId(req.params.conteudoId);
    const { ordem } = req.body;

    if (!aulaId || !conteudoId || 
        !mongoose.Types.ObjectId.isValid(aulaId) || 
        !mongoose.Types.ObjectId.isValid(conteudoId)) 
      return res.status(400).json({ erro: "ID inválido" });

    if (typeof ordem !== "number") return res.status(400).json({ erro: "Ordem inválida" });

    const aula = await Aula.findById(aulaId);
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });

    const conteudo = aula.conteudos.id(conteudoId) as any;
    if (!conteudo) return res.status(404).json({ erro: "Conteúdo não encontrado" });

    conteudo.ordem = ordem;
    await aula.save();

    return res.status(200).json({ mensagem: "Ordem do conteúdo alterada", ordem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar ordem do conteúdo" });
  }
};

/* ============================
   ALTERAR CORES GLOBAIS DO SITE
============================ */
export const alterarBackgroundSite = async (req: Request, res: Response) => {
  try {
    const { backgroundColor, textColor } = req.body;

    if (!backgroundColor && !textColor) 
      return res.status(400).json({ erro: "Nenhuma cor fornecida" });

    const config = await SiteConfig.findOne();
    if (!config) {
      // cria se não existir
      const novoConfig = new SiteConfig({ 
        backgroundColorSite: backgroundColor || "#f0f0f0",
        textColorSite: textColor || "#000000",
      });
      await novoConfig.save();
      return res.status(200).json({ mensagem: "Cores do site alteradas", config: novoConfig });
    }

    if (backgroundColor) config.backgroundColorSite = backgroundColor;
    if (textColor) config.textColorSite = textColor;
    await config.save();

    return res.status(200).json({ mensagem: "Cores do site alteradas", config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar cores do site" });
  }
};

/* ============================
   ALTERAR TEXT COLOR GLOBAL DO SITE
============================ */
export const alterarTextColorSite = async (req: Request, res: Response) => {
  try {
    const { textColor } = req.body;

    if (!textColor) 
      return res.status(400).json({ erro: "textColor não fornecido" });

    const config = await SiteConfig.findOne();
    if (!config) {
      // cria se não existir
      const novoConfig = new SiteConfig({ 
        textColorSite: textColor,
      });
      await novoConfig.save();
      return res.status(200).json({ mensagem: "Text color global do site alterado", config: novoConfig });
    }

    config.textColorSite = textColor;
    await config.save();

    return res.status(200).json({ mensagem: "Text color global do site alterado", config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar text color global do site" });
  }
};
