import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "session_token";

// TODO: solo verifica la presencia de la cookie, no valida el token contra el backend
// (no existe un endpoint GET /auth/me para hacerlo desde el middleware).
export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
