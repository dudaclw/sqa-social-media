import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/Button";

describe("Button", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("deve exibir carregamento, ficar desabilitado e bloquear o callback", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button isLoading onClick={onClick}>
        Enviar
      </Button>
    );
    const button = screen.getByRole("button", { name: "Carregando..." });
    await user.click(button);
    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
