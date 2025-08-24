import { Api, API } from "@/utils/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;

  try {
    const res = await fetch(`${API[Api.file]}/${filename}`);
    if (!res.ok) {
      return new NextResponse("Failed to fetch file", { status: 500 });
    }

    const contentType =
      res.headers.get("Content-Type") || "application/octet-stream";
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err) {
    return new NextResponse("Алдаа гарлаа", { status: 500 });
  }
}
