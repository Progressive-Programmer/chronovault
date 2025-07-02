"use client";

// Helper to convert an ArrayBuffer to a Base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert a Base64 string to an ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates a new AES-GCM cryptographic key.
 */
export async function generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true, // key is extractable
        ["encrypt", "decrypt"]
    );
}

/**
 * Exports a CryptoKey to a Base64 string for storage or transport.
 */
export async function exportKeyToString(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return bufferToBase64(exported);
}

/**
 * Imports a CryptoKey from a Base64 string.
 */
export async function importKeyFromString(keyStr: string): Promise<CryptoKey> {
    const buffer = base64ToBuffer(keyStr);
    return window.crypto.subtle.importKey(
        "raw",
        buffer,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a message using a CryptoKey.
 * @returns An object with the initialization vector (iv) and the encrypted message, both as Base64 strings.
 */
export async function encryptMessage(message: string, key: CryptoKey): Promise<{ iv: string; encrypted: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    const encodedMessage = new TextEncoder().encode(message);

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedMessage
    );

    return {
        iv: bufferToBase64(iv),
        encrypted: bufferToBase64(encrypted),
    };
}

/**
 * Decrypts a message using a CryptoKey and initialization vector.
 */
export async function decryptMessage(encrypted: string, iv: string, key: CryptoKey): Promise<string> {
    const encryptedBuffer = base64ToBuffer(encrypted);
    const ivBuffer = base64ToBuffer(iv);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBuffer,
        },
        key,
        encryptedBuffer
    );

    return new TextDecoder().decode(decrypted);
}
