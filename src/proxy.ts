import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authResponse = await updateSession(request);

  if (authResponse.headers.get("Location")) {
    return authResponse;
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/default") ||
    pathname.includes(".")
  ) {
    return authResponse;
  }

  // If already matches a variant exactly or as a directory, do not rewrite again.
  // This prevents infinite loops if Next.js re-runs proxy.ts on the rewritten path.
  if (pathname === "/wedding" || pathname.startsWith("/wedding/")) {
    if (request.headers.get("x-middleware-rewrite")) {
      return authResponse;
    }
  }
  if (pathname === "/celebrate" || pathname.startsWith("/celebrate/")) {
    if (request.headers.get("x-middleware-rewrite")) {
      return authResponse;
    }
  }
  if (pathname === "/invite" || pathname.startsWith("/invite/")) {
    if (request.headers.get("x-middleware-rewrite")) {
      return authResponse;
    }
  }


  let variant = "default";
  let subPath = pathname;

  if (pathname === "/wedding" || pathname.startsWith("/wedding/")) {
    variant = "wedding";
    subPath = pathname.replace(/^\/wedding/, "");
  } else if (pathname === "/celebrate" || pathname.startsWith("/celebrate/")) {
    variant = "celebrate";
    subPath = pathname.replace(/^\/celebrate/, "");
  } else if (pathname === "/invite" || pathname.startsWith("/invite/")) {
    variant = "invite";
    subPath = pathname.replace(/^\/invite/, "");
  } else if (pathname === "/default" || pathname.startsWith("/default/")) {
    variant = "default";
    subPath = pathname.replace(/^\/default/, "");
  }

  if (subPath !== "" && !subPath.startsWith("/")) {
    subPath = "/" + subPath;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${variant}${subPath}`;
  
  if (url.pathname === pathname) {
    return authResponse;
  }

  const rewriteResponse = NextResponse.rewrite(url);

  authResponse.cookies.getAll().forEach((cookie) => {
    rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return rewriteResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
