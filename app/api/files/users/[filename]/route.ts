import path from "path";

import { promises as fs } from "fs";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/files/users/[filename]">,
) {
  if (process.env.STORAGE_TYPE === "LOCAL") {
    const { filename } = await ctx.params;

    const privateDir = path.join(process.cwd(), "private-assets", "users");
    const safeFilename = path.basename(filename);
    const assetPath = path.join(privateDir, safeFilename);

    try {
      const fileBuffer = await fs.readFile(assetPath);

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    } catch {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
  }

  return NextResponse.json(
    {
      error:
        "This request can’t be processed because the app is running on a serverless platform.",
    },
    { status: 400 },
  );
}
