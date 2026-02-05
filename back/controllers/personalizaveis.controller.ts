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
   ALTERAR BACKGROUND GLOBAL DO SITE
============================ */
export const alterarBackgroundSite = async (req: Request, res: Response) => {
  try {
    const { cor } = req.body;

    if (!cor)
      return res.status(400).json({ erro: "cor não fornecida" });

    let config = await SiteConfig.findOne();

    if (!config) {
      config = new SiteConfig({
        backgroundColorSite: cor,
        textColorSite: "#000000"
      });

      await config.save();

      return res.status(200).json({
        mensagem: "Background global do site alterado",
        config
      });
    }

    config.backgroundColorSite = cor;
    await config.save();

    return res.status(200).json({
      mensagem: "Background global do site alterado",
      config
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar background global do site" });
  }
};



/* ============================
   ALTERAR TEXT COLOR GLOBAL DO SITE
============================ */
export const alterarTextColorSite = async (req: Request, res: Response) => {
  try {
    const { cor } = req.body;

    if (!cor)
      return res.status(400).json({ erro: "cor não fornecida" });

    let config = await SiteConfig.findOne();

    if (!config) {
      config = new SiteConfig({
        backgroundColorSite: "#f0f0f0",
        textColorSite: cor
      });

      await config.save();

      return res.status(200).json({
        mensagem: "Text color global do site alterado",
        config
      });
    }

    config.textColorSite = cor;
    await config.save();

    return res.status(200).json({
      mensagem: "Text color global do site alterado",
      config
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao alterar text color global do site" });
  }
};
