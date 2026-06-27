import { expect, test } from "@playwright/test";

test.describe("Curtida sem autenticação", () => {
  test("usuário deslogado recebe alerta e permanece no feed sem curtir", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    const page = await context.newPage();

    try {
      const response = await page.goto("/");
      const initialUrl = page.url();
      expect(response?.ok()).toBe(true);
      await expect(
        page.getByRole("heading", { name: "Feed de Posts" })
      ).toBeVisible();

      const header = page.getByRole("banner");
      await expect(
        header.getByRole("button", { name: "Entrar", exact: true })
      ).toBeVisible();
      await expect(
        header.getByRole("button", { name: "Criar Conta", exact: true })
      ).toBeVisible();
      await expect(
        header.getByRole("button", { name: "Sair", exact: true })
      ).toHaveCount(0);

      const postCards = page.getByRole("listitem");
      await expect(postCards).not.toHaveCount(0);
      const postCount = await postCards.count();
      expect(postCount).toBeGreaterThan(0);

      const firstPost = postCards.first();
      await expect(firstPost).toBeVisible();
      const likeButton = firstPost.getByRole("button", { name: /Curtir/ });
      await expect(likeButton).toBeVisible();
      await expect(likeButton).toBeEnabled();

      let dialogMessage = "";
      page.once("dialog", async (dialog) => {
        dialogMessage = dialog.message();
        await dialog.accept();
      });
      await likeButton.click();
      expect(dialogMessage).toBe(
        "Você precisa estar autenticado para curtir posts!"
      );
      await expect(likeButton).toContainText("Curtir");
      await expect(likeButton).not.toContainText("Curtido");
      await expect(
        header.getByRole("button", { name: "Entrar", exact: true })
      ).toBeVisible();
      await expect(
        header.getByRole("button", { name: "Sair", exact: true })
      ).toHaveCount(0);
      expect(page.url()).toBe(initialUrl);
      expect(await page.evaluate(() => window.localStorage.length)).toBe(0);
      await expect(
        page.getByRole("heading", { name: "Feed de Posts" })
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
