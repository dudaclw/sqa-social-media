export const STRONG_PASSWORD = "QaTest1@Strong";
export const WRONG_STRONG_PASSWORD = "Wrong1@Strong";
export function generateUniqueEmail(prefix = "qa-api"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);

  return `${prefix}-${timestamp}-${random}@example.com`;
}
