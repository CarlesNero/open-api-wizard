let counter = 0;

export function generateId(): string {
  return `id_${++counter}_${Date.now().toString(36)}`;
}
