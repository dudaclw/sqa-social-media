# SQA Social Media - Testes Playwright

Projeto da Atividade 5 para testes de caixa-preta da API e fluxos
End-to-End (E2E) em navegador real.

## Objetivo

- validar contratos HTTP sem importar código interno do backend;
- validar os principais fluxos da interface com Chromium;
- criar dados independentes e repetíveis;
- manter evidências automáticas para diagnóstico;
- preservar os testes Jest e JUnit da Atividade 4.

## Estrutura

```text
tests/
├── helpers/
│   ├── auth-api.ts
│   ├── environment.ts
│   └── test-data.ts
├── specs/
│   ├── api/
│   │   └── auth.api.spec.ts
│   └── e2e/
│       ├── signup-like.e2e.spec.ts
│       └── unauthenticated-like.e2e.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```

## Pré-requisitos

- Java 17 ou superior;
- Maven Wrapper disponível em `../api/mvnw`;
- Node.js 18 ou superior;
- npm;
- MySQL ativo;
- Chromium do Playwright;
- portas `8080`, `3000` e `3306` disponíveis.

## Banco E2E

Use um banco exclusivo, sem versionar credenciais:

```sql
CREATE DATABASE IF NOT EXISTS sqa_social_media_e2e
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Crie `../api/.env.e2e` a partir de `../api/.env.e2e.example`. O arquivo local é
ignorado pelo Git e deve definir:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/sqa_social_media_e2e
SPRING_DATASOURCE_USERNAME=<usuario-local>
SPRING_DATASOURCE_PASSWORD=<senha-local>
```

Mais detalhes estão em `../ACTIVITY5_SETUP.md`.

## Instalação

```bash
cd tests
npm install
npx playwright install chromium
cp .env.example .env
```

O projeto possui dependências e configuração TypeScript próprias. API e
frontend não são iniciados automaticamente pelo Playwright.

## Variáveis

```env
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:8080
```

`tests/.env` é ignorado pelo Git. Os mesmos valores são usados como fallback.
O frontend deve possuir, em `client/.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:8080
```

## Iniciar os serviços

Terminal 1, API:

```bash
cd api
set -a
source .env.e2e
set +a
./mvnw spring-boot:run
```

Terminal 2, frontend:

```bash
cd client
npm install
npm run dev
```

Validação rápida:

```bash
curl "http://localhost:8080/posts?limit=1&skip=0"
curl -I http://localhost:3000
```

## Executar

Na pasta `tests`:

```bash
# Todos os testes
npm test

# Somente API
npm run test:api

# Somente E2E
npm run test:e2e

# Todos em navegador visível
npm run test:headed

# Interface interativa
npm run test:ui
```

Execuções isoladas:

```bash
npx playwright test specs/api/auth.api.spec.ts
npx playwright test specs/e2e/unauthenticated-like.e2e.spec.ts
npx playwright test specs/e2e/signup-like.e2e.spec.ts
npx playwright test specs/e2e/signup-like.e2e.spec.ts --headed
npx playwright test specs/e2e/signup-like.e2e.spec.ts --trace on
```

## Cenários

### API

1. cadastro com dados válidos;
2. login com credenciais válidas;
3. cadastro com e-mail duplicado;
4. redefinição de senha para usuário inexistente;
5. login com senha forte incorreta.

### E2E

1. usuário deslogado tenta curtir e recebe o alerta contratual;
2. novo usuário se cadastra, permanece autenticado, curte um post e encontra o
   mesmo título em `/auth/liked`.

Os testes geram e-mails únicos e não dependem da ordem, de mocks, de acesso
direto ao banco ou de dados criados por outro teste.

## Relatórios e evidências

```bash
npm run report
```

- relatório HTML: `playwright-report/index.html`;
- contexto, screenshots, vídeos e traces: `test-results/`;
- screenshot: somente em falhas com página;
- vídeo: retido somente em falhas com página;
- trace: retido em falhas;
- execução explícita com trace: use `--trace on`.

`playwright-report/`, `test-results/`, `.env`, vídeos, screenshots e traces são
ignorados pelo Git.

## Resultado consolidado

Execução final em 15 de junho de 2026:

```text
7 testes executados
6 aprovados
1 reprovado por bug funcional conhecido
```

A API responde HTTP 409 no cadastro duplicado, mas retorna:

```text
E-mail já está em uso
```

O requisito exige:

```text
E-mail já cadastrado
```

A expectativa foi mantida para demonstrar a divergência real.

## Limitações conhecidas

- `Input.tsx` exibe labels sem associação por `htmlFor` e `id`. O E2E usa o
  placeholder do e-mail e `input[type="password"]` com escopo controlado.
- O feed depende do serviço externo DummyJSON utilizado pela API; indisponibilidade
  externa pode afetar os E2E.
- O usuário é salvo em `localStorage` com a chave `user`, mas recuperado com
  `sqa_social_user`. O fluxo atual passa sem recarregar a página porque o estado
  React permanece em memória; uma recarga perderia a autenticação.
- Falhas exclusivas de API não possuem página para screenshot ou vídeo. Nesses
  casos o Playwright gera contexto de erro e trace.
- O sandbox local pode bloquear conexões a MySQL/localhost e a inicialização do
  Chromium. As execuções válidas foram realizadas fora dessa restrição.
