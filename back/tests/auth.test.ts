import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import Usuario from "../models/usuarios.model";
import bcrypt from "bcryptjs";

// MOCK do captcha
jest.mock("../utils/reCaptcha", () => ({
  __esModule: true,
  default: jest.fn((token: string) => {
    return token === "fake-captcha";
  }),
}));

// MOCK do middleware auth
jest.mock("../middlewares/auth", () => ({
  __esModule: true,
  auth: (req: any, res: any, next: any) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    req.user = {
      id: req.headers["x-user-id"] || "1234567890abcdef12345678"
    };
    next();
  },
}));

// MOCK do jwt (para garantir que não precise do segredo real)
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token-fake"),
  verify: jest.fn(() => ({ id: "1234567890abcdef12345678" })),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Usuario.deleteMany({});
});

describe("Auth Routes - Cobertura Completa", () => {

  // =========================
  // LOGIN
  // =========================
  it("POST /login - sucesso (sem 2FA)", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);

    await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "APROVADO",
      doisFatoresAtivo: false,
      tentativasLogin: 0,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "lucas@teste.com",
        senha: "Senha@123",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("POST /login - falha por falta de email/senha", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@a.com" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Email e senha são obrigatórios");
  });

  it("POST /login - credenciais inválidas", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);

    await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "APROVADO",
      doisFatoresAtivo: false,
      tentativasLogin: 0,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "lucas@teste.com",
        senha: "SenhaErrada",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toContain("Credenciais inválidas");
  });

  it("POST /login - captcha inválido", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);

    await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "APROVADO",
      doisFatoresAtivo: false,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "lucas@teste.com",
        senha: "Senha@123",
        captchaToken: "invalid-captcha",
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toContain("Captcha inválido");
  });

  it("POST /login - usuário não aprovado", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);

    await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "PENDENTE",
      doisFatoresAtivo: false,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "lucas@teste.com",
        senha: "Senha@123",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(403);
    expect(res.body.erro).toContain("Usuário ainda não aprovado");
  });

  it("POST /login - bloqueio por muitas tentativas", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);

    await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "APROVADO",
      doisFatoresAtivo: false,
      tentativasLogin: 5,
      bloqueioLoginExpira: new Date(Date.now() + 10 * 60000),
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "lucas@teste.com",
        senha: "Senha@123",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(429);
    expect(res.body.erro).toContain("Muitas tentativas");
  });

  it("POST /login - sucesso com 2FA", async () => {
    const senhaHash = await bcrypt.hash("Senha@123", 10);

    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      senha: senhaHash,
      status: "APROVADO",
      doisFatoresAtivo: true,
      tentativasLogin: 0,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "lucas@teste.com",
        senha: "Senha@123",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Código de verificação enviado");
    expect(res.body.usuarioId).toBe(usuario._id.toString());
  });

  // =========================
  // CONFIRMAR CÓDIGO
  // =========================
  it("POST /confirmar-codigo - sucesso", async () => {
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      codigo2FA: "123456",
      codigo2FAExpira: new Date(Date.now() + 600000),
      tentativas2FA: 0,
    });

    const res = await request(app)
      .post("/api/auth/confirmar-codigo")
      .send({
        usuarioId: usuario._id,
        codigo: "123456",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("POST /confirmar-codigo - usuário não encontrado", async () => {
    const res = await request(app)
      .post("/api/auth/confirmar-codigo")
      .send({
        usuarioId: "000000000000000000000000",
        codigo: "123456",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(404);
    expect(res.body.erro).toContain("Usuário não encontrado");
  });

  it("POST /confirmar-codigo - captcha inválido", async () => {
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      codigo2FA: "123456",
      codigo2FAExpira: new Date(Date.now() + 600000),
    });

    const res = await request(app)
      .post("/api/auth/confirmar-codigo")
      .send({
        usuarioId: usuario._id,
        codigo: "123456",
        captchaToken: "invalid-captcha",
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toContain("Captcha inválido");
  });

  it("POST /confirmar-codigo - código inválido ou expirado", async () => {
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      codigo2FA: "123456",
      codigo2FAExpira: new Date(Date.now() - 600000),
      tentativas2FA: 0,
    });

    const res = await request(app)
      .post("/api/auth/confirmar-codigo")
      .send({
        usuarioId: usuario._id,
        codigo: "000000",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toContain("Código inválido ou expirado");
  });

  it("POST /confirmar-codigo - bloqueio por tentativas", async () => {
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      codigo2FA: "123456",
      codigo2FAExpira: new Date(Date.now() + 600000),
      tentativas2FA: 5,
      bloqueio2FAExpira: new Date(Date.now() + 10 * 60000),
    });

    const res = await request(app)
      .post("/api/auth/confirmar-codigo")
      .send({
        usuarioId: usuario._id,
        codigo: "123456",
        captchaToken: "fake-captcha",
      });

    expect(res.status).toBe(429);
    expect(res.body.erro).toContain("Muitas tentativas");
  });

  // =========================
  // LOGOUT
  // =========================
  it("POST /logout - sucesso", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "Bearer token-fake");

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Logout realizado com sucesso");
  });

  // =========================
  // 2FA
  // =========================
  it("PATCH /2fa/habilitar - sucesso", async () => {
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      doisFatoresAtivo: false,
    });

    const res = await request(app)
      .patch("/api/auth/2fa/habilitar")
      .set("Authorization", "Bearer token-fake")
      .set("x-user-id", usuario._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("2FA habilitado com sucesso");
  });

  it("PATCH /2fa/desabilitar - sucesso", async () => {
    const usuario = await Usuario.create({
      nome: "Lucas",
      email: "lucas@teste.com",
      doisFatoresAtivo: true,
    });

    const res = await request(app)
      .patch("/api/auth/2fa/desabilitar")
      .set("Authorization", "Bearer token-fake")
      .set("x-user-id", usuario._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("2FA desabilitado com sucesso");
  });

  it("PATCH /2fa/habilitar - usuário não encontrado", async () => {
    const res = await request(app)
      .patch("/api/auth/2fa/habilitar")
      .set("Authorization", "Bearer token-fake")
      .set("x-user-id", "000000000000000000000000");

    expect(res.status).toBe(404);
    expect(res.body.erro).toContain("Usuário não encontrado");
  });

  it("PATCH /2fa/habilitar - sem token", async () => {
    const res = await request(app)
      .patch("/api/auth/2fa/habilitar");

    expect(res.status).toBe(401);
  });

  it("PATCH /2fa/desabilitar - sem token", async () => {
    const res = await request(app)
      .patch("/api/auth/2fa/desabilitar");

    expect(res.status).toBe(401);
  });

});
