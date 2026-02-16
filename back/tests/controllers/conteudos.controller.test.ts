import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  listarConteudos,
  adicionarConteudo,
  atualizarConteudo,
  deletarConteudo,
} from "../../controllers/conteudos.controller";
import { Aula } from "../../models/aulas.model";

jest.mock("../../models/aulas.model");

describe("conteudos.controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();

    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });

    req = { params: {}, body: {} };
    res = { status: status as any };
  });

  /* ============================
     LISTAR CONTEÚDOS
  ============================ */
  describe("listarConteudos", () => {
    it("retorna 400 se aulaId inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);
      req.params = { aulaId: "x" };
      await listarConteudos(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ erro: "ID inválido" });
    });

    it("retorna 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);
      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      await listarConteudos(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ erro: "Aula não encontrada" });
    });

    it("lista conteúdos corretamente", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock = { conteudos: [{ titulo: "A" }] };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);
      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      await listarConteudos(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(aulaMock.conteudos);
    });

    it("retorna 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockRejectedValue(new Error());
      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      await listarConteudos(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ erro: "Erro ao listar conteúdos" });
    });

    it("aceita aulaId como array", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue({ conteudos: [] });
      req.params = { aulaId: ["507f1f77bcf86cd799439011"] };
      await listarConteudos(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(200);
    });
  });

  /* ============================
     ADICIONAR CONTEÚDO
  ============================ */
  describe("adicionarConteudo", () => {
    it("retorna 400 se aulaId inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);
      req.params = { aulaId: "x" };
      await adicionarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    it("retorna 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);
      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      await adicionarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });

    it("adiciona conteúdo corretamente com cores válidas", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock: any = { conteudos: [], save: jest.fn() };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      req.body = { titulo: "Teste", backgroundColor: "#ff0000", textColor: "#000000", exercicio: [] };
      (req as any).user = { id: "user1", username: "lucas" };

      await adicionarConteudo(req as Request, res as Response);

      expect(aulaMock.conteudos.length).toBe(1);
      expect(aulaMock.save).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(201);
    });

    it("usa cores padrão quando inválidas", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock: any = { conteudos: [], save: jest.fn() };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      req.body = { backgroundColor: "inv", textColor: "inv" };

      await adicionarConteudo(req as Request, res as Response);

      const conteudo = aulaMock.conteudos[0];
      expect(conteudo.backgroundColor).toBe("#ffffff");
      expect(conteudo.textColor).toBe("#000000");
    });

    it("fallback criadoPorUsername vazio", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock: any = { conteudos: [], save: jest.fn() };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      req.body = { titulo: "Teste" };
      (req as any).user = { id: "user1" }; // sem username

      await adicionarConteudo(req as Request, res as Response);
      expect(aulaMock.conteudos[0].criadoPorUsername).toBe("");
    });

    it("retorna 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockRejectedValue(new Error());
      req.params = { aulaId: "507f1f77bcf86cd799439011" };
      await adicionarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ erro: "Erro ao adicionar conteúdo" });
    });
  });

  /* ============================
     ATUALIZAR CONTEÚDO
  ============================ */
  describe("atualizarConteudo", () => {
    it("retorna 400 se algum id inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);
      req.params = { aulaId: "x", conteudoId: "y" };
      await atualizarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    it("retorna 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);
      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      await atualizarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });

    it("retorna 404 se conteúdo não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(null) } };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);
      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      await atualizarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });

    it("atualiza conteúdo corretamente", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const conteudoMock: any = { titulo: "old", backgroundColor: "#fff" };
      const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }, save: jest.fn() };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      req.body = { titulo: "novo", backgroundColor: "#ff0000" };

      await atualizarConteudo(req as Request, res as Response);

      expect(conteudoMock.titulo).toBe("novo");
      expect(conteudoMock.backgroundColor).toBe("#ff0000");
      expect(aulaMock.save).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(200);
    });

    it("conteudoId como array", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const conteudoMock: any = { titulo: "old" };
      const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }, save: jest.fn() };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: ["507f1f77bcf86cd799439011"], conteudoId: ["507f1f77bcf86cd799439012"] };
      req.body = { titulo: "novo" };

      await atualizarConteudo(req as Request, res as Response);
      expect(conteudoMock.titulo).toBe("novo");
      expect(status).toHaveBeenCalledWith(200);
    });

    it("retorna 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockRejectedValue(new Error());
      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      await atualizarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  /* ============================
     DELETAR CONTEÚDO
  ============================ */
  describe("deletarConteudo", () => {
    it("retorna 400 se algum id inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);
      req.params = { aulaId: "x", conteudoId: "y" };
      await deletarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });

    it("retorna 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);
      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      await deletarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });

    it("retorna 404 se conteúdo não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(null) } };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);
      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      await deletarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(404);
    });

    it("deleta conteúdo corretamente", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue({ _id: "x" }), pull: jest.fn() }, save: jest.fn() };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      await deletarConteudo(req as Request, res as Response);

      expect(aulaMock.conteudos.pull).toHaveBeenCalled();
      expect(aulaMock.save).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(200);
    });

    it("conteudoId como array", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue({ _id: "x" }), pull: jest.fn() }, save: jest.fn() };
      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: ["507f1f77bcf86cd799439011"], conteudoId: ["507f1f77bcf86cd799439012"] };
      await deletarConteudo(req as Request, res as Response);

      expect(aulaMock.conteudos.pull).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(200);
    });

    it("retorna 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockRejectedValue(new Error());
      req.params = { aulaId: "507f1f77bcf86cd799439011", conteudoId: "507f1f77bcf86cd799439012" };
      await deletarConteudo(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(500);
    });
  });
});