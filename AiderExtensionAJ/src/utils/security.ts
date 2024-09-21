export function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function sanitizeInput(input: string): string {
  // Remove any characters that could be used for command injection
  return input.replace(/[;&|`$()]/g, '');
}

export function validateFilePath(filePath: string): boolean {
  // Implement path traversal prevention
  const normalizedPath = filePath.replace(/\\/g, '/');
  return !normalizedPath.includes('../') && !normalizedPath.includes('..\\');
}

export function escapeHtml(unsafe: string): string {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

export function validateUrl(url: string): boolean {
  try {
      new URL(url);
      return true;
  } catch {
      return false;
  }
}