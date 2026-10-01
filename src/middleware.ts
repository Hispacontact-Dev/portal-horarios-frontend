import { NextResponse, type NextRequest } from "next/server";
import { NEXT_QUERY_PARAM, SESSION_COOKIE_NAME } from "@/lib/session/constants";
import type { Session } from "@/types/session";

function readSessionFromRequest(request: NextRequest): Session | null {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function isEditOnlyRoute(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] === "nuevo";
}

export function middleware(request: NextRequest) {
  const session = readSessionFromRequest(request);
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(NEXT_QUERY_PARAM, pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role === "lider" && isEditOnlyRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
