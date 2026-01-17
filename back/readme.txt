# 🐢 jabuTI – Back-end

Back-end da aplicação **jabuTI**, desenvolvido em **Node.js + TypeScript**.

Projeto com foco em **boas práticas**, **organização de código**, **API REST**, **autenticação JWT** e **testes automatizados**, servindo tanto como aplicação funcional quanto como projeto de estudo.

---

## 🛠️ Stack

* Node.js
* TypeScript
* Express
* MongoDB (Mongoose)
* JWT (JSON Web Token)
* Dotenv
* Jest + Supertest (testes automatizados)

---

## 📁 Estrutura do projeto

```txt
back/
├── config/
│   └── db.ts               # Conexão com o banco de dados
├── controllers/            # Regras de negócio (controllers)
├── routes/                 # Definição das rotas da API
├── middlewares/            # Middlewares (ex: autenticação JWT)
├── models/                 # Models do MongoDB (Mongoose)
├── types/                  # Tipagens customizadas
├── tests/                  # Testes automatizados das rotas
│   ├── auth.test.ts
│   ├── usuarios.test.ts
│   └── aulas.test.ts
├── server.ts               # Configuração da aplicação Express
├── index.ts                # Inicialização do servidor
├── .env                    # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

---

## 🚀 Como rodar o projeto do zero

### 1️⃣ Inicializar o projeto

```bash
npm init -y
```

---

### 2️⃣ Instalar dependências

```bash
npm install express mongoose jsonwebtoken dotenv
```

---

### 3️⃣ Instalar dependências de desenvolvimento

```bash
npm install -D typescript ts-node @types/node @types/express @types/jsonwebtoken
```

---

### 4️⃣ Criar configuração do TypeScript

```bash
npx tsc --init
```

---

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env` na raiz do diretório `back`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/jabuti
JWT_SECRET=super_secreto_jabuti
```

---

## ▶️ Rodando o servidor

No `package.json`:

```json
"scripts": {
  "dev": "ts-node index.ts",
  "test": "jest"
}
```

Depois, execute:

```bash
npm run dev
```

Servidor disponível em:

```
http://localhost:3000
```

---

## 🔐 Autenticação

A API utiliza **JWT** para proteger rotas privadas.

* O token é gerado no login
* Deve ser enviado no header das requisições protegidas:

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🧪 Testes automatizados

O projeto possui **testes de integração** para validar:

* Autenticação
* CRUD de usuários
* CRUD de aulas
* Respostas HTTP e regras de negócio

### 📦 Instalação das dependências de teste

```bash
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

### ▶️ Rodar os testes

```bash
npm test
```

Os testes utilizam **Supertest** para simular requisições HTTP diretamente na aplicação Express, sem necessidade de subir o servidor manualmente.

---

## 📌 Objetivos do projeto

* Praticar arquitetura de API REST
* Aplicar TypeScript no back-end
* Implementar autenticação JWT
* Organizar código em camadas
* Criar testes automatizados de rotas
* Facilitar manutenção e escalabilidade

---

## 📄 Observações

Este projeto foi desenvolvido com fins educacionais, mas seguindo padrões utilizados em ambientes reais de produção.
