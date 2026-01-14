# 🐢 jabuTI – Back-end

Back-end da aplicação **jabuTI**, desenvolvido em **Node.js + TypeScript**.

Projeto criado com foco didático, organização de código e boas práticas básicas de API.

---

## 🛠️ Stack

- Node.js
- TypeScript
- Express
- MongoDB (Mongoose)
- JWT
- Dotenv

---

## 📁 Estrutura

```txt
back/
├── config/
│   └── db.ts
├── controllers/
├── routes/
├── middlewares/
├── server.ts
├── .env
├── package.json
└── tsconfig.json


🚀 Como rodar o projeto do zero
1️⃣ Inicializar o projeto
npm init -y

2️⃣ Instalar dependências
npm install express mongoose jsonwebtoken dotenv

3️⃣ Instalar dependências de desenvolvimento
npm install -D typescript ts-node @types/node @types/express @types/jsonwebtoken

4️⃣ Criar configuração do TypeScript
npx tsc --init

⚙️ Variáveis de ambiente

Criar um arquivo .env:

PORT=3000
MONGO_URI=mongodb://localhost:27017/jabuti
JWT_SECRET=super_secreto_jabuti

▶️ Rodar o servidor

No package.json:

"scripts": {
  "dev": "ts-node server.ts"
}


Depois:

npm run dev


Servidor:

http://localhost:3000