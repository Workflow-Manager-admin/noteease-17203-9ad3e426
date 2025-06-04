declare const window: Window | undefined;

export function getWindow(): Window | null {
  return typeof window !== 'undefined' ? window : null;
}

export function getLocalStorage(): Storage | null {
  const win = getWindow();
  return win?.localStorage || null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getConfirm(): ((message: string) => boolean) | null {
  const win = getWindow();
  return win?.confirm?.bind(win) || null;
}
