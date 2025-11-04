import { auth } from "@/auth";

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

export default auth((req) => {
  if (req.auth) {
    if (req.nextUrl.pathname === "/signin") {
      const rootUrl = new URL("/", req.nextUrl.origin);
      return Response.redirect(rootUrl);
    }
  } else {
    if (
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/staff")
    ) {
      const signinUrl = new URL(
        `/signin?callbackUrl=${req.nextUrl.pathname}`,
        req.nextUrl.origin,
      );
      return Response.redirect(signinUrl);
    }
  }
});
