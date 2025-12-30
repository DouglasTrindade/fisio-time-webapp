import { NextRequest, NextResponse } from "next/server";
import cidData from "@/data/cid10.json";
import { createApiResponse } from "@/lib/api/utils";

interface CidEntry {
  code: string;
  name: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const limit = Number(searchParams.get("limit") || "8");

  const results = (cidData as CidEntry[])
    .filter((entry) => {
      if (!query) return true;
      return (
        entry.code.toLowerCase().includes(query) ||
        entry.name.toLowerCase().includes(query)
      );
    })
    .slice(0, Math.max(1, Math.min(limit, 20)));

  return NextResponse.json(
    createApiResponse({ items: results, total: results.length }),
  );
}
