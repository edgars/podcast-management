/** Base pública da aplicação (convites, callbacks). */
export function getPublicBaseUrl() {
  const fromEnv = process.env.AUTH_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function formatBrl(value: unknown) {
  let n = 0;
  if (value == null) {
    n = 0;
  } else if (typeof value === "bigint") {
    n = Number(value);
  } else if (typeof value === "number") {
    n = value;
  } else if (typeof value === "object" && value !== null && "toString" in value) {
    n = Number(String(value));
  } else {
    n = Number(value);
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);
}

export function startOfUtcMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function endOfUtcMonth(d = new Date()) {
  const s = startOfUtcMonth(d);
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + 1, 0));
}

export function parseYearMonthParam(ym: string | undefined, base = new Date()) {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return startOfUtcMonth(base);
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

export function parseCommaList(raw: string) {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
