const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateBoolean(): boolean {
  return Math.random() >= 0.5;
}

export function generateDateString(date?: Date): string {
  return new Date().toISOString();
}

export function generateNumber(min: number = 0, max: number = min + 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateString(length: number): string {
  return Array.apply(null, Array(length))
    .map(() => ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)))
    .join('');
}
