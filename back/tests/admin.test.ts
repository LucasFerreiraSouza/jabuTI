import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import Usuario from "../models/usuarios.model";
import Aula from "../models/aulas.model";
import bcrypt from "bcryptjs";

// Mocks
jest.mock("../utils/emailService", () => ({
  emailService: {
    enviarAtivacaoSenha: jest.fn().mockResolvedValue(true),
    reprovado: jest.fn().mockResolvedValue(true),
    promovidoAdmin: jest.fn().mockResolvedValue(true),
    despromovidoAdmin: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock("../middlewares/auth", () => ({
  __esModule: true,
  auth: (req: any, res: any, next: any) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }
    req.user = { id: "1234567890abcdef12345678" };
    next();
  },
}));

jest.mock("../middlewares/adminOnly", () => ({
  __esModule: true,
  adminOnly: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../middlewares/rateLimit", () => ({
  __esModule: true,
  emailLimiter: (_req: any, _res: any, next: any) => next(),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Usuario.deleteMany({});
  await Aula.deleteMany({});
});

describe("Admin Routes - Cobertura Completa", () => {

  // =========================
  // AUTENTICAÇÃO
  // =========================
  it("GET /api/admin - sem token deve retornar 401", async () => {
    const res = await request(app).get("/api/admin");
    expect(res.status).toBe(401);
  });

  // =========================
  // LISTAR USUÁRIOS
  // =========================
  it("GET /api/admin - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    await Usuario.create({ nome: "Lucas", email: "lucas@teste.com", senha: senhaHash, status: "APROVADO" });

    const res = await request(app)
      .get("/api/admin")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // =========================
  // BUSCAR POR ID
  // =========================
  it("GET /api/admin/:id - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({ nome: "Lucas", email: "lucas@teste.com", senha: senhaHash, status: "APROVADO" });

    const res = await request(app)
      .get(`/api/admin/${usuario._id}`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("lucas@teste.com");
  });

  it("GET /api/admin/:id - id inválido", async () => {
    const res = await request(app)
      .get("/api/admin/123")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(400);
  });

  it("GET /api/admin/:id - não encontrado", async () => {
    const res = await request(app)
      .get("/api/admin/000000000000000000000000")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });

  // =========================
  // CRIAR USUÁRIO
  // =========================
  it("POST /api/admin - sucesso", async () => {
    const res = await request(app)
      .post("/api/admin")
      .set("Authorization", "Bearer token")
      .send({
        nome: "Lucas",
        email: "lucas@teste.com",
        senha: "Senha@123",
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("lucas@teste.com");
  });

  it("POST /api/admin - falta dados", async () => {
    const res = await request(app)
      .post("/api/admin")
      .set("Authorization", "Bearer token")
      .send({ nome: "Lucas" });

    expect(res.status).toBe(400);
  });

  it("POST /api/admin - senha fraca", async () => {
    const res = await request(app)
      .post("/api/admin")
      .set("Authorization", "Bearer token")
      .send({
        nome: "Lucas",
        email: "lucas@teste.com",
        senha: "123",
      });

    expect(res.status).toBe(400);
  });

  it("POST /api/admin - email duplicado", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    await Usuario.create({ nome: "Lucas", email: "lucas@teste.com", senha: senhaHash });

    const res = await request(app)
      .post("/api/admin")
      .set("Authorization", "Bearer token")
      .send({
        nome: "Lucas",
        email: "lucas@teste.com",
        senha: "Senha@123",
      });

    expect(res.status).toBe(409);
  });

  // =========================
  // ATUALIZAR USUÁRIO
  // =========================
  it("PUT /api/admin/:id - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({ nome: "Lucas", email: "lucas@teste.com", senha: senhaHash });

    const res = await request(app)
      .put(`/api/admin/${usuario._id}`)
      .set("Authorization", "Bearer token")
      .send({ nome: "Lucas Atualizado" });

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Lucas Atualizado");
  });

  it("PUT /api/admin/:id - não encontrado", async () => {
    const res = await request(app)
      .put("/api/admin/000000000000000000000000")
      .set("Authorization", "Bearer token")
      .send({ nome: "Lucas Atualizado" });

    expect(res.status).toBe(404);
  });

  // =========================
  // DELETAR USUÁRIO
  // =========================
  it("DELETE /api/admin/:id - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({ nome: "Lucas", email: "lucas@teste.com", senha: senhaHash });

    const res = await request(app)
      .delete(`/api/admin/${usuario._id}`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
  });

  it("DELETE /api/admin/:id - não encontrado", async () => {
    const res = await request(app)
      .delete("/api/admin/000000000000000000000000")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });

  // =========================
  // APROVAR USUÁRIO
  // =========================
  it("PATCH /api/admin/:id/aprovar - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "PENDENTE",
    });

    const res = await request(app)
      .patch(`/api/admin/${usuario._id}/aprovar`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
  });

  it("PATCH /api/admin/:id/aprovar - usuário já aprovado", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "APROVADO",
    });

    const res = await request(app)
      .patch(`/api/admin/${usuario._id}/aprovar`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(400);
  });

  it("PATCH /api/admin/:id/aprovar - já existe token válido", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "PENDENTE",
      tokenAtivacaoSenha: "token",
      tokenAtivacaoExpira: new Date(Date.now() + 1000000),
    });

    const res = await request(app)
      .patch(`/api/admin/${usuario._id}/aprovar`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(400);
  });

  it("PATCH /api/admin/:id/aprovar - usuário não encontrado", async () => {
    const res = await request(app)
      .patch("/api/admin/000000000000000000000000/aprovar")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });

  // =========================
  // REPROVAR USUÁRIO
  // =========================
  it("PATCH /api/admin/:id/reprovar - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "PENDENTE",
    });

    const res = await request(app)
      .patch(`/api/admin/${usuario._id}/reprovar`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
  });

  it("PATCH /api/admin/:id/reprovar - usuário não encontrado", async () => {
    const res = await request(app)
      .patch("/api/admin/000000000000000000000000/reprovar")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });

  // =========================
  // PROMOVER ADMIN
  // =========================
  it("PATCH /api/admin/:id/promover-admin - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "APROVADO",
    });

    const res = await request(app)
      .patch(`/api/admin/${usuario._id}/promover-admin`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
  });

  it("PATCH /api/admin/:id/promover-admin - usuário não encontrado", async () => {
    const res = await request(app)
      .patch("/api/admin/000000000000000000000000/promover-admin")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });

  // =========================
  // DESPROMOVER ADMIN
  // =========================
  it("PATCH /api/admin/:id/despromover-admin - sucesso", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      role: "ADMIN",
    });

    const res = await request(app)
      .patch(`/api/admin/${usuario._id}/despromover-admin`)
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
  });

  it("PATCH /api/admin/:id/despromover-admin - usuário não encontrado", async () => {
    const res = await request(app)
      .patch("/api/admin/000000000000000000000000/despromover-admin")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
  });
});
