// backend/index.ts
import { serve } from "bun";
import { join, extname } from "path";
import { readFile } from "fs/promises";
import { api } from "./backend/src/index.ts";

const distDir = join("./app/dist");
console.log(distDir);

// Basic MIME type mapping
const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // API endpoint
    if (url.pathname.startsWith("/api")) {
      return new Response(JSON.stringify({ message: "Hello from API!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let filePath = join(distDir, pathname);
    let ext = extname(filePath);

    // Static file serving
    let file;

    try {
      file = await readFile(filePath);
    } catch (e){
      console.log("Error: ", e);
      // If the file isn't found, fallback to index.html for React SPA
      filePath = join(distDir, "index.html");
      file = await readFile(filePath);
      ext = ".html";
    }

    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
      },
    });
  },
});