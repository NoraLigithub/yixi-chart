const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export function assetPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function previewPath(filename: string) {
  if (isStaticExport) {
    return assetPath(`/charts/previews/${filename}`);
  }

  return `/chart-preview/${filename}`;
}
