import { NextResponse } from "next/server";
import { syncAulaHighlights } from "@/lib/aula";

export async function POST(request: Request) {
  return runAulaSync(request);
}

export async function GET(request: Request) {
  return runAulaSync(request);
}

async function runAulaSync(request: Request) {
  const authHeader = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron");
  const expected = process.env.AULA_SYNC_SECRET;

  if (expected && authHeader !== `Bearer ${expected}` && vercelCron !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAulaHighlights();

  return NextResponse.json({
    ...result,
    status: "placeholder"
  });
}
