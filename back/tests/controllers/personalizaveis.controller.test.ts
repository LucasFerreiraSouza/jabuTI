/* ============================
   TESTES DE ERROS E SUCESSO - 100% COVERAGE
============================ */
import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  alterarBackgroundAula,
  alterarBackgroundConteudo,
  alterarTextAula,
  alterarTextConteudo,
  alterarOrdemAula,
  alterarOrdemConteudo,
  alterarBackgroundSite,
  alterarTextColorSite
} from "../../controllers/personalizaveis.controller";

import { Aula, SiteConfig } from "../../models/aulas.model";

// Mock dos models
jest.mock("../../models/aulas.model");

// Helper para mockar Response
function mockResponse(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
}

describe("Controllers de cores, textos e ordem - 100% coverage", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const invalidId = "123";
  const validId = () => new mongoose.Types.ObjectId().toString();

  /* -----------------------
     alterarBackgroundAula
  ----------------------- */
  it("400 se aulaId inválido", async () => {
    const req = { params: { aulaId: invalidId }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundAula(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 se cor não fornecida", async () => {
    const req = { params: { aulaId: validId() }, body: {} } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundAula(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 se aula não encontrada", async () => {
    (Aula.findById as any).mockResolvedValue(null);
    const req = { params: { aulaId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundAula(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("500 se Aula.findById lançar erro", async () => {
    (Aula.findById as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { params: { aulaId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundAula(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera background corretamente", async () => {
    const aulaMock: any = { backgroundColor: "#000", save: jest.fn().mockResolvedValue(true) };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundAula(req, res);
    expect(aulaMock.backgroundColor).toBe("#fff");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* -----------------------
     alterarTextAula
  ----------------------- */
  it("400 se text não fornecido", async () => {
    const req = { params: { aulaId: validId() }, body: {} } as unknown as Request;
    const res = mockResponse();
    await alterarTextAula(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 se aula não encontrada para text", async () => {
    (Aula.findById as any).mockResolvedValue(null);
    const req = { params: { aulaId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextAula(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("500 se Aula.findById lançar erro para text", async () => {
    (Aula.findById as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { params: { aulaId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextAula(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera text corretamente", async () => {
    const aulaMock: any = { textColor: "#000", save: jest.fn().mockResolvedValue(true) };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextAula(req, res);
    expect(aulaMock.textColor).toBe("#fff");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* -----------------------
     alterarBackgroundConteudo
  ----------------------- */
  it("400 se IDs inválidos", async () => {
    const req = { params: { aulaId: invalidId, conteudoId: invalidId }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 se cor não fornecida no conteúdo", async () => {
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: {} } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 se aula não encontrada no conteúdo", async () => {
    (Aula.findById as any).mockResolvedValue(null);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("404 se conteúdo não encontrado", async () => {
    const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(null) }, save: jest.fn() };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("500 se Aula.findById lançar erro para conteúdo", async () => {
    (Aula.findById as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera background do conteúdo corretamente", async () => {
    const conteudoMock: any = { backgroundColor: "#000" };
    const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }, save: jest.fn().mockResolvedValue(true) };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundConteudo(req, res);
    expect(conteudoMock.backgroundColor).toBe("#fff");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* -----------------------
     alterarTextConteudo
  ----------------------- */
  it("400 se IDs inválidos no text do conteúdo", async () => {
    const req = { params: { aulaId: invalidId, conteudoId: invalidId }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 se cor não fornecida no text do conteúdo", async () => {
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: {} } as unknown as Request;
    const res = mockResponse();
    await alterarTextConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 se aula não encontrada no text do conteúdo", async () => {
    (Aula.findById as any).mockResolvedValue(null);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("404 se conteúdo não encontrado no text do conteúdo", async () => {
    const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(null) }, save: jest.fn() };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("500 se Aula.findById lançar erro no text do conteúdo", async () => {
    (Aula.findById as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera text do conteúdo corretamente", async () => {
    const conteudoMock: any = { textColor: "#000" };
    const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }, save: jest.fn().mockResolvedValue(true) };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextConteudo(req, res);
    expect(conteudoMock.textColor).toBe("#fff");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* -----------------------
     alterarOrdemAula
  ----------------------- */
  it("400 se ordem inválida", async () => {
    const req = { params: { aulaId: validId() }, body: { ordem: "abc" } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemAula(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 se aula não encontrada para ordem", async () => {
    (Aula.findById as any).mockResolvedValue(null);
    const req = { params: { aulaId: validId() }, body: { ordem: 1 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemAula(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("500 se Aula.findById lançar erro na ordem da aula", async () => {
    (Aula.findById as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { params: { aulaId: validId() }, body: { ordem: 1 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemAula(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera ordem corretamente", async () => {
    const aulaMock: any = { ordem: 0, save: jest.fn().mockResolvedValue(true) };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId() }, body: { ordem: 2 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemAula(req, res);
    expect(aulaMock.ordem).toBe(2);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* -----------------------
     alterarOrdemConteudo
  ----------------------- */
  it("400 se IDs inválidos na ordem do conteúdo", async () => {
    const req = { params: { aulaId: invalidId, conteudoId: invalidId }, body: { ordem: 1 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 se ordem inválida no conteúdo", async () => {
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { ordem: "abc" } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 se aula não encontrada no conteúdo", async () => {
    (Aula.findById as any).mockResolvedValue(null);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { ordem: 1 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("404 se conteúdo não encontrado na ordem", async () => {
    const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(null) }, save: jest.fn() };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { ordem: 1 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("500 se Aula.findById lançar erro na ordem do conteúdo", async () => {
    (Aula.findById as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { ordem: 1 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemConteudo(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera ordem do conteúdo corretamente", async () => {
    const conteudoMock: any = { ordem: 0 };
    const aulaMock: any = { conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }, save: jest.fn().mockResolvedValue(true) };
    (Aula.findById as any).mockResolvedValue(aulaMock);
    const req = { params: { aulaId: validId(), conteudoId: validId() }, body: { ordem: 3 } } as unknown as Request;
    const res = mockResponse();
    await alterarOrdemConteudo(req, res);
    expect(conteudoMock.ordem).toBe(3);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* -----------------------
     alterarBackgroundSite
  ----------------------- */
  it("400 se cor não fornecida para site", async () => {
    const req = { body: {} } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundSite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("500 se SiteConfig.findOne lançar erro", async () => {
    (SiteConfig.findOne as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundSite(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera background site existente", async () => {
    const configMock: any = { backgroundColorSite: "#000", save: jest.fn().mockResolvedValue(true) };
    (SiteConfig.findOne as any).mockResolvedValue(configMock);
    const req = { body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundSite(req, res);
    expect(configMock.backgroundColorSite).toBe("#fff");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("200 cria nova config ao alterar background site se não existir", async () => {
    (SiteConfig.findOne as any).mockResolvedValue(null);
    const saveMock = jest.fn().mockResolvedValue(true);
    const constructorMock = jest.fn().mockImplementation(() => ({ save: saveMock }));
    (SiteConfig as any).mockImplementation(constructorMock);

    const req = { body: { cor: "#123456" } } as unknown as Request;
    const res = mockResponse();
    await alterarBackgroundSite(req, res);
    expect(constructorMock).toHaveBeenCalledWith({
      backgroundColorSite: "#123456",
      textColorSite: "#000000"
    });
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* -----------------------
     alterarTextColorSite
  ----------------------- */
  it("400 se cor não fornecida para text site", async () => {
    const req = { body: {} } as unknown as Request;
    const res = mockResponse();
    await alterarTextColorSite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("500 se SiteConfig.findOne lançar erro no text site", async () => {
    (SiteConfig.findOne as any).mockRejectedValue(new Error("Erro inesperado"));
    const req = { body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextColorSite(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("200 altera text color site existente", async () => {
    const configMock: any = { textColorSite: "#000", save: jest.fn().mockResolvedValue(true) };
    (SiteConfig.findOne as any).mockResolvedValue(configMock);
    const req = { body: { cor: "#fff" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextColorSite(req, res);
    expect(configMock.textColorSite).toBe("#fff");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("200 cria nova config ao alterar text site se não existir", async () => {
    (SiteConfig.findOne as any).mockResolvedValue(null);
    const saveMock = jest.fn().mockResolvedValue(true);
    const constructorMock = jest.fn().mockImplementation(() => ({ save: saveMock }));
    (SiteConfig as any).mockImplementation(constructorMock);

    const req = { body: { cor: "#123456" } } as unknown as Request;
    const res = mockResponse();
    await alterarTextColorSite(req, res);
    expect(constructorMock).toHaveBeenCalledWith({
      backgroundColorSite: "#f0f0f0",
      textColorSite: "#123456"
    });
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

});
