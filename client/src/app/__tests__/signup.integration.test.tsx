import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUp from "@/app/signup/page";
import { authService } from "@/service/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { SignInResponse } from "@/service/types";

jest.mock("@/service/auth/auth", () => ({
  authService: {
    signUp: jest.fn(),
  },
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedSignUp = jest.mocked(authService.signUp);
const mockedUseAuth = jest.mocked(useAuth);
const mockedUseRouter = jest.mocked(useRouter);

describe("fluxo de cadastro", () => {
  const login = jest.fn();
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login,
      logout: jest.fn(),
    });
    mockedUseRouter.mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      push,
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  test("deve cadastrar, autenticar e redirecionar sem mensagem de erro", async () => {
    const user = userEvent.setup();
    const response: SignInResponse = {
      id: 11,
      email: "cadastro@example.com",
    };
    const password = "Senha1@forte";
    mockedSignUp.mockResolvedValue(response);
    render(<SignUp />);
    await user.type(
      screen.getByPlaceholderText("seu@email.com"),
      response.email
    );
    const passwordFields = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordFields[0], password);
    await user.type(passwordFields[1], password);
    const page = within(screen.getByRole("main"));
    await user.click(page.getByRole("button", { name: "Criar Conta" }));
    await waitFor(() => {
      expect(mockedSignUp).toHaveBeenCalledWith({
        email: response.email,
        password,
      });
      expect(login).toHaveBeenCalledWith(response);
      expect(push).toHaveBeenCalledWith("/");
    });
    expect(
      screen.queryByText("Erro ao criar conta. Tente novamente.")
    ).not.toBeInTheDocument();
    expect(page.getByRole("button", { name: "Criar Conta" })).toBeEnabled();
  });
});
