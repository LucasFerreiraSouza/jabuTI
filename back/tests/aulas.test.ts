import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import Aula from "../models/aulas.model";

// MOCK do auth (simula usuário logado)
jest.mock("../middlewares/auth", () => ({
  auth: (req: any, res: any, next: any) => {
    req.userId = new mongoose.Types.ObjectId().toString();
    next();
  }
}));

describe("Aulas Routes - Cobertura Completa", () => {

  afterEach(async () => {
    await Aula.deleteMany({});
  });

  // 1) GET /aulas - lista vazia
  it("GET /aulas - deve retornar lista vazia", async () => {
    const res = await request(app).get("/api/aulas");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // 2) POST /aulas - cria aula
  it("POST /aulas - deve criar aula", async () => {
    const res = await request(app)
      .post("/api/aulas")
      .send({
        titulo: "Aula 1",
        descricao: "Descrição",
        texto: "Texto",
        video: "link",
        codigo: "codigo",
        exercicio: "exercicio",
        imagem: "img.png",
        publicada: true
      });

    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe("Aula 1");
  });

  // 3) POST /aulas - falta campo obrigatório
  it("POST /aulas - deve falhar quando faltar campo obrigatório", async () => {
    const res = await request(app)
      .post("/api/aulas")
      .send({
        titulo: "Aula 1",
        descricao: "Descrição",
        texto: "Texto",
        video: "link",
        codigo: "codigo",
        exercicio: "exercicio",
        publicada: true
        // imagem faltando
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Todos os campos obrigatórios");
  });

  // 4) GET /aulas/:id - sucesso
  it("GET /aulas/:id - deve retornar aula por id", async () => {
    const aula = await Aula.create({
      titulo: "Aula 1",
      descricao: "Descrição",
      texto: "Texto",
      video: "link",
      codigo: "codigo",
      exercicio: "exercicio",
      imagem: "img.png",
      criadoPor: new mongoose.Types.ObjectId(),
      publicada: true
    });

    const res = await request(app).get(`/api/aulas/${aula._id}`);
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe("Aula 1");
  });

  // 5) GET /aulas/:id - id inválido
  it("GET /aulas/:id - id inválido", async () => {
    const res = await request(app).get(`/api/aulas/123`);
    expect(res.status).toBe(400);
  });

  // 6) GET /aulas/:id - aula não encontrada
  it("GET /aulas/:id - aula não encontrada", async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/aulas/${id}`);
    expect(res.status).toBe(404);
    expect(res.body.erro).toContain("Aula não encontrada");
  });

  // 7) PUT /aulas/:id - sucesso
  it("PUT /aulas/:id - deve atualizar aula", async () => {
    const aula = await Aula.create({
      titulo: "Aula 1",
      descricao: "Descrição",
      texto: "Texto",
      video: "link",
      codigo: "codigo",
      exercicio: "exercicio",
      imagem: "img.png",
      criadoPor: new mongoose.Types.ObjectId(),
      publicada: true
    });

    const res = await request(app)
      .put(`/api/aulas/${aula._id}`)
      .send({ titulo: "Aula Atualizada" });

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe("Aula Atualizada");
  });

  // 8) PUT /aulas/:id - id inválido
  it("PUT /aulas/:id - id inválido", async () => {
    const res = await request(app)
      .put(`/api/aulas/123`)
      .send({ titulo: "Aula Atualizada" });

    expect(res.status).toBe(400);
  });

  // 9) PUT /aulas/:id - aula não encontrada
  it("PUT /aulas/:id - aula não encontrada", async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/aulas/${id}`)
      .send({ titulo: "Aula Atualizada" });

    expect(res.status).toBe(404);
    expect(res.body.erro).toContain("Aula não encontrada");
  });

  // 10) DELETE /aulas/:id - sucesso
  it("DELETE /aulas/:id - deve deletar aula", async () => {
    const aula = await Aula.create({
      titulo: "Aula 1",
      descricao: "Descrição",
      texto: "Texto",
      video: "link",
      codigo: "codigo",
      exercicio: "exercicio",
      imagem: "img.png",
      criadoPor: new mongoose.Types.ObjectId(),
      publicada: true
    });

    const res = await request(app).delete(`/api/aulas/${aula._id}`);
    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Aula removida");
  });

  // 11) DELETE /aulas/:id - id inválido
  it("DELETE /aulas/:id - id inválido", async () => {
    const res = await request(app).delete(`/api/aulas/123`);
    expect(res.status).toBe(400);
  });

  // 12) DELETE /aulas/:id - aula não encontrada
  it("DELETE /aulas/:id - aula não encontrada", async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/aulas/${id}`);
    expect(res.status).toBe(404);
    expect(res.body.erro).toContain("Aula não encontrada");
  });

});
