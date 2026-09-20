import { safeStorage } from "electron";

export function encrypt(plaintext: string): string {
  const buffer = safeStorage.encryptString(plaintext);
  return buffer.toString("base64");
}

export function decrypt(ciphertextBase64: string): string {
  const buffer = Buffer.from(ciphertextBase64, "base64");
  return safeStorage.decryptString(buffer);
}

export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable();
}
