# 🐢 jabuTI – Front-end

Front-end da aplicação **jabuTI**, desenvolvido em **React + TypeScript** utilizando **Vite**.

Projeto focado em **organização de pastas**, **componentização**, **consumo de API**, **autenticação com JWT**, **SCSS Modules** e **boas práticas de front-end moderno**.

---

## 🛠️ Stack

* React
* TypeScript
* Vite
* Axios
* React Router DOM
* Context API
* SCSS Modules
* ESLint

---

## 🧱 Criação do projeto

O projeto foi inicializado utilizando o **Vite** com template **React + TypeScript**:

```bash
npm create vite@latest front -- --template react-ts
```

Após a criação:

```bash
cd front
npm install
```

---

## 📁 Estrutura do projeto

```txt
front/
├── public/
│   └── vite.svg
│
├── src/
│   ├── api/
│   │   └── http.ts
│   │
│   ├── components/
│   │   ├── AulaCard/
│   │   │   ├── AulaCard.tsx
│   │   │   ├── AulaCard.module.scss
│   │   │   └── AulaCard.test.tsx
│   │   └── Modal/
│   │       ├── Modal.tsx
│   │       ├── Modal.module.scss
│   │       └── Modal.test.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/
│   │   └── useAuth.ts
│   │
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── Login.tsx
│   │   │   ├── Login.module.scss
│   │   │   └── Login.test.tsx
│   │   └── Aulas/
│   │       ├── Aulas.tsx
│   │       ├── Aulas.module.scss
│   │       └── Aulas.test.tsx
│   │
│   ├── services/
│   │   ├── aulas.service.ts
│   │   └── usuarios.service.ts
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── global.scss
│   │
│   ├── test/
│   │   └── setup.ts
│   │
│   ├── types/
│   │   ├── aulas.type.ts
│   │   └── usuarios.type.ts
│   │
│   ├── utils/
│   │   └── storage.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── eslint.config.js
```

---

## 🚀 Como rodar o projeto

### 1️⃣ Instalar dependências

```bash
npm install
```

---

### 2️⃣ Executar em ambiente de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:5173
```

---

## 🧪 Testes (Vitest)

### Instalação

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @types/vitest
```

### Configuração

No arquivo `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

### Setup global

Crie o arquivo:

```txt
src/test/setup.ts
```

Com o conteúdo:

```ts
import '@testing-library/jest-dom';
```

### Scripts

No `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:run": "vitest run"
}
```

---

## 🔗 Integração com o back-end

O front consome a API do **jabuTI Back-end**.

Configuração do Axios:

```txt
src/api/http.ts
```

Exemplo:

```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});
```

---

## 🔐 Autenticação

* Autenticação baseada em **JWT**
* Token armazenado no **localStorage**
* Gerenciamento via **Context API**
* Hook customizado `useAuth` para acesso ao contexto

---

## 🎨 Estilização

* **SCSS Modules** para escopo local de estilos
* Estilos globais em `styles/global.scss`
* Variáveis e mixins reutilizáveis

---

## 🎯 Objetivos do projeto

* Consolidar React + TypeScript
* Aplicar arquitetura de front-end escalável
* Consumir API REST autenticada
* Trabalhar com Context API e hooks customizados
* Utilizar SCSS Modules
* Criar um projeto com padrão de mercado para portfólio

---

## 📄 Observações

Projeto desenvolvido com fins educacionais, seguindo padrões utilizados em aplicações reais.

