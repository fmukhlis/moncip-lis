import path from "path";

import { promises as fs } from "fs";

export async function downloadImage(url: string, filename: string) {
  if (process.env.STORAGE_TYPE === "LOCAL") {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch assets: ${response.statusText}`,
          data: null,
        };
      }

      const privateDir = path.join(process.cwd(), "private-assets", "users");
      const safeFilename = path.basename(filename);
      const downloadPath = path.join(privateDir, safeFilename);

      await fs.mkdir(privateDir, { recursive: true });

      const arrayBuffer = await response.arrayBuffer();

      await fs.writeFile(downloadPath, Buffer.from(arrayBuffer));

      return {
        success: true,
        message: `Image downloaded successfully.`,
        data: `/api/files/users/${filename}`,
      };
    } catch {
      return {
        success: false,
        message: `I/O error`,
        data: null,
      };
    }
  }

  return {
    success: false,
    message: `This function can’t be processed because the app is running on a serverless platform.`,
    data: null,
  };
}
