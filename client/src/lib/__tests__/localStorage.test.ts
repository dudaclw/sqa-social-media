import { getUser, saveUser, StoredUser } from "@/lib/localStorage";

describe("persistência do usuário", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("deve recuperar o mesmo usuário que foi salvo", () => {
    const user: StoredUser = {
      id: 42,
      email: "usuario@example.com",
    };
    saveUser(user);
    const storedUser = getUser();
    expect(storedUser).toEqual(user);
  });
});
