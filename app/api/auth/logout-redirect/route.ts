import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";

const COOKIE_DOMAIN = process.env.NODE_ENV === "production" ? ".basalthq.com" : undefined;

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(getAuthRedirectUrl(request, '/login'));
  
  response.cookies.delete({
    name: "thirdweb_auth_token",
    domain: COOKIE_DOMAIN,
    path: "/",
  });
  
  return response;
}
