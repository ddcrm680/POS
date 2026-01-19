import CryptoJS from "crypto-js";
import { Constant } from "./constant";

const SECRET_KEY = process.env.CRYPTO_QUERY_SECRET || Constant.CRYPTO_QUERY_SECRET;

// Encrypt
export function encryptQuery(value: string | number) {
  return CryptoJS.AES.encrypt(String(value), SECRET_KEY).toString();
}

// Decrypt
export function decryptQuery(value: string) {
  try {
    const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}
