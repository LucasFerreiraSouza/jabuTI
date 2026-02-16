// tests/routes/personalizaveis.routes.test.ts

import request from "supertest";
import express, { Request, Response, NextFunction } from "express";

import personalizaveisRoutes from "../../routes/personalizaveis.routes";

/* =========================
   Mocks dos controllers
   ========================= */
jest.mock("../../controllers/personalizaveis.controller", () => ({
  alterarBackgroundAula: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  alterarTextAula: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  alterarOrdemAula: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  alterarBackgroundConteudo: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  alterarTextConteudo: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  alterarOrdemConteudo: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  alterarBackgroundSite: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  alterarTextColorSite: jest.fn((req: Request, res: Response) =>
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

describe("personalizaveis.routes", () => {
  const app = express();

  app.use(express.json());
  app.use("/personalizaveis", personalizaveisRoutes);

  test("PATCH /personalizaveis/aula/:aulaId/background", async () => {
    const res = await request(app)
      .patch("/personalizaveis/aula/1/background")
      .send({ color: "#000" });

    expect(res.status).toBe(200);
  });

  test("PATCH /personalizaveis/aula/:aulaId/text", async () => {
    const res = await request(app)
      .patch("/personalizaveis/aula/1/text")
      .send({ color: "#fff" });

    expect(res.status).toBe(200);
  });

  test("PATCH /personalizaveis/aula/:aulaId/ordem", async () => {
    const res = await request(app)
      .patch("/personalizaveis/aula/1/ordem")
      .send({ ordem: 2 });

    expect(res.status).toBe(200);
  });

  test("PATCH /personalizaveis/aula/:aulaId/conteudo/:conteudoId/background", async () => {
    const res = await request(app)
      .patch("/personalizaveis/aula/1/conteudo/2/background")
      .send({ color: "#123" });

    expect(res.status).toBe(200);
  });

  test("PATCH /personalizaveis/aula/:aulaId/conteudo/:conteudoId/text", async () => {
    const res = await request(app)
      .patch("/personalizaveis/aula/1/conteudo/2/text")
      .send({ color: "#456" });

    expect(res.status).toBe(200);
  });

  test("PATCH /personalizaveis/aula/:aulaId/conteudo/:conteudoId/ordem", async () => {
    const res = await request(app)
      .patch("/personalizaveis/aula/1/conteudo/2/ordem")
      .send({ ordem: 3 });

    expect(res.status).toBe(200);
  });

  test("PATCH /personalizaveis/site/background", async () => {
    const res = await request(app)
      .patch("/personalizaveis/site/background")
      .send({ color: "#999" });

    expect(res.status).toBe(200);
  });

  test("PATCH /personalizaveis/site/text", async () => {
    const res = await request(app)
      .patch("/personalizaveis/site/text")
      .send({ color: "#111" });

    expect(res.status).toBe(200);
  });
});