/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS?: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const CHART_PREVIEW_PREFIX = "/chart-preview/";
const HASHED_CHART_PREVIEW = /^[a-z0-9-]+\.preview-[a-f0-9]{10}\.jpg$/;

async function serveChartPreview(request: Request, env: Env, filename: string) {
  if (!HASHED_CHART_PREVIEW.test(filename)) {
    return new Response("Invalid chart preview", { status: 400 });
  }

  const assetUrl = new URL(
    `/charts/previews/${filename}`,
    request.url,
  );
  if (!env.ASSETS) {
    return Response.redirect(assetUrl, 307);
  }

  const assetRequest =
    request.method === "HEAD"
      ? new Request(assetUrl, { headers: request.headers, method: "GET" })
      : new Request(assetUrl, request);
  const assetResponse = await env.ASSETS.fetch(assetRequest);
  if (!assetResponse.ok) return assetResponse;

  const headers = new Headers(assetResponse.headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(request.method === "HEAD" ? null : assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(CHART_PREVIEW_PREFIX)) {
      return serveChartPreview(
        request,
        env,
        url.pathname.slice(CHART_PREVIEW_PREFIX.length),
      );
    }

    if (url.pathname === "/_vinext/image") {
      if (!env.ASSETS) {
        return new Response("Static assets are unavailable", { status: 503 });
      }
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
