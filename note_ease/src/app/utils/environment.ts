declare const window: Window | undefined;

export function getWindow(): Window | null {
  return typeof window !== 'undefined' ? window : null;
}

export function getLocalStorage(): Storage | null {
  const win = getWindow();
  return win?.localStorage || null;
}

export function getConfirm(): ((confirmMessage: string) => boolean) | null {
  const win = getWindow();
  return win?.confirm?.bind(win) || null;
}
