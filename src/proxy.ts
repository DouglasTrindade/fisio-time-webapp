import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = ["/dashboard", "/agendamentos"];
const protectedApiRoutes = ["/api/patients", "/api/appointments"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;


  const isApiRoute = pathname.startsWith("/api");
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

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
    "/api/patients/:path*",
    "/api/appointments/:path*"
  ],
};
