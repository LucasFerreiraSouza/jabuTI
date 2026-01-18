import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import Usuario from "../models/usuarios.model";

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

describe("Cadastro Routes", () => {

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

  it("POST /resetar-email - deve resetar email com token", async () => {
  // 1) cria usuário
  await Usuario.create({
    nome: "Lucas",
    email: "velho@email.com",
    senha: "123456",
    role: "ESTUDANTE",
    status: "APROVADO",
  });

  // 2) solicita troca de email (gera token)
  await request(app)
    .post("/api/cadastro/solicitar-reset-email")
    .send({
      email: "velho@email.com",
      novoEmail: "novo@email.com",
    });

  // 3) pega token no banco (IMPORTANTE: buscar pelo email antigo!)
  const usuarioAtualizado = await Usuario.findOne({
    email: "velho@email.com",
  }).select("+tokenResetEmail +novoEmail");

  const token = usuarioAtualizado?.tokenResetEmail;

  // DEBUG (se quiser ver no console)
  console.log("TOKEN:", token);
  console.log("NOVO EMAIL:", usuarioAtualizado?.novoEmail);

  expect(token).toBeDefined();

  // 4) chamar resetar-email
  const res = await request(app)
    .post("/api/cadastro/resetar-email")
    .send({ token });

  expect(res.status).toBe(200);
  expect(res.body.mensagem).toContain("Email alterado");
});



});
