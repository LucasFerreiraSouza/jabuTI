// tests/routes/conteudos.routes.test.ts

import request from "supertest";
import express, { Request, Response, NextFunction } from "express";

import conteudosRoutes from "../../routes/conteudos.routes";

/* =========================
   Mocks dos controllers
   ========================= */
jest.mock("../../controllers/conteudos.controller", () => ({
  listarConteudos: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  adicionarConteudo: jest.fn((req: Request, res: Response) =>
    res.status(201).json({ ok: true })
  ),

  atualizarConteudo: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  deletarConteudo: jest.fn((req: Request, res: Response) =>
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

describe("conteudos.routes", () => {
  const app = express();

  app.use(express.json());
  app.use("/conteudos", conteudosRoutes);

  test("GET /conteudos/:aulaId", async () => {
    const res = await request(app).get("/conteudos/123");

    expect(res.status).toBe(200);
  });

  test("POST /conteudos/:aulaId", async () => {
    const res = await request(app)
      .post("/conteudos/123")
      .send({ titulo: "Conteúdo Teste" });

    expect(res.status).toBe(201);
  });

  test("PUT /conteudos/:aulaId/:conteudoId", async () => {
    const res = await request(app)
      .put("/conteudos/123/456")
      .send({ titulo: "Conteúdo Atualizado" });

    expect(res.status).toBe(200);
  });

  test("DELETE /conteudos/:aulaId/:conteudoId", async () => {
    const res = await request(app).delete("/conteudos/123/456");

    expect(res.status).toBe(200);
  });
});