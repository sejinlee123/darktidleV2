import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  if (!process.env.BETTER_AUTH_SECRET) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  const loggedIn = Boolean(sessionCookie);
  const { pathname } = request.nextUrl;

  if (loggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  if (!loggedIn && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/profile/:path*"],
};
