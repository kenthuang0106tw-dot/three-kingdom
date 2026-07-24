import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".wav": "audio/wav",
};

function clientPath(root, pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidate = resolve(root, relative);
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : null;
}

async function staticResponse(root, request) {
  const path = clientPath(root, new URL(request.url).pathname);
  if (!path) return new Response("Not found", { status: 404 });
  try {
    if (!(await stat(path)).isFile()) return new Response("Not found", { status: 404 });
    return new Response(await readFile(path), {
      headers: { "content-type": MIME_TYPES[extname(path)] ?? "application/octet-stream" },
    });
  } catch (error) {
    if (error?.code === "ENOENT") return new Response("Not found", { status: 404 });
    throw error;
  }
}

export async function createProductionServer({ root = process.cwd() } = {}) {
  const clientRoot = resolve(root, "dist", "client");
  const workerUrl = pathToFileURL(resolve(root, "dist", "server", "index.js"));
  workerUrl.searchParams.set("server", `${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return http.createServer(async (incoming, outgoing) => {
    try {
      const origin = `http://${incoming.headers.host ?? "127.0.0.1"}`;
      const request = new Request(new URL(incoming.url ?? "/", origin), {
        method: incoming.method,
        headers: incoming.headers,
      });
      const pathname = new URL(request.url).pathname;
      const directAsset = pathname !== "/" ? await staticResponse(clientRoot, request) : null;
      const response = directAsset?.ok
        ? directAsset
        : await worker.fetch(request, {
            ASSETS: { fetch: assetRequest => staticResponse(clientRoot, assetRequest) },
          }, {
            waitUntil() {},
            passThroughOnException() {},
          });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error(error);
      outgoing.writeHead(500);
      outgoing.end("Internal Server Error");
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const portFlag = process.argv.findIndex(value => value === "-p" || value === "--port");
  const port = portFlag >= 0 ? Number(process.argv[portFlag + 1]) : Number(process.env.PORT ?? 3000);
  const server = await createProductionServer();
  server.listen(port, "127.0.0.1", () => console.log(`Production: http://127.0.0.1:${port}`));
}
