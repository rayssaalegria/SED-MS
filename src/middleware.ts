import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_COOKIE, isDemoMode } from "@/lib/auth/demo-users";

const PUBLIC_PATHS = [
  "/login",
  "/recuperar-senha",
  "/primeiro-acesso",
  "/publico",
];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDemoMode()) {
    const hasDemoSession = Boolean(request.cookies.get(DEMO_COOKIE)?.value);
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/recuperar-senha") ||
      pathname.startsWith("/primeiro-acesso");

    if (!hasDemoSession && !isPublicPath(pathname) && pathname !== "/alterar-senha") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (hasDemoSession && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const response = await updateSession(request);

  const hasSupabaseAuth = request.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token") || c.name.includes("sb-"));

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/recuperar-senha") ||
    pathname.startsWith("/primeiro-acesso");

  if (!hasSupabaseAuth && !isPublicPath(pathname) && pathname !== "/alterar-senha") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSupabaseAuth && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
