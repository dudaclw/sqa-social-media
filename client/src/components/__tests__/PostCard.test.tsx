import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostCard from "@/components/PostCard";
import { Post } from "@/service/types";

describe("PostCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("deve alertar e impedir a curtida para usuário deslogado", async () => {
    const user = userEvent.setup();
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const onLike = jest.fn<Promise<void>, [number]>();
    const post: Post = {
      id: 7,
      title: "Qualidade de software",
      body: "Testes automatizados reduzem regressões.",
      liked: false,
      reactions: {
        likes: 10,
        dislikes: 2,
      },
    };

    render(
      <PostCard post={post} isAuthenticated={false} onLike={onLike} />
    );
    await user.click(screen.getByRole("button", { name: /Curtir/ }));
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(post.body)).toBeInTheDocument();
    expect(screen.getByText("Likes: 10")).toBeInTheDocument();
    expect(screen.getByText("Dislikes: 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Curtir/ })).toBeEnabled();
    expect(alertMock).toHaveBeenCalledWith(
      "Você precisa estar autenticado para curtir posts!"
    );
    expect(onLike).not.toHaveBeenCalled();
  });
});
