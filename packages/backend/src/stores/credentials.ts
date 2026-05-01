/// <reference types="node" />
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";

import { type BedrockCredentials, BedrockCredentialsSchema } from "shared";

const ALGORITHM = "aes-256-gcm";
const KEY_FILE = ".shift_keyfile";
const CREDS_FILE = "settings.bedrock.json";

type EncryptedStore = {
  iv: string;
  authTag: string;
  ciphertext: string;
};

async function getOrCreateKey(basePath: string): Promise<Buffer> {
  const keyPath = path.join(basePath, KEY_FILE);
  try {
    const stored = JSON.parse(await readFile(keyPath, "utf-8")) as { key: string };
    const key = Buffer.from(stored.key, "hex");
    if (key.length === 32) return key;
  } catch {
    // key file doesn't exist yet
  }
  const key = randomBytes(32);
  await writeFile(keyPath, JSON.stringify({ key: key.toString("hex") }), { mode: 0o600 });
  return key;
}

export async function saveBedrockCredentials(
  basePath: string,
  creds: BedrockCredentials
): Promise<void> {
  const key = await getOrCreateKey(basePath);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = cipher.update(JSON.stringify(creds), "utf8", "hex") + cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  const stored: EncryptedStore = { iv: iv.toString("hex"), authTag, ciphertext };
  await writeFile(path.join(basePath, CREDS_FILE), JSON.stringify(stored), { mode: 0o600 });
}

export async function loadBedrockCredentials(
  basePath: string
): Promise<BedrockCredentials | undefined> {
  try {
    const stored = JSON.parse(
      await readFile(path.join(basePath, CREDS_FILE), "utf-8")
    ) as Partial<EncryptedStore>;
    if (
      stored.iv === undefined ||
      stored.authTag === undefined ||
      stored.ciphertext === undefined
    ) {
      return undefined;
    }

    const key = await getOrCreateKey(basePath);
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(stored.iv, "hex"));
    decipher.setAuthTag(Buffer.from(stored.authTag, "hex"));
    const plaintext = decipher.update(stored.ciphertext, "hex", "utf8") + decipher.final("utf8");

    const parsed = BedrockCredentialsSchema.safeParse(JSON.parse(plaintext));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export async function clearBedrockCredentials(basePath: string): Promise<void> {
  try {
    await writeFile(path.join(basePath, CREDS_FILE), JSON.stringify({}), { mode: 0o600 });
  } catch {
    // file may not exist — that's fine
  }
}
