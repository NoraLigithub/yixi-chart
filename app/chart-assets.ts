export const CHART_PREVIEWS = {
  "atiyoga-dark": "atiyoga-dark.preview-aca88a423d.jpg",
  "atiyoga-light": "atiyoga-light.preview-de58ed054c.jpg",
  "yihua-dark-desktop": "yihua-dark-desktop.preview-60a8ef3f2a.jpg",
  "yihua-dark-mobile": "yihua-dark-mobile.preview-ddb13041fc.jpg",
  "yihua-light-desktop": "yihua-light-desktop.preview-f95ddbd645.jpg",
  "yihua-light-mobile": "yihua-light-mobile.preview-a5f57622c7.jpg",
  "yixi-original": "yixi-original.preview-bd6a1780d1.jpg",
  "yunmen-dark": "yunmen-dark.preview-03d89d4b6e.jpg",
  "yunmen-light": "yunmen-light.preview-ef8bb6fe18.jpg",
} as const;

export const CHART_ORIGINAL_FILENAMES = Object.keys(CHART_PREVIEWS).map(
  (key) => `${key}.jpg`,
);
