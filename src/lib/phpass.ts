import { createHash } from "crypto";
import bcrypt from "bcryptjs";

/**
 * Verificação de senhas legadas importadas do WordPress:
 *  - phpass portable ($P$ / $H$) — padrão do WordPress até a 6.7
 *  - $wp$2y$… — WordPress 6.8+ (bcrypt sobre base64(sha384(senha)))
 *  - $2y$ / $2a$ / $2b$ — bcrypt puro
 */
const ITOA64 =
  "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function encode64(input: Buffer, count: number): string {
  let output = "";
  let i = 0;
  do {
    let value = input[i++];
    output += ITOA64[value & 0x3f];
    if (i < count) value |= input[i] << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i++ >= count) break;
    if (i < count) value |= input[i] << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i++ >= count) break;
    output += ITOA64[(value >> 18) & 0x3f];
  } while (i < count);
  return output;
}

function phpassCheck(password: string, hash: string): boolean {
  if (hash.length < 34) return false;
  const id = hash.slice(0, 3);
  if (id !== "$P$" && id !== "$H$") return false;
  const countLog2 = ITOA64.indexOf(hash[3]);
  if (countLog2 < 7 || countLog2 > 30) return false;
  let count = 1 << countLog2;
  const salt = hash.slice(4, 12);
  if (salt.length !== 8) return false;

  const pw = Buffer.from(password, "utf8");
  let h = createHash("md5").update(Buffer.concat([Buffer.from(salt, "utf8"), pw])).digest();
  do {
    h = createHash("md5").update(Buffer.concat([h, pw])).digest();
  } while (--count);

  const computed = hash.slice(0, 12) + encode64(h, 16);
  return computed === hash;
}

export async function verifyLegacyHash(
  password: string,
  hash: string
): Promise<boolean> {
  if (!hash) return false;
  if (hash.startsWith("$P$") || hash.startsWith("$H$")) {
    return phpassCheck(password, hash);
  }
  if (hash.startsWith("$wp$2y$")) {
    const pre = createHash("sha384").update(password, "utf8").digest("base64");
    return bcrypt.compare(pre, hash.slice(3));
  }
  if (/^\$2[aby]\$/.test(hash)) {
    return bcrypt.compare(password, hash);
  }
  return false;
}

export function isLegacyHash(value: string | null | undefined): boolean {
  if (!value) return false;
  return (
    value.startsWith("$P$") ||
    value.startsWith("$H$") ||
    value.startsWith("$wp$") ||
    /^\$2[aby]\$/.test(value)
  );
}
