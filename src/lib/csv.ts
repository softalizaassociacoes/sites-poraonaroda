/**
 * Leitura de CSV (com aspas, ; ou ,) e mapeamento dos formatos aceitos na
 * importação de usuários:
 *  - simples:      nome; email; senha; categoria; banda/projeto; telefone; cidade; uf
 *  - WordPress:    export do plugin "Import and Export Users" (user_email, user_pass, first_name…)
 *  - Forminator:   export do formulário "Não tenho login e quero me cadastrar" do site antigo
 */

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows.map((r) => r.map((c) => c.trim()));
}

export type ImportedUser = {
  name: string;
  email: string;
  password?: string;
  legacyHash?: string;
  role?: "ADMIN" | "PARTICIPANT";
  status?: "ACTIVE" | "PENDING";
  category?: string;
  institution?: string;
  phone?: string;
  cpf?: string;
  city?: string;
  state?: string;
  profession?: string;
  wpId?: number;
  createdAt?: Date;
  source: string;
};

export type ImportFormat = "wordpress" | "forminator" | "simple";

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function detectFormat(header: string[]): ImportFormat {
  const h = header.map(norm);
  if (h.includes("user_email") || h.includes("user_login")) return "wordpress";
  if (h.some((c) => /^sobrenome/.test(c)) && h.some((c) => /e-?mail/.test(c)))
    return "forminator";
  return "simple";
}

function col(header: string[], ...patterns: RegExp[]) {
  const h = header.map(norm);
  for (const p of patterns) {
    const idx = h.findIndex((c) => p.test(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

function titleCase(s: string) {
  const lower = s.toLowerCase();
  return lower.replace(/(^|\s|-)([a-zà-ú])/g, (m) => m.toUpperCase()).replace(
    /\b(De|Da|Do|Das|Dos|E)\b/g,
    (m) => m.toLowerCase()
  );
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function mapRows(
  rows: string[][],
  opts: { defaultCategory: string; defaultStatus?: "ACTIVE" | "PENDING" }
): { format: ImportFormat; users: ImportedUser[]; invalid: number } {
  if (rows.length === 0) return { format: "simple", users: [], invalid: 0 };
  const header = rows[0];
  const format = detectFormat(header);
  const users: ImportedUser[] = [];
  let invalid = 0;

  if (format === "wordpress") {
    const cEmail = col(header, /^user_email$/);
    const cPass = col(header, /^user_pass$/);
    const cFirst = col(header, /^first_name$/);
    const cLast = col(header, /^last_name$/);
    const cDisplay = col(header, /^display_name$/);
    const cRole = col(header, /^role$/);
    const cReg = col(header, /^user_registered$/);
    const cId = col(header, /^source_user_id$|^id$/);
    for (const r of rows.slice(1)) {
      const email = (r[cEmail] ?? "").toLowerCase();
      if (!EMAIL_RE.test(email)) {
        invalid++;
        continue;
      }
      const first = cFirst >= 0 ? r[cFirst] : "";
      const last = cLast >= 0 ? r[cLast] : "";
      let name = `${first} ${last}`.trim();
      if (!name && cDisplay >= 0 && !r[cDisplay].includes("@")) name = r[cDisplay];
      if (!name) name = email.split("@")[0];
      if (name === name.toUpperCase()) name = titleCase(name);
      const roleRaw = cRole >= 0 ? r[cRole] : "";
      const hash = cPass >= 0 ? r[cPass] : "";
      users.push({
        name,
        email,
        legacyHash: hash && hash.startsWith("$") ? hash : undefined,
        role: /administrator/i.test(roleRaw) ? "ADMIN" : "PARTICIPANT",
        status: "ACTIVE",
        category: /administrator/i.test(roleRaw) ? "Organização" : opts.defaultCategory,
        wpId: cId >= 0 && r[cId] ? parseInt(r[cId], 10) || undefined : undefined,
        createdAt: cReg >= 0 && r[cReg] ? new Date(r[cReg].replace(" ", "T") + "Z") : undefined,
        source: "wordpress",
      });
    }
    return { format, users, invalid };
  }

  if (format === "forminator") {
    const cEmail = col(header, /e-?mail/);
    const cFirst = col(header, /^nome$|^nome /, /^nome/);
    const cLast = col(header, /^sobrenome/);
    const cPhone = col(header, /telefone|celular/);
    const cCity = col(header, /cidade/);
    const cUf = col(header, /^uf$|estado/);
    const cProf = col(header, /atuacao|profissao/);
    const cInst = col(header, /banda|projeto|empresa|institui/);
    const cTime = col(header, /tempo de submissao|submiss/);
    for (const r of rows.slice(1)) {
      const email = (r[cEmail] ?? "").toLowerCase();
      if (!EMAIL_RE.test(email)) {
        invalid++;
        continue;
      }
      let name = `${r[cFirst] ?? ""} ${r[cLast] ?? ""}`.trim();
      if (name === name.toUpperCase()) name = titleCase(name);
      users.push({
        name: name || email.split("@")[0],
        email,
        status: opts.defaultStatus ?? "PENDING",
        category: opts.defaultCategory,
        phone: (cPhone >= 0 && r[cPhone]) || undefined,
        city: (cCity >= 0 && r[cCity]) || undefined,
        state: (cUf >= 0 && r[cUf]) || undefined,
        profession: (cProf >= 0 && r[cProf]) || undefined,
        institution: (cInst >= 0 && r[cInst]) || undefined,
        createdAt: cTime >= 0 ? parseForminatorDate(r[cTime]) : undefined,
        source: "forminator",
      });
    }
    return { format, users, invalid };
  }

  // simples — com ou sem cabeçalho
  let body = rows;
  let cName = 0,
    cEmail = 1,
    cPass = 2,
    cCat = 3,
    cInst = 4,
    cPhone = -1,
    cCity = -1,
    cUf = -1;
  const h = header.map(norm);
  if (h.some((c) => /e-?mail/.test(c))) {
    cEmail = col(header, /e-?mail/);
    cName = col(header, /nome|name/);
    cPass = col(header, /senha|password/);
    cCat = col(header, /categoria|category/);
    cInst = col(header, /institui|instituicao/);
    cPhone = col(header, /telefone|phone|celular/);
    cCity = col(header, /cidade|city/);
    cUf = col(header, /^uf$|estado/);
    if (cName === -1) cName = 0;
    body = rows.slice(1);
  }
  for (const r of body) {
    const email = (r[cEmail] ?? "").toLowerCase();
    let name = r[cName] ?? "";
    if (name === name.toUpperCase()) name = titleCase(name);
    if (name.length < 2 || !EMAIL_RE.test(email)) {
      invalid++;
      continue;
    }
    users.push({
      name,
      email,
      password: cPass >= 0 && r[cPass] && r[cPass].length >= 6 ? r[cPass] : undefined,
      category: (cCat >= 0 && r[cCat]) || opts.defaultCategory,
      institution: (cInst >= 0 && r[cInst]) || undefined,
      phone: (cPhone >= 0 && r[cPhone]) || undefined,
      city: (cCity >= 0 && r[cCity]) || undefined,
      state: (cUf >= 0 && r[cUf]) || undefined,
      status: opts.defaultStatus ?? "ACTIVE",
      source: "import",
    });
  }
  return { format, users, invalid };
}

const MONTHS: Record<string, number> = {
  jan: 0, fev: 1, feb: 1, mar: 2, abr: 3, apr: 3, mai: 4, may: 4, jun: 5, jul: 6,
  ago: 7, aug: 7, set: 8, sep: 8, out: 9, oct: 9, nov: 10, dez: 11, dec: 11,
};

/** "ago 26, 2026 @ 1:45 PM" → Date */
function parseForminatorDate(raw: string): Date | undefined {
  const m = raw.match(/^([a-z]{3})\w*\s+(\d{1,2}),\s*(\d{4})(?:\s*@\s*(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i);
  if (!m) return undefined;
  const month = MONTHS[m[1].toLowerCase()];
  if (month === undefined) return undefined;
  let hour = m[4] ? parseInt(m[4], 10) : 12;
  const min = m[5] ? parseInt(m[5], 10) : 0;
  if (m[6]?.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (m[6]?.toUpperCase() === "AM" && hour === 12) hour = 0;
  return new Date(Date.UTC(parseInt(m[3], 10), month, parseInt(m[2], 10), hour + 3, min));
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return (
    "﻿" +
    rows
      .map((r) =>
        r
          .map((c) => {
            const s = c === null || c === undefined ? "" : String(c);
            return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(";")
      )
      .join("\r\n")
  );
}
