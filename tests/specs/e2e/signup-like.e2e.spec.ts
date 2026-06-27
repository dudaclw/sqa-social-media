import { expect, test } from "@playwright/test";
import {
  generateUniqueEmail,
  STRONG_PASSWORD,
} from "../../helpers/test-data";

test.describe("Cadastro, autenticação e curtida", () => {
  test("novo usuário cria conta, curte um post e o encontra em Posts Curtidos", async ({
    browser,
  }) => {
    const email = generateUniqueEmail("qa-e2e-signup-like");
    const context = await browser.newContext();
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    const page = await context.newPage();
    let unauthenticatedDialog = "";

    page.on("dialog", async (dialog) => {
      unauthenticatedDialog = dialog.message();
      await dialog.accept();
    });

    test.info().annotations.push({
      type: "test-data",
      description: `E-mail único: ${email}; senha omitida do relatório`,
    });

    try {
      await test.step("acessar o cadastro em contexto isolado", async () => {
        const response = await page.goto("/signup");

        expect(response?.ok()).toBe(true);
        await expect(
          page.getByRole("heading", { name: "Criar Conta", level: 1 })
        ).toBeVisible();
      });

      await test.step("preencher e enviar o formulário", async () => {
        await page.getByPlaceholder("seu@email.com").fill(email);
        const passwordFields = page.locator('input[type="password"]');
        await expect(passwordFields).toHaveCount(2);
        await passwordFields.first().fill(STRONG_PASSWORD);
        await passwordFields.last().fill(STRONG_PASSWORD);

        const signupResponsePromise = page.waitForResponse(
          (response) =>
            response.url().endsWith("/auth/signup") &&
            response.request().method() === "POST"
        );

        await page
          .getByRole("main")
          .getByRole("button", { name: "Criar Conta" })
          .click();

        const signupResponse = await signupResponsePromise;
        expect(signupResponse.status()).toBe(200);
        await page.waitForURL("/");
      });

      let likedPostTitle = "";

      await test.step("validar autenticação e carregamento do feed", async () => {
        const header = page.getByRole("banner");
        await expect(
          header.getByRole("button", { name: "Posts Curtidos" })
        ).toBeVisible();
        await expect(
          header.getByRole("button", { name: "Sair" })
        ).toBeVisible();
        await expect(
          header.getByRole("button", { name: "Entrar" })
        ).toHaveCount(0);

        await expect(
          page.getByRole("heading", { name: "Feed de Posts" })
        ).toBeVisible();
        const postCards = page.getByRole("listitem");
        await expect(postCards).not.toHaveCount(0);

        likedPostTitle = (
          await postCards.first().getByRole("heading", { level: 2 }).innerText()
        ).trim();
        expect(likedPostTitle).not.toBe("");
      });

      await test.step("curtir o primeiro post", async () => {
        const firstPost = page.getByRole("listitem").first();
        const likeButton = firstPost.getByRole("button", { name: /Curtir/ });
        const likeResponsePromise = page.waitForResponse(
          (response) =>
            /\/posts\/\d+\/like(?:\?|$)/.test(response.url()) &&
            response.request().method() === "POST"
        );

        await likeButton.click();

        const likeResponse = await likeResponsePromise;
        expect(likeResponse.status()).toBe(200);
        await expect(
          firstPost.getByRole("button", { name: /Curtido/ })
        ).toBeVisible();
        expect(unauthenticatedDialog).toBe("");
      });

      await test.step("abrir Posts Curtidos e localizar o mesmo post", async () => {
        const likedPostsResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes("/posts/liked") &&
            response.request().method() === "GET"
        );

        await page
          .getByRole("banner")
          .getByRole("button", { name: "Posts Curtidos" })
          .click();

        await page.waitForURL("/auth/liked");
        const likedPostsResponse = await likedPostsResponsePromise;
        expect(likedPostsResponse.status()).toBe(200);
        await expect(
          page.getByRole("heading", { name: "Posts Curtidos", level: 1 })
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: likedPostTitle, level: 2 })
        ).toBeVisible();
      });
    } finally {
      await context.close();
    }
  });
});
