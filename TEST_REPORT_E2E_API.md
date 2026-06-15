# Relatório de Testes Playwright - Atividade 5


## 1. Escopo e estratégia

O projeto `tests/` é independente e usa Playwright Test com TypeScript. Os
testes de API são de caixa-preta e usam `APIRequestContext` contra a API real.
Os E2E usam Chromium e exercitam frontend, API e banco sem mocks.

A estratégia de dados usa e-mails com prefixo de QA, timestamp e valor
aleatório. Cada teste prepara o próprio usuário e não depende da ordem.

## 2. Árvore final

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

## 3. Matriz de testes

| ID | Tipo | Cenário | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| API-01 | API | Cadastro válido | HTTP 200 e usuário criado | HTTP 200, id e e-mail corretos | Aprovado |
| API-02 | API | Login válido | HTTP 200 e usuário autenticado | HTTP 200, id e e-mail corretos | Aprovado |
| API-03 | API | Cadastro duplicado | HTTP 409 e `E-mail já cadastrado` | HTTP 409 e `E-mail já está em uso` | Reprovado |
| API-04 | API | Reset de usuário inexistente | HTTP 404 e `Usuário não encontrado` | Conforme esperado | Aprovado |
| API-05 | API | Login com senha incorreta | HTTP 401 e `Credenciais inválidas` | Conforme esperado | Aprovado |
| E2E-01 | E2E | Deslogado tenta curtir | Alerta, sem curtida ou navegação | Conforme esperado | Aprovado |
| E2E-02 | E2E | Cadastro, curtida e listagem | Mesmo post em `/auth/liked` | Conforme esperado | Aprovado |

Total final: **7 testes, 6 aprovados e 1 reprovado**.

## 4. Execuções

| Execução | Comando | Testes | Aprovados | Reprovados | Duração Playwright | Motivo |
|---|---|---:|---:|---:|---:|---|
| API isolada | `npx playwright test specs/api/auth.api.spec.ts` | 5 | 4 | 1 | 2,2 s | BUG-API-01 |
| E2E deslogado | `npx playwright test specs/e2e/unauthenticated-like.e2e.spec.ts` | 1 | 1 | 0 | 4,9 s | - |
| E2E cadastro headless | `npx playwright test specs/e2e/signup-like.e2e.spec.ts` | 1 | 1 | 0 | 23,6 s | - |
| E2E cadastro headed | `npx playwright test specs/e2e/signup-like.e2e.spec.ts --headed` | 1 | 1 | 0 | 12,3 s | - |
| E2E cadastro com trace | `npx playwright test specs/e2e/signup-like.e2e.spec.ts --trace on` | 1 | 1 | 0 | 9,2 s | - |
| Suíte API | `npm run test:api` | 5 | 4 | 1 | 1,3 s | BUG-API-01 |
| Suíte E2E final | `npm run test:e2e` | 2 | 2 | 0 | 6,9 s | - |
| Suíte completa final | `npm test` | 7 | 6 | 1 | 5,9 s | BUG-API-01 |

O smoke temporário foi executado isoladamente com sucesso em 6,2 s e removido
da entrega final após os dois fluxos obrigatórios estarem estáveis.

## 5. Resultado do E2E de cadastro e curtida

Dados:

- e-mail: `qa-e2e-signup-like-<timestamp>-<aleatorio>@example.com`;
- senha: forte e válida, omitida do relatório;
- contexto: novo e isolado a cada execução.

| Parte | Validação | Resultado |
|---|---|---|
| 1 | `/signup` e título `Criar Conta` | Aprovado |
| 2 | E-mail único, senha e confirmação | Aprovado |
| 3 | POST `/auth/signup`, HTTP 200 e redirecionamento `/` | Aprovado |
| 4 | `Posts Curtidos`, `Sair`, ausência de `Entrar` e feed | Aprovado |
| 5 | POST de curtida, botão `Curtido` e ausência de alerta | Aprovado |
| 6 | URL `/auth/liked` e mesmo título na listagem | Aprovado |

Não foi encontrado bug funcional neste caminho sem recarga. A autenticação
permanece no estado React durante a navegação cliente.

## 6. Bugs e problemas

| Bug | Requisito | Severidade | Teste relacionado | Evidência |
|---|---|---|---|---|
| BUG-API-01 | Cadastro duplicado deve responder `E-mail já cadastrado` | Baixa | API-03 | `test-results/.../trace.zip` e relatório HTML |
| BUG-FE-01 | Usuário salvo deve ser recuperado após recarga | Alta | Teste Jest da Atividade 4 | `client/src/lib/localStorage.ts` |
| A11Y-01 | Labels devem identificar os inputs de cadastro | Média | E2E-02 | `client/src/components/Input.tsx` |

### BUG-API-01 - Mensagem divergente no cadastro duplicado

- Pré-condição: usuário previamente cadastrado.
- Passos: repetir `POST /auth/signup` com o mesmo e-mail e senha.
- Esperado: HTTP 409 e mensagem `E-mail já cadastrado`.
- Observado: HTTP 409 e mensagem `E-mail já está em uso`.
- Classificação: bug funcional do sistema.
- Camada provável: `api/.../controller/AuthController.java`.
- Assertion: `expect(body.message).toBe("E-mail já cadastrado")`.

### BUG-FE-01 - Chaves diferentes no localStorage

- Esperado: o usuário salvo deve ser recuperado pela mesma chave.
- Observado: `saveUser` grava `user`; `getUser` lê `sqa_social_user`.
- Efeito provável: autenticação perdida após recarregar ou abrir nova sessão.
- Camada provável: `client/src/lib/localStorage.ts`.
- O bug não foi corrigido nesta atividade.

### A11Y-01 - Labels não associados

- Esperado: `label` associado ao input por `htmlFor`/`id`.
- Observado: texto visual sem associação programática.
- Impacto: `getByLabel` não funciona; leitores de tela perdem o nome do campo.
- Solução de teste: placeholder para e-mail e seletor de tipo com escopo para
  os dois campos de senha.
- Classificação: acessibilidade e testabilidade.

## 7. Classificação das ocorrências

| Ocorrência | Categoria | Tratamento |
|---|---|---|
| Mensagem de duplicidade divergente | Bug funcional | Expectativa mantida |
| Primeiro clique encontrou dois botões `Criar Conta` | Defeito no teste | Locator restringido ao `main` |
| API não conectou ao MySQL dentro do sandbox | Falha de ambiente | Execução autorizada fora do sandbox |
| Labels não associados aos campos | Acessibilidade/testabilidade | Documentado; frontend não alterado |
| DummyJSON indisponível ou lento | Instabilidade externa potencial | Não ocorreu na execução final |

Não houve falha de configuração na execução final.

## 8. Evidências

- relatório HTML: `tests/playwright-report/index.html`;
- trace do BUG-API-01: `tests/test-results/.../trace.zip`;
- contexto do BUG-API-01: `tests/test-results/.../error-context.md`;
- screenshot e trace foram confirmados durante a falha inicial do locator E2E;
- a falha final é exclusivamente de API e não possui página para screenshot ou
  vídeo;
- screenshot, vídeo e trace continuam configurados globalmente para falhas E2E.

Os diretórios de evidências são ignorados pelo Git.

## 9. Revisão técnica

- [x] projeto independente em `tests/`;
- [x] cinco testes de API e dois E2E;
- [x] helpers reutilizados;
- [x] variáveis e banco documentados;
- [x] nenhum segredo versionado;
- [x] nenhum teste depende de outro;
- [x] nenhum `waitForTimeout`;
- [x] nenhum `.skip`, `.only` ou `fixme`;
- [x] nenhum mock ou interceptação nos fluxos obrigatórios;
- [x] locators semânticos priorizados;
- [x] artefatos pesados ignorados;
- [x] API e frontend de produção não foram alterados;
- [x] testes da Atividade 4 preservados;
- [x] expectativa do bug não foi enfraquecida.

## 10. Pontos de instabilidade

- dependência externa DummyJSON no carregamento do feed;
- tempo de inicialização do Next.js na primeira execução;
- disponibilidade das portas e do MySQL;
- dados residuais no banco, mitigados por e-mails únicos;
- mudanças de texto acessível ou estrutura dos cards;
- recarga de página, que pode expor BUG-FE-01.

## 11. Roteiro da apresentação (8 a 12 minutos)

### 1. Contexto - 45 segundos

- Abrir: raiz do repositório.
- Explicar: objetivo da Atividade 5 e serviços reais envolvidos.
- Destacar: testes independentes, caixa-preta e navegador real.
- Pergunta provável: “O backend foi alterado?”
- Resposta: não; somente `tests/` e documentação foram alterados.

### 2. Atividade 4 versus Atividade 5 - 45 segundos

- Abrir: `QA_ANALYSIS.md` e `tests/README.md`.
- Explicar: Atividade 4 usa Jest/JUnit em unidades e integrações controladas;
  Atividade 5 usa HTTP real e fluxo completo no Chromium.
- Destacar: os testes anteriores foram preservados.

### 3. Estrutura e configuração - 1 minuto

- Abrir: `tests/`, `playwright.config.ts` e `.env.example`.
- Explicar: `testDir`, execução sequencial, `baseURL`, Chromium e evidências.
- Comando: `npx playwright test --list`.
- Destacar: 7 testes finais.

### 4. Dados independentes - 45 segundos

- Abrir: `helpers/test-data.ts` e `helpers/auth-api.ts`.
- Explicar: timestamp, valor aleatório, senha forte e preparação por teste.
- Destacar: nenhuma dependência entre testes ou acesso direto ao banco.

### 5. Testes de API - 1 minuto e 30 segundos

- Abrir: `specs/api/auth.api.spec.ts`.
- Comando: `npm run test:api`.
- Explicar: cadastro, login, duplicidade, reset inexistente e senha inválida.
- Destacar: 4 aprovados e 1 falha contratual real.

### 6. E2E deslogado - 1 minuto

- Abrir: `specs/e2e/unauthenticated-like.e2e.spec.ts`.
- Comando: `npx playwright test specs/e2e/unauthenticated-like.e2e.spec.ts`.
- Destacar: contexto limpo, alerta exato e estado sem curtida.

### 7. E2E cadastro e curtida - 1 minuto e 30 segundos

- Abrir: `specs/e2e/signup-like.e2e.spec.ts`.
- Comando:
  `npx playwright test specs/e2e/signup-like.e2e.spec.ts --headed`.
- Explicar: cadastro pela UI, autenticação, curtida e mesmo post em `/auth/liked`.
- Destacar: fluxo único, sem mocks e sem espera fixa.

### 8. Suíte e evidências - 1 minuto

- Comando: `npm test`.
- Abrir: `npm run report`.
- Explicar: terminal, HTML, trace, screenshot e vídeo.
- Destacar: falha de API possui trace; falhas E2E também geram mídia.

### 9. Bugs e boas práticas - 1 minuto

- Abrir: seção de bugs deste relatório.
- Explicar: BUG-API-01, BUG-FE-01 e A11Y-01.
- Destacar: expectativas corretas não foram alteradas para “ficar verde”.

### 10. Conclusão - 30 segundos

- Destacar: 5 testes de API, 2 E2E, 6 aprovados e 1 bug comprovado.
- Reforçar: dados independentes, serviços reais e evidências reproduzíveis.

## 12. Perguntas técnicas e respostas

**Qual é a diferença entre E2E e integração?**  
Integração valida a colaboração entre partes delimitadas. E2E atravessa a
aplicação como o usuário, incluindo navegador, frontend, API e persistência.

**Por que os testes de API são caixa-preta?**  
Porque enviam HTTP e validam respostas observáveis sem importar controllers,
services, repositories ou conhecer a implementação interna.

**Por que gerar e-mails únicos?**  
Para evitar colisões no banco e permitir repetição, isolamento e paralelização
futura.

**Por que um teste não deve depender de outro?**  
Dependências tornam o resultado sensível à ordem e escondem a causa real de
falhas.

**Por que evitar `waitForTimeout`?**  
Espera fixa pode ser insuficiente em máquinas lentas e desperdiça tempo em
máquinas rápidas. Assertions, respostas e URLs oferecem sincronização objetiva.

**Qual é a função do `baseURL`?**  
Centralizar a origem do frontend e permitir caminhos como `/signup`, além de
facilitar a troca de ambiente por variável.

**O que são trace, screenshot e vídeo?**  
São evidências de execução. Trace reúne ações, rede e DOM; screenshot registra
o estado visual; vídeo mostra a sequência da falha.

**Como diferenciar bug da aplicação de erro no teste?**  
Confirma-se o requisito, reproduz-se o comportamento e inspecionam-se rede e
evidências. Locator ambíguo é defeito do teste; resposta contratual divergente
é bug da aplicação.

**Por que não acessar diretamente o banco?**  
Isso acoplaria o teste à implementação, contornaria regras da aplicação e
deixaria de validar o comportamento público.

**Por que manter uma expectativa que falha?**  
Porque ela representa o requisito. Alterá-la apenas para passar ocultaria uma
divergência funcional.

**Quais riscos tornam um E2E instável?**  
Rede externa, serviços indisponíveis, dados compartilhados, seletores frágeis,
esperas fixas, animações e diferenças de desempenho.

**Por que utilizar locators semânticos?**  
Eles refletem como usuários e tecnologias assistivas encontram elementos,
reduzem acoplamento ao CSS e também revelam problemas de acessibilidade.

## 13. Checklist final

- [x] API e frontend iniciam manualmente;
- [x] banco E2E usa credenciais locais ignoradas;
- [x] Playwright e Chromium configurados;
- [x] mínimo de quatro testes de API atendido;
- [x] dois E2E obrigatórios atendidos;
- [x] headless, headed e trace executados;
- [x] suíte API, E2E e completa executadas;
- [x] bug funcional registrado sem correção;
- [x] acessibilidade documentada;
- [x] README atualizado;
- [x] roteiro e respostas preparados;
- [x] nenhum segredo ou evidência pesada preparado para commit.
