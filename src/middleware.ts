import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSecret } from "@/lib/auth-secret";

/**
 * O nome do cookie de sessão do Auth.js depende de `useSecureCookies` (prefixo
 * `__Secure-` em HTTPS). Se `getToken` usar o nome errado, devolve `null` e o
 * painel redireciona para `/login` enquanto o RSC em `/login` ainda vê sessão —
 * loop 307 entre `/login` e `/painel`.
 */
function shouldUseSecureSessionCookie(request: NextRequest): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  if (/(^|;\s*)__Secure-authjs\.session-token/.test(cookie)) {
    return true;
  }
  if (/(^|;\s*)authjs\.session-token/.test(cookie)) {
    return false;
  }
  const proto = request.headers.get("x-forwarded-proto");
  if (proto === "https") return true;
  if (proto === "http") return false;
  return request.nextUrl.protocol === "https:";
}

async function getSessionToken(request: NextRequest, secret: string) {
  const primary = shouldUseSecureSessionCookie(request);
  let token = await getToken({
    req: request,
    secret,
    secureCookie: primary,
  });
  if (token) return token;

  const cookie = request.headers.get("cookie") ?? "";
  if (!/(^|;\s*)(__Secure-)?authjs\.session-token/.test(cookie)) {
    return null;
  }

  return getToken({
    req: request,
    secret,
    secureCookie: !primary,
  });
}

/**
 * Middleware em Edge: usa JWT (`getToken`) em vez de importar `auth` com Prisma/bcrypt.
 */
export async function middleware(request: NextRequest) {
  const token = await getSessionToken(request, getAuthSecret());

  if (request.nextUrl.pathname.startsWith("/painel") && !token) {
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};
