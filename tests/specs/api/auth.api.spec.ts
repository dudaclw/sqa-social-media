import { expect, test } from "@playwright/test";
import { createUser, loginUser } from "../../helpers/auth-api";
import { API_URL } from "../../helpers/environment";
import {
  generateUniqueEmail,
  STRONG_PASSWORD,
  WRONG_STRONG_PASSWORD,
} from "../../helpers/test-data";

interface UserResponse {
  id: number;
  email: string;
  password?: string;
}

interface PostResponse {
  posts: Array<{
    id: number;
    title: string;
    body: string;
    liked: boolean;
    reactions: {
      likes: number;
      dislikes: number;
    };
  }>;
}

interface ErrorResponse {
  message: string;
  status: number;
}

test.describe("API de autenticação", () => {
  test("cadastro com dados válidos retorna usuário criado", async ({
    request,
  }) => {
    const credentials = {
      email: generateUniqueEmail("qa-signup"),
      password: STRONG_PASSWORD,
    };
    const response = await request.post(`${API_URL}/auth/signup`, {
      data: credentials,
    });
    const body = (await response.json()) as UserResponse;
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: credentials.email,
      })
    );
    expect(body.id).toBeGreaterThan(0);
  });

  test("login com credenciais válidas retorna o usuário autenticado", async ({
    request,
  }) => {
    const created = await createUser(request, {
      email: generateUniqueEmail("qa-signin"),
      password: STRONG_PASSWORD,
    });
    const { response, body } = await loginUser(request, created.credentials);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(body).toEqual(
      expect.objectContaining({
        id: created.user.id,
        email: created.credentials.email,
      })
    );
    expect((body as UserResponse).id).toBeGreaterThan(0);
  });

  test("BUG CONHECIDO: cadastro duplicado retorna 409 e mensagem contratual", async ({
    request,
  }) => {
    const created = await createUser(request, {
      email: generateUniqueEmail("qa-duplicate"),
      password: STRONG_PASSWORD,
    });
    const response = await request.post(`${API_URL}/auth/signup`, {
      data: created.credentials,
    });
    const body = (await response.json()) as ErrorResponse;
    expect(response.status()).toBe(409);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(body.status).toBe(409);
    expect(body.message).toBe("E-mail já cadastrado");
  });

  test("redefinição para usuário inexistente retorna 404", async ({
    request,
  }) => {
    const email = generateUniqueEmail("qa-reset-missing");
    const response = await request.post(`${API_URL}/auth/reset-password`, {
      data: { email },
    });
    const body = (await response.json()) as ErrorResponse;
    expect(response.status()).toBe(404);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(body).toEqual({
      message: "Usuário não encontrado",
      status: 404,
    });
  });

  test("redefinição para usuário existente retorna mensagem de sucesso", async ({
    request,
  }) => {
    const created = await createUser(request, {
      email: generateUniqueEmail("qa-reset-success"),
      password: STRONG_PASSWORD,
    });
    const response = await request.post(`${API_URL}/auth/reset-password`, {
      data: { email: created.credentials.email },
    });
    const body = (await response.json()) as { message: string };
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(body).toEqual({
      message: "E-mail enviado com sucesso",
    });
  });

  test("login com senha forte incorreta retorna 401", async ({ request }) => {
    const created = await createUser(request, {
      email: generateUniqueEmail("qa-invalid-login"),
      password: STRONG_PASSWORD,
    });
    const { response, body } = await loginUser(request, {
      email: created.credentials.email,
      password: WRONG_STRONG_PASSWORD,
    });
    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(body).toEqual({
      message: "Credenciais inválidas",
      status: 401,
    });
  });
});

test.describe("API de posts", () => {
  test("/posts retorna reações com likes e dislikes", async ({ request }) => {
    const response = await request.get(`${API_URL}/posts`, {
      params: {
        limit: 1,
        skip: 0,
      },
    });
    const body = (await response.json()) as PostResponse;

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(body.posts).toHaveLength(1);
    expect(body.posts[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
        liked: false,
        reactions: {
          likes: expect.any(Number),
          dislikes: expect.any(Number),
        },
      })
    );
  });
});
