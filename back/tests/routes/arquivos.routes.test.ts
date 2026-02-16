// tests/routes/arquivos.routes.test.ts

import request from "supertest";
import express, { Request, Response, NextFunction } from "express";

import arquivosRoutes from "../../routes/arquivos.routes";

/* =========================
   Mocks dos controllers
   ========================= */
jest.mock("../../controllers/arquivos.controller", () => ({
  uploadAvatar: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  deleteAvatar: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  uploadImagemConteudo: jest.fn((req: Request, res: Response) =>
    res.status(200).json({ ok: true })
  ),

  deleteImagemConteudo: jest.fn((req: Request, res: Response) =>
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

jest.mock("../../middlewares/arquivos", () => ({
  upload: {
    single: (_field: string) => (
      _req: Request,
      _res: Response,
      next: NextFunction
    ) => next()
  }
}));

describe("arquivos.routes", () => {
  const app = express();

  app.use(express.json());
  app.use("/arquivos", arquivosRoutes);

  test("POST /arquivos/avatar/upload", async () => {
    const res = await request(app)
      .post("/arquivos/avatar/upload")
      .attach("file", Buffer.from("fake"), "test.png");

    expect(res.status).toBe(200);
  });

  test("DELETE /arquivos/avatar/delete", async () => {
    const res = await request(app).delete("/arquivos/avatar/delete");

    expect(res.status).toBe(200);
  });

  test("POST /arquivos/aula/upload", async () => {
    const res = await request(app)
      .post("/arquivos/aula/upload")
      .attach("file", Buffer.from("fake"), "test.png");

    expect(res.status).toBe(200);
  });

  test("DELETE /arquivos/aula/delete", async () => {
    const res = await request(app).delete("/arquivos/aula/delete");

    expect(res.status).toBe(200);
  });
});