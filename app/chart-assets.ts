export const CHART_PREVIEWS = {
  "atiyoga-dark": "atiyoga-dark.preview-aca88a423d.jpg",
  "atiyoga-light": "atiyoga-light.preview-de58ed054c.jpg",
  "yihua-dark-desktop": "yihua-dark-desktop.preview-1746e4498f.jpg",
  "yihua-dark-mobile": "yihua-dark-mobile.preview-3038ff0ead.jpg",
  "yihua-light-desktop": "yihua-light-desktop.preview-999fd53db7.jpg",
  "yihua-light-mobile": "yihua-light-mobile.preview-27390eafe2.jpg",
  "yixi-original": "yixi-original.preview-bd6a1780d1.jpg",
  "yunmen-dark": "yunmen-dark.preview-03d89d4b6e.jpg",
  "yunmen-light": "yunmen-light.preview-ef8bb6fe18.jpg",
} as const;

export const CHART_ORIGINAL_FILENAMES = Object.keys(CHART_PREVIEWS).map(
  (key) => `${key}.jpg`,
);
