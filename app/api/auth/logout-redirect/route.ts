import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_DOMAIN = process.env.NODE_ENV === "production" ? ".basalthq.com" : undefined;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  const response = NextResponse.redirect(url);
  
  response.cookies.delete({
    name: "thirdweb_auth_token",
    domain: COOKIE_DOMAIN,
    path: "/",
  });
  
  return response;
}
