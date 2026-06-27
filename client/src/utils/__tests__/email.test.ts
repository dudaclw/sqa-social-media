import { getEmailValidationMessage, isEmailValid } from "@/utils/email";

describe("validação de e-mail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  test.each([
    ["usuario@example.com", true],
    ["usuario@", false],
    ["", false],
    ["usuario @example.com", false],
    ["usuario.example.com", false],
  ])("deve validar %p como %p", (email, expected) => {
    const valid = isEmailValid(email);
    expect(valid).toBe(expected);
  });

  test("deve informar quando o e-mail está vazio ou inválido", () => {
    expect(getEmailValidationMessage("")).toBe("Email é obrigatório");
    expect(getEmailValidationMessage("formato-invalido")).toBe(
      "Email inválido"
    );
  });
});
