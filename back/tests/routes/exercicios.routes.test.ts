// tests/routes/exercicios.routes.test.ts

import request from "supertest";
import express, { Request, Response, NextFunction } from "express";

import exerciciosRoutes from "../../routes/exercicios.routes";

/* =========================
   Mocks dos controllers
   ========================= */
jest.mock("../../controllers/exercicios.controller", () => ({
  listarExercicios: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  adicionarExercicio: jest.fn((req: Request, res: Response) =>
    res.status(201).json({ ok: true })
  ),

  deletarExercicio: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  responderExercicio: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  )
}));

/* =========================
   Mocks dos middlewares
   ========================= */
jest.mock("../../middlewares/auth", () => ({
  auth: (req: Request, _res: Response, next: NextFunction) => {
    (req as any).user = { id: "1", role: "admin" };
    next();
  }
}));

jest.mock("../../middlewares/adminOnly", () => ({
  adminOnly: (_req: Request, _res: Response, next: NextFunction) => next()
}));

describe("exercicios.routes", () => {
  const app = express();

  app.use(express.json());
  app.use("/exercicios", exerciciosRoutes);

  test("GET /exercicios/:aulaId/:conteudoId", async () => {
    const res = await request(app).get("/exercicios/1/2");

    expect(res.status).toBe(200);
  });

  test("POST /exercicios/:aulaId/:conteudoId", async () => {
    const res = await request(app)
      .post("/exercicios/1/2")
      .send({ titulo: "Exercício teste" });

    expect(res.status).toBe(201);
  });

  test("DELETE /exercicios/:aulaId/:conteudoId/:exercicioId", async () => {
    const res = await request(app).delete("/exercicios/1/2/3");

    expect(res.status).toBe(200);
  });

  test("POST /exercicios/:aulaId/:conteudoId/:exercicioId/responder", async () => {
    const res = await request(app)
      .post("/exercicios/1/2/3/responder")
      .send({ resposta: "A" });

    expect(res.status).toBe(200);
  });
});