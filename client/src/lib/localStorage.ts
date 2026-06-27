const USER_KEY = "sqa_social_user";

export interface StoredUser {
  id: number;
  email: string;
}

export function saveUser(user: StoredUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userData = localStorage.getItem(USER_KEY);

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

export function removeUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

export const clearUser = removeUser;

export function isAuthenticated(): boolean {
  return getUser() !== null;
}
