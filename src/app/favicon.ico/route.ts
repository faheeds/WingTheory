import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/brand/wing-theory-mark.svg", request.url), 308);
}
