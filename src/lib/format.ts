const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];
const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Data de um dia (meia-noite UTC) → "14/04" */
export function shortDate(d: Date | null | undefined, fallback = "") {
  if (!d) return fallback;
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** → "terça-feira, 14 de abril" */
export function longDate(d: Date | null | undefined) {
  if (!d) return "";
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

export function fullDate(d: Date | null | undefined) {
  if (!d) return "";
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

/** Data/hora no fuso de Brasília */
export function dateTimeBr(d: Date | null | undefined, opts?: { seconds?: boolean }) {
  if (!d) return "";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(opts?.seconds ? { second: "2-digit" } : {}),
  });
}

export function dateBr(d: Date | null | undefined) {
  if (!d) return "";
  return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

/** yyyy-mm-dd (para inputs type=date) a partir de um dia em UTC */
export function toInputDate(d: Date | null | undefined) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

/** datetime-local em Brasília a partir de um instante */
export function toInputDateTimeBr(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 16);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function firstName(name: string) {
  return name.split(" ")[0];
}

export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}
