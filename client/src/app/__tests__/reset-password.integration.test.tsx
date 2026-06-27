import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPassword from "@/app/reset-password/page";
import { authService } from "@/service/auth/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

jest.mock("@/service/auth/auth", () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedResetPassword = jest.mocked(authService.resetPassword);
const mockedUseAuth = jest.mocked(useAuth);
const mockedUseRouter = jest.mocked(useRouter);

describe("fluxo de redefinição de senha", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
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

  afterEach(() => {
    jest.useRealTimers();
  });

  test("deve exibir mensagem de sucesso e redirecionar", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const email = "reset@example.com";
    mockedResetPassword.mockResolvedValue();
    render(<ResetPassword />);

    await user.type(screen.getByPlaceholderText("seu@email.com"), email);
    const page = within(screen.getByRole("main"));
    await user.click(page.getByRole("button", { name: "Enviar Email" }));

    await waitFor(() => {
      expect(mockedResetPassword).toHaveBeenCalledWith({ email });
      expect(screen.getByText("E-mail enviado com sucesso")).toBeVisible();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(push).toHaveBeenCalledWith("/signin");
  });
});
