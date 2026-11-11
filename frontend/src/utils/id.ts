/**
 * 生成一个全局唯一 ID
 */
export function createId(): string {
  return crypto.randomUUID();
}