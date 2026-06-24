<h1 align="center">📋 Orcei — Gestão de Orçamentos</h1>

<p align="center">
  Aplicação web para criação e gestão de orçamentos, produtos, clientes, lojas e usuários,
  com geração de PDF e backend serverless sobre Supabase.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Angular_Material-21-757DE8?style=for-the-badge&logo=angular&logoColor=white" alt="Angular Material" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

---

## 🎯 Objetivo

O **Orcei** é uma plataforma de **orçamentos** voltada para empresas que precisam montar
propostas comerciais de forma ágil. A aplicação centraliza o cadastro de **produtos**,
**clientes**, **lojas** e **usuários**, permitindo compor orçamentos e exportá-los em
**PDF** prontos para envio ao cliente.

O sistema tem suporte multi-loja e conta com autenticação, controle de acesso por rota e um
backend serverless sobre Supabase (banco PostgreSQL + Edge Functions).

---

## ✨ Funcionalidades

- 🧾 **Orçamentos** — criação, edição e listagem de orçamentos vinculados a clientes e lojas.
- 📄 **Exportação em PDF** — geração de documentos do orçamento via `jsPDF`.
- 📦 **Produtos** — cadastro de produtos com unidade de medida, preços por lojas e código de barras.
- 👥 **Clientes** — gestão de clientes com validação de CPF/CNPJ.
- 🏬 **Lojas** — suporte multi-loja com seleção de contexto.
- 🔐 **Autenticação e usuários** — login, guards de rota e gerenciamento de usuários via Edge Functions.
- 🎭 **Máscaras de entrada** — campos formatados (moeda, documentos) com `ngx-mask`.

---

## 🛠️ Tecnologias

| Categoria        | Tecnologia                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| **Framework**    | [Angular 21](https://angular.dev) (standalone components, lazy-loaded routes)                     |
| **Linguagem**    | [TypeScript 5.9](https://www.typescriptlang.org/)                                                 |
| **UI**           | [Angular Material](https://material.angular.io/) + [Angular CDK](https://material.angular.io/cdk) |
| **Estilos**      | SCSS                                                                                              |
| **Estado/Async** | [RxJS](https://rxjs.dev/)                                                                         |
| **Backend**      | [Supabase](https://supabase.com/) (Auth, Edge Functions)                                          |
| **Banco de dados** | [PostgreSQL](https://www.postgresql.org/) (gerenciado pelo Supabase)                            |
| **PDF**          | [jsPDF](https://github.com/parallax/jsPDF)                                                        |
| **Máscaras**     | [ngx-mask](https://github.com/JsDaddy/ngx-mask)                                                   |
| **Testes**       | [Vitest](https://vitest.dev/) + [jsdom](https://github.com/jsdom/jsdom)                           |
| **Qualidade**    | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)                                  |

---

## 📁 Estrutura do projeto

```
src/app/
├── core/          # serviços, repositórios, guards, models e types do domínio
│   ├── guards/        # proteção de rotas (auth)
│   ├── models/        # modelos de domínio
│   ├── repositories/  # acesso a dados (budget, product, customer, store, user...)
│   ├── services/      # serviços compartilhados
│   └── types/         # tipos gerados do banco (database.types.ts)
├── features/      # módulos de funcionalidade (lazy-loaded)
│   ├── auth/          # autenticação
│   ├── budgets/       # orçamentos
│   ├── customers/     # clientes
│   ├── products/      # produtos
│   ├── stores/        # lojas
│   └── users/         # usuários
├── layouts/       # layouts (main, auth, container-page)
├── shared/        # componentes, pipes, validators e helpers reutilizáveis
└── global/        # estilos e temas globais

supabase/
├── functions/     # Edge Functions (register, register-user, manage-user)
└── migrations/    # migrações do banco de dados
```

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10.8.2 (gerenciador definido no projeto)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (para migrações e Edge Functions)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

As credenciais do Supabase ficam em `src/environments/`. O script `setup-env.sh` gera o arquivo
de ambiente a partir das variáveis disponíveis (útil em deploy na Vercel):

```bash
bash setup-env.sh
```

Ou crie manualmente `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  SUPABASE_URL: 'sua-url-do-supabase',
  SUPABASE_KEY: 'sua-chave-publica-do-supabase',
};
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm start
```

A aplicação ficará disponível em **http://localhost:4200/** com recarregamento automático.

---

## 📜 Scripts disponíveis

| Script                               | Descrição                                               |
| ------------------------------------ | ------------------------------------------------------- |
| `npm start`                          | Inicia o servidor de desenvolvimento (`ng serve`)       |
| `npm run build`                      | Gera a build de produção em `dist/`                     |
| `npm run watch`                      | Build em modo desenvolvimento com watch                 |
| `npm test`                           | Executa os testes unitários com Vitest                  |
| `npm run format`                     | Formata o código com Prettier                           |
| `npm run types:db`                   | Gera os tipos TypeScript a partir do schema do Supabase |
| `npm run supabase:deploy-migrations` | Aplica as migrações no banco (`supabase db push`)       |
| `npm run supabase:deploy-function`   | Faz deploy de uma Edge Function (solicita o nome)       |

---

## 🧪 Testes

Os testes unitários utilizam o **Vitest** com ambiente `jsdom`:

```bash
npm test
```

---

## 🗄️ Backend (Supabase)

O backend é totalmente serverless sobre o Supabase:

- **Banco de dados** — [PostgreSQL](https://www.postgresql.org/) provisionado e gerenciado pelo
  Supabase. É o banco relacional onde ficam persistidos orçamentos, produtos, clientes, lojas e
  usuários. Todo o schema é versionado via migrações SQL em `supabase/migrations/`, garantindo
  reprodutibilidade entre ambientes.
- **Migrações** — aplicadas com `npm run supabase:deploy-migrations` (`supabase db push`),
  mantendo o banco PostgreSQL sincronizado com o controle de versão.
- **Acesso a dados** — feito a partir do Angular pela biblioteca
  [`@supabase/supabase-js`](https://github.com/supabase/supabase-js), que conversa com a API
  gerada automaticamente sobre o PostgreSQL.
- **Edge Functions** — funções em `supabase/functions/` para fluxos de registro e
  gerenciamento de usuários (`register`, `register-user`, `manage-user`).
- **Tipagem** — os tipos TypeScript do banco PostgreSQL são gerados automaticamente em
  `src/app/core/types/database.types.ts` via `npm run types:db`, dando type-safety às consultas.

---

## 📦 Build de produção

```bash
npm run build
```

Os artefatos serão gerados em `dist/`, otimizados para performance.

---

<p align="center">Feito com Angular ⚡ e Supabase 🟢</p>
