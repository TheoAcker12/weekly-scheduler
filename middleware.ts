import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

// cannot wrap middleware with 'withAuth' since authentication isn't required
export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const token = await getToken({ req });
  // authenticated users should not access the login page
  if (req.nextUrl.pathname.startsWith('/login') && !!token) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // this may not be necessary for just the login page, but assuming I want to do other authorization it is probably useful
  const authMiddleware = await withAuth({
    pages: {
      signIn: '/login'
    }
  });

  return authMiddleware(req as NextRequestWithAuth, event);
}