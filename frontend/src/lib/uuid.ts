export function uuid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-4);
}
