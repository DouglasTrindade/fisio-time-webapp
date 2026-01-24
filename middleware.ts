import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { jwtDecrypt } from "jose"
import { hkdf } from "@panva/hkdf"

import type { AppRole } from "@/types/user"

const routePermissions: Array<{ pattern: RegExp; roles: AppRole[] }> = [
  { pattern: /^\/atendimentos(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/tratamentos(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/resumo(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/relatorios(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/usuarios(\/|$)/, roles: ["ADMIN"] },
  { pattern: /^\/colaboradores(\/|$)/, roles: ["ADMIN"] },
  { pattern: /^\/configuracoes(\/|$)/, roles: ["ADMIN"] },
  { pattern: /^\/notas-fiscais(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
]

const hasAccess = (role: AppRole | undefined, allowed: AppRole[]) => {
  if (!allowed.length) return true
  if (!role) return false
  return allowed.includes(role)
}

const encoder = new TextEncoder()

const sessionCookieKeys = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const

const deriveEncryptionKey = async (encAlg: string, salt: string) => {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured")
  }

  const keyMaterial = encoder.encode(secret)
  const length = encAlg === "A256GCM" ? 32 : 64

  return hkdf(
    "sha256",
    keyMaterial,
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    length,
  )
}

const getRoleFromRequest = async (
  request: NextRequest,
): Promise<AppRole | undefined> => {
  for (const key of sessionCookieKeys) {
    const cookie = request.cookies.get(key)
    if (!cookie?.value) continue

    try {
      const { payload } = await jwtDecrypt(
        cookie.value,
        async ({ enc = "A256CBC-HS512" }) =>
          deriveEncryptionKey(enc, key),
        {
          clockTolerance: 15,
          keyManagementAlgorithms: ["dir"],
          contentEncryptionAlgorithms: ["A256CBC-HS512", "A256GCM"],
        },
      )

      const role = payload?.role as AppRole | undefined
      if (role) {
        return role
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[middleware] unable to decode session token for ${key}`,
          error,
        )
      }
    }
  }

  return undefined
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rule = routePermissions.find((entry) => entry.pattern.test(pathname))

  if (!rule) {
    return NextResponse.next()
  }

  const role = await getRoleFromRequest(request)

  if (!hasAccess(role, rule.roles)) {
    const url = request.nextUrl.clone()
    url.pathname = "/acesso-negado"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/atendimentos/:path*",
    "/tratamentos/:path*",
    "/resumo/:path*",
    "/relatorios/:path*",
    "/usuarios/:path*",
    "/colaboradores/:path*",
    "/configuracoes/:path*",
    "/notas-fiscais/:path*",
  ],
}
