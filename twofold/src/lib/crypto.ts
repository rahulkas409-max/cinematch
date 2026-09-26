"use client";

/**
 * Time Capsule lockbox: AES-GCM 256 with a PBKDF2-derived key (Web Crypto,
 * entirely in the browser). The passphrase never leaves the device; only the
 * ciphertext, salt and IV are stored or shared.
 */

export type Sealed = { ct: string; iv: string; salt: string };

const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function seal(plaintext: string, passphrase: string): Promise<Sealed> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
  return { ct: toB64(ct), iv: toB64(iv), salt: toB64(salt) };
}

export async function unseal(sealed: Sealed, passphrase: string): Promise<string | null> {
  try {
    const key = await deriveKey(passphrase, fromB64(sealed.salt));
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(sealed.iv) }, key, fromB64(sealed.ct));
    return new TextDecoder().decode(pt);
  } catch {
    return null;
  }
}
