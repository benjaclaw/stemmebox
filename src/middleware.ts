import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROJECT_REF = "gmvghfwgttnbkvrqllua";

const protectedPaths = ["/dashboard", "/create-business"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase SSR auth token cookie: sb-<project-ref>-auth-token
  const authCookieName = `sb-${PROJECT_REF}-auth-token`;
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) =>
      cookie.name === authCookieName ||
      cookie.name.startsWith(`${authCookieName}.`)
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/create-business"],
};
