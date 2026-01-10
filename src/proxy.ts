import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

const publicRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = ["/dashboard", "/agendamentos"];
const protectedApiRoutes = ["/api/patients", "/api/appointments"];

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
    const ip = request.ip ?? forwardedFor ?? req.headers.get("x-real-ip") ?? "unknown";

    if (isRateLimited(`api:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  if (isApiRoute && isProtectedApiRoute && !isLoggedIn) {
    return NextResponse.json(
      {
        success: false,
        error: "Não autorizado",
        message: "Acesso negado"
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

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|trpc).*)",
    "/api/:path*"
  ],
};
