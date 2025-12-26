import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getConfig } from "./config.js";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export function encrypt(text: string): string {
    const config = getConfig();
    const key = Buffer.from(config.ENCRYPTION_KEY);
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
    const config = getConfig();
    const key = Buffer.from(config.ENCRYPTION_KEY);
    const [ivHex, encryptedHex] = encryptedText.split(":");

    if (!ivHex || !encryptedHex) {
        throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}
