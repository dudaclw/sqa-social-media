import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "@/app/signin/page";
import { authService } from "@/service/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { SignInResponse } from "@/service/types";

jest.mock("@/service/auth/auth", () => ({
  authService: {
    signIn: jest.fn(),
  },
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedSignIn = jest.mocked(authService.signIn);
const mockedUseAuth = jest.mocked(useAuth);
const mockedUseRouter = jest.mocked(useRouter);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe("fluxo de login", () => {
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

  test("deve autenticar, redirecionar e encerrar o carregamento", async () => {
    const user = userEvent.setup();
    const response: SignInResponse = {
      id: 10,
      email: "login@example.com",
    };
    const request = deferred<SignInResponse>();
    mockedSignIn.mockReturnValue(request.promise);
    render(<SignIn />);
    await user.type(
      screen.getByPlaceholderText("seu@email.com"),
      response.email
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "Senha1!forte");
    const page = within(screen.getByRole("main"));
    await user.click(page.getByRole("button", { name: "Entrar" }));
    expect(mockedSignIn).toHaveBeenCalledWith({
      email: response.email,
      password: "Senha1!forte",
    });
    expect(
      screen.getByRole("button", { name: "Carregando..." })
    ).toBeDisabled();

    request.resolve(response);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(response);
      expect(push).toHaveBeenCalledWith("/");
    });
    expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
