import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import Usuario from "../models/usuarios.model";

// MOCK do captcha
jest.mock("../utils/reCaptcha", () => ({
  __esModule: true,
  default: jest.fn((token: string) => {
    // só valida se for "fake-captcha"
    return token === "fake-captcha";
  }),
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

describe("Cadastro Routes - Cobertura Completa", () => {

  // ------------------------------
  // 1) REGISTRAR
  // ------------------------------
  it("POST /registrar - deve registrar usuário e enviar email", async () => {
    const res = await request(app)
      .post("/api/cadastro/registrar")
      .send({
        nome: "Lucas Teste",
        email: "lucas@teste.com",
        captchaToken: "fake-captcha"
      });

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toContain("Cadastro realizado");
  });

  it("POST /registrar - não deve permitir email duplicado", async () => {
    await Usuario.create({ nome: "Lucas", email: "lucas@teste.com" });

    const res = await request(app)
      .post("/api/cadastro/registrar")
      .send({
        nome: "Lucas Teste",
        email: "lucas@teste.com",
        captchaToken: "fake-captcha"
      });

    expect(res.status).toBe(409);
    expect(res.body.erro).toContain("Email já cadastrado");
  });

  it("POST /registrar - deve falhar com captcha inválido", async () => {
    const res = await request(app)
      .post("/api/cadastro/registrar")
      .send({
        nome: "Lucas Teste",
        email: "lucas2@teste.com",
        captchaToken: "invalid-captcha"
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toContain("Captcha inválido");
  });

  // ------------------------------
  // 2) ATIVAR SENHA
  // ------------------------------
  it("POST /ativar-senha/:token - deve ativar senha usando token", async () => {
    const usuario = await Usuario.create({
      nome: "Aluno Teste",
      email: "aluno@teste.com",
      role: "ESTUDANTE",
      status: "APROVADO",
      senha: null,
      tokenAtivacaoSenha: "TOKEN123",
      tokenAtivacaoExpira: new Date(Date.now() + 3600000),
    });

    const res = await request(app)
      .post(`/api/cadastro/ativar-senha/${usuario.tokenAtivacaoSenha}`)
      .send({
        token: usuario.tokenAtivacaoSenha,
        senha: "SenhaForte@123"
      });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Senha criada");
  });

  it("POST /ativar-senha/:token - token inválido ou expirado", async () => {
    const res = await request(app)
      .post("/api/cadastro/ativar-senha/INVALID_TOKEN")
      .send({
        token: "INVALID_TOKEN",
        senha: "SenhaForte@123"
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Token inválido ou expirado");
  });

  it("POST /ativar-senha/:token - token expirado", async () => {
    const usuario = await Usuario.create({
      nome: "Aluno Teste",
      email: "aluno@teste.com",
      tokenAtivacaoSenha: "TOKEN123",
      tokenAtivacaoExpira: new Date(Date.now() - 1000),
    });

    const res = await request(app)
      .post(`/api/cadastro/ativar-senha/${usuario.tokenAtivacaoSenha}`)
      .send({
        token: usuario.tokenAtivacaoSenha,
        senha: "SenhaForte@123"
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Token inválido ou expirado");
  });

  it("POST /ativar-senha/:token - senha fraca", async () => {
    const usuario = await Usuario.create({
      nome: "Aluno Teste",
      email: "aluno@teste.com",
      tokenAtivacaoSenha: "TOKEN123",
      tokenAtivacaoExpira: new Date(Date.now() + 3600000),
    });

    const res = await request(app)
      .post(`/api/cadastro/ativar-senha/${usuario.tokenAtivacaoSenha}`)
      .send({
        token: usuario.tokenAtivacaoSenha,
        senha: "123"
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Senha fraca");
  });

  // ------------------------------
  // 3) SOLICITAR RESET DE SENHA
  // ------------------------------
  it("POST /solicitar-reset-senha - deve gerar token e enviar email", async () => {
    await Usuario.create({
      nome: "Aluno Teste",
      email: "aluno@teste.com",
      role: "ESTUDANTE",
      status: "APROVADO",
      senha: "hash",
    });

    const res = await request(app)
      .post("/api/cadastro/solicitar-reset-senha")
      .send({
        email: "aluno@teste.com",
        captchaToken: "fake-captcha"
      });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Se este email existir");
  });

  it("POST /solicitar-reset-senha - captcha inválido", async () => {
    const res = await request(app)
      .post("/api/cadastro/solicitar-reset-senha")
      .send({
        email: "aluno@teste.com",
        captchaToken: "invalid-captcha"
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toContain("Captcha inválido");
  });

  // ------------------------------
  // 4) RESETAR SENHA
  // ------------------------------
  it("POST /resetar-senha - deve resetar senha com token", async () => {
    const usuario = await Usuario.create({
      nome: "Aluno Teste",
      email: "aluno@teste.com",
      role: "ESTUDANTE",
      status: "APROVADO",
      senha: "hash",
      tokenResetSenha: "TOKENRESET",
      resetSenhaExpira: new Date(Date.now() + 3600000),
    });

    const res = await request(app)
      .post("/api/cadastro/resetar-senha")
      .send({
        token: usuario.tokenResetSenha,
        senha: "NovaSenha@123"
      });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Senha redefinida");
  });

  it("POST /resetar-senha - token inválido ou expirado", async () => {
    const res = await request(app)
      .post("/api/cadastro/resetar-senha")
      .send({
        token: "INVALID",
        senha: "NovaSenha@123"
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Token inválido ou expirado");
  });

  it("POST /resetar-senha - token expirado", async () => {
    const usuario = await Usuario.create({
      nome: "Aluno Teste",
      email: "aluno@teste.com",
      tokenResetSenha: "TOKENRESET",
      resetSenhaExpira: new Date(Date.now() - 1000),
    });

    const res = await request(app)
      .post("/api/cadastro/resetar-senha")
      .send({
        token: usuario.tokenResetSenha,
        senha: "NovaSenha@123"
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Token inválido ou expirado");
  });

  // ------------------------------
  // 5) SOLICITAR RESET DE EMAIL
  // ------------------------------
  it("POST /solicitar-reset-email - deve solicitar troca de email", async () => {
    await Usuario.create({
      nome: "Aluno Teste",
      email: "aluno@teste.com",
      role: "ESTUDANTE",
      status: "APROVADO",
      senha: "hash",
    });

    const res = await request(app)
      .post("/api/cadastro/solicitar-reset-email")
      .send({
        email: "aluno@teste.com",
        novoEmail: "novo@teste.com"
      });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Se este email existir");
  });

  it("POST /solicitar-reset-email - email não existe", async () => {
    const res = await request(app)
      .post("/api/cadastro/solicitar-reset-email")
      .send({
        email: "naoexiste@teste.com",
        novoEmail: "novo@teste.com"
      });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Se este email existir");
  });

  // ------------------------------
  // 6) RESETAR EMAIL
  // ------------------------------
  it("POST /resetar-email - deve resetar email com token", async () => {
    await Usuario.create({
      nome: "Lucas",
      email: "velho@email.com",
      senha: "123456",
      role: "ESTUDANTE",
      status: "APROVADO",
    });

    await request(app)
      .post("/api/cadastro/solicitar-reset-email")
      .send({
        email: "velho@email.com",
        novoEmail: "novo@email.com",
      });

    const usuarioAtualizado = await Usuario.findOne({
      email: "velho@email.com",
    }).select("+tokenResetEmail +novoEmail");

    const token = usuarioAtualizado?.tokenResetEmail;
    expect(token).toBeDefined();

    const res = await request(app)
      .post("/api/cadastro/resetar-email")
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toContain("Email alterado");
  });

  it("POST /resetar-email - token inválido ou expirado", async () => {
    const res = await request(app)
      .post("/api/cadastro/resetar-email")
      .send({ token: "INVALID" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("Token inválido ou expirado");
  });

});
