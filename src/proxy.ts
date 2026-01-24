import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import type { AppRole } from "@/types/user";

const publicRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = [
  "/dashboard",
  "/agendamentos",
  "/tratamentos",
  "/pacientes",
  "/atendimentos",
  "/usuarios",
  "/configuracoes",
  "/resumo",
  "/relatorios",
  "/notificacoes",
  "/notas-fiscais",
  "/colaboradores",
];
const protectedApiRoutes = ["/api/patients", "/api/appointments"];

const routePermissions: Array<{ pattern: RegExp; roles: AppRole[] }> = [
  { pattern: /^\/atendimentos(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/tratamentos(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/resumo(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/relatorios(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
  { pattern: /^\/usuarios(\/|$)/, roles: ["ADMIN"] },
  { pattern: /^\/colaboradores(\/|$)/, roles: ["ADMIN"] },
  { pattern: /^\/configuracoes(\/|$)/, roles: ["ADMIN", "ASSISTANT"] },
  { pattern: /^\/notas-fiscais(\/|$)/, roles: ["ADMIN", "PROFESSIONAL"] },
];

const hasRoleAccess = (role: AppRole | undefined, allowed: AppRole[]) => {
  if (!allowed.length) return true
  if (!role) return false
  return allowed.includes(role)
}

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 60;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isApiRoute = pathname.startsWith("/api");
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isApiRoute) {
    const request = req as NextRequest & { ip?: string | null };
    const forwardedFor =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ip =
      request.ip ?? forwardedFor ?? req.headers.get("x-real-ip") ?? "unknown";

    if (isRateLimited(`api:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  if (isApiRoute && isProtectedApiRoute && !isLoggedIn) {
    return NextResponse.json(
      {
        success: false,
        error: "Não autorizado",
        message: "Acesso negado",
      },
      { status: 401 }
    );
  }

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isPublicRoute && isLoggedIn && pathname !== "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const restrictedRule = routePermissions.find((rule) => rule.pattern.test(pathname))
  if (restrictedRule) {
    const role = req.auth?.user?.role as AppRole | undefined
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/sign-in", req.url))
    }
    if (!hasRoleAccess(role, restrictedRule.roles)) {
      const deniedUrl = req.nextUrl.clone()
      deniedUrl.pathname = "/acesso-negado"
      deniedUrl.search = ""
      return NextResponse.redirect(deniedUrl)
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|trpc).*)",
    "/api/:path*",
  ],
};
