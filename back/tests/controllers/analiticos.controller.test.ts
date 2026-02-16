import { Response } from "express";
import mongoose from "mongoose";

import { Aula } from "../../models/aulas.model";
import {
  dashboardExercicio,
  rankingExercicio
} from "../../controllers/analiticos.controller";

jest.mock("../../models/aulas.model");

describe("dashboard.controller", () => {

  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    req = {
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ======================================================
  // dashboardExercicio
  // ======================================================

  test("deve retornar 400 se algum id for inválido", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

    req.params = {
      aulaId: "1",
      conteudoId: "2",
      exercicioId: "3"
    };

    await dashboardExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 400 se usuarioId for inválido", async () => {
    jest
      .spyOn(mongoose.Types.ObjectId, "isValid")
      .mockImplementation((id: any) => id !== "usuarioInvalido");

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    req.query = {
      usuarioId: "usuarioInvalido"
    };

    await dashboardExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 404 se aula não existir", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    (Aula.findById as jest.Mock).mockResolvedValue(null);

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await dashboardExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve retornar 404 se conteúdo for inválido", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    const aulaMock = {
      conteudos: {
        id: jest.fn().mockReturnValue(null)
      }
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await dashboardExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve retornar 404 se exercício não existir", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    const conteudoMock = {
      tipo: "exercicio",
      exercicio: {
        id: jest.fn().mockReturnValue(null)
      }
    };

    const aulaMock = {
      conteudos: {
        id: jest.fn().mockReturnValue(conteudoMock)
      }
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await dashboardExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve retornar o dashboard corretamente", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    const exercicioMock = {
      respostas: [
        {
          correta: true,
          tempoSegundos: 10,
          usuario: { toString: () => "u1" },
          dataResposta: new Date()
        },
        {
          correta: false,
          tempoSegundos: 20,
          usuario: { toString: () => "u2" },
          dataResposta: new Date()
        },
        {
          correta: true,
          tempoSegundos: 30,
          usuario: { toString: () => "u1" },
          dataResposta: new Date()
        }
      ]
    };

    const conteudoMock = {
      tipo: "exercicio",
      exercicio: {
        id: jest.fn().mockReturnValue(exercicioMock)
      }
    };

    const aulaMock = {
      conteudos: {
        id: jest.fn().mockReturnValue(conteudoMock)
      }
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await dashboardExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalTentativas: 3,
        totalAcertos: 2,
        totalErros: 1,
        usuariosUnicos: 2
      })
    );
  });

  test("deve retornar 500 se ocorrer erro no dashboard", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    (Aula.findById as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await dashboardExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ======================================================
  // rankingExercicio
  // ======================================================

  test("deve retornar 400 se algum id for inválido no ranking", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await rankingExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar 404 se aula não existir no ranking", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    (Aula.findById as jest.Mock).mockResolvedValue(null);

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await rankingExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve retornar 404 se conteúdo não existir no ranking", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    const aulaMock = {
      conteudos: {
        id: jest.fn().mockReturnValue(null)
      }
    };

    (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await rankingExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deve retornar 404 se exercício não existir no ranking", async () => {
  jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

  const conteudoMock = {
    tipo: "exercicio",
    exercicio: {
      id: jest.fn().mockReturnValue(null)
    }
  };

  const aulaMock = {
    conteudos: {
      id: jest.fn().mockReturnValue(conteudoMock)
    }
  };

  (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

  req.params = {
    aulaId: "aula",
    conteudoId: "conteudo",
    exercicioId: "exercicio"
  };

  await rankingExercicio(req, res as Response);

  expect(res.status).toHaveBeenCalledWith(404);
});

  test("deve gerar ranking corretamente", async () => {
  jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

  const exercicioMock = {
    respostas: [
      {
        correta: true,
        tempoSegundos: 10,
        usuario: { toString: () => "u1" },
        dataResposta: new Date()
      },
      {
        correta: false,
        tempoSegundos: 20,
        usuario: { toString: () => "u1" },
        dataResposta: new Date()
      },
      {
        correta: true,
        tempoSegundos: 5,
        usuario: { toString: () => "u2" },
        dataResposta: new Date()
      }
    ]
  };

  const exerciciosArray: any = [];
  exerciciosArray.id = jest.fn().mockReturnValue(exercicioMock);

  const conteudoMock = {
    exercicio: exerciciosArray
  };

  const aulaMock = {
    conteudos: {
      id: jest.fn().mockReturnValue(conteudoMock)
    }
  };

  (Aula.findById as jest.Mock).mockResolvedValue(aulaMock);

  req.params = {
    aulaId: "aula",
    conteudoId: "conteudo",
    exercicioId: "exercicio"
  };

  await rankingExercicio(req, res as Response);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(expect.any(Array));
});

  test("deve retornar 500 se ocorrer erro no ranking", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    (Aula.findById as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    req.params = {
      aulaId: "aula",
      conteudoId: "conteudo",
      exercicioId: "exercicio"
    };

    await rankingExercicio(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});