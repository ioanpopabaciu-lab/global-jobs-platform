import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://global-jobs-platform-production.up.railway.app/api";

async function proxy(request: NextRequest, path: string[]) {
  const segment = path.join("/");
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const url = `${BACKEND}/admin/${segment}${qs ? `?${qs}` : ""}`;

  const headers: Record<string, string> = {};
  const auth = request.headers.get("authorization") || request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;
  const ct = request.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;

  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.text();
  }

  const res = await fetch(url, { method: request.method, headers, body });
  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
