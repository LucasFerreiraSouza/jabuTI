import { Response } from "express";
import mongoose from "mongoose";

import {
  listarExercicios,
  adicionarExercicio,
  deletarExercicio,
  responderExercicio
} from "../../controllers/exercicios.controller";

import { Aula } from "../../models/aulas.model";

jest.mock("../../models/aulas.model");

describe("exercicios.controller", () => {

  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // ======================================================
  // listarExercicios
  // ======================================================

  describe("listarExercicios", () => {

    test("deve retornar 400 se algum id for inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      req.params = { aulaId: "1", conteudoId: "2" };

      await listarExercicios(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);

      req.params = { aulaId: "a", conteudoId: "b" };

      await listarExercicios(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 404 se conteúdo não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const aulaMock = {
        conteudos: {
          id: jest.fn().mockReturnValue(null)
        }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b" };

      await listarExercicios(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 400 se conteúdo não for do tipo exercicio", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const conteudoMock = { tipo: "texto" };

      const aulaMock = {
        conteudos: {
          id: jest.fn().mockReturnValue(conteudoMock)
        }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b" };

      await listarExercicios(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve listar exercícios corretamente", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const exercicios = [{ pergunta: "Q1" }];

      const conteudoMock = {
        tipo: "exercicio",
        exercicio: exercicios
      };

      const aulaMock = {
        conteudos: {
          id: jest.fn().mockReturnValue(conteudoMock)
        }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b" };

      await listarExercicios(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(exercicios);
    });

    test("deve retornar 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      (Aula.findById as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      req.params = { aulaId: "a", conteudoId: "b" };

      await listarExercicios(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });

  });

  // ======================================================
  // adicionarExercicio
  // ======================================================

  describe("adicionarExercicio", () => {

    test("deve retornar 400 se algum id for inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      req.params = { aulaId: "a", conteudoId: "b" };

      await adicionarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);

      req.params = { aulaId: "a", conteudoId: "b" };

      await adicionarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 404 se conteúdo não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(null) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b" };

      await adicionarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 400 se conteúdo não for do tipo exercicio", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const conteudoMock = { tipo: "texto" };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b" };

      await adicionarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 400 se campos obrigatórios forem inválidos", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const conteudoMock = {
        tipo: "exercicio",
        exercicio: []
      };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b" };
      req.body = {};

      await adicionarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve adicionar exercício corretamente", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const exercicios: any[] = [];

      const conteudoMock = {
        tipo: "exercicio",
        exercicio: exercicios
      };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) },
        save: jest.fn()
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b" };
      req.body = {
        pergunta: "P?",
        alternativas: ["A", "B"],
        respostaCorreta: 0,
        tempoLimiteSegundos: 10
      };

      await adicionarExercicio(req, res as Response);

      expect(exercicios.length).toBe(1);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("deve retornar 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      (Aula.findById as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      req.params = { aulaId: "a", conteudoId: "b" };

      await adicionarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });

  });

  // ======================================================
  // deletarExercicio
  // ======================================================

  describe("deletarExercicio", () => {

    test("deve retornar 400 se algum id for inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };

      await deletarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };

      await deletarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 404 se conteúdo não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(null) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };

      await deletarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 400 se conteúdo não for do tipo exercicio", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const conteudoMock = { tipo: "texto" };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };

      await deletarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve deletar exercício corretamente", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const pull = jest.fn();

      const conteudoMock = {
        tipo: "exercicio",
        exercicio: { pull }
      };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) },
        save: jest.fn()
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };

      await deletarExercicio(req, res as Response);

      expect(pull).toHaveBeenCalledWith("c");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("deve retornar 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      (Aula.findById as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };

      await deletarExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });

  });

  // ======================================================
  // responderExercicio
  // ======================================================

  describe("responderExercicio", () => {

    test("deve retornar 400 se usuarioId não for informado", async () => {
      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 400 se algum id for inválido", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = { usuarioId: "u", respostaEscolhida: 1 };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 400 se resposta for inválida", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = { usuarioId: "u" };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 404 se aula não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      (Aula.findById as jest.Mock).mockResolvedValue(null);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = { usuarioId: "u", respostaEscolhida: 1 };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 404 se conteúdo não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(null) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = { usuarioId: "u", respostaEscolhida: 1 };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve retornar 400 se conteúdo não for do tipo exercicio", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const conteudoMock = { tipo: "texto" };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = { usuarioId: "u", respostaEscolhida: 1 };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deve retornar 404 se exercício não existir", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const conteudoMock = {
        tipo: "exercicio",
        exercicio: { id: jest.fn().mockReturnValue(null) }
      };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) }
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = { usuarioId: "u", respostaEscolhida: 1 };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("deve responder exercício corretamente e recalcular estatísticas", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const respostas: any[] = [];

      const exercicioMock = {
        respostaCorreta: 1,
        respostas,
        acertos: 0,
        erros: 0
      };

      const exerciciosArr: any = [];
      exerciciosArr.id = jest.fn().mockReturnValue(exercicioMock);

      const conteudoMock = {
        tipo: "exercicio",
        exercicio: exerciciosArr
      };

      const aulaMock = {
        conteudos: { id: jest.fn().mockReturnValue(conteudoMock) },
        save: jest.fn()
      };

      (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = {
        usuarioId: new mongoose.Types.ObjectId().toString(),
        respostaEscolhida: 1,
        tempoSegundos: 5
      };

      await responderExercicio(req, res as Response);

      expect(respostas.length).toBe(1);
      expect(exercicioMock.acertos).toBe(1);
      expect(exercicioMock.erros).toBe(0);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("deve retornar 500 se ocorrer erro", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      (Aula.findById as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      req.params = { aulaId: "a", conteudoId: "b", exercicioId: "c" };
      req.body = {
        usuarioId: new mongoose.Types.ObjectId().toString(),
        respostaEscolhida: 1
      };

      await responderExercicio(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });

  });

});