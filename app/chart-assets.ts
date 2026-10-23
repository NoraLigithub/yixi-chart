export const CHART_PREVIEWS = {
  "atiyoga-dark": "atiyoga-dark.preview-aca88a423d.jpg",
  "atiyoga-light": "atiyoga-light.preview-de58ed054c.jpg",
  "dzogchen4-dark": "dzogchen4-dark.preview-39fcbe0706.jpg",
  "dzogchen4-light": "dzogchen4-light.preview-9fc9724755.jpg",
  "dzogchen3-dark": "dzogchen3-dark.preview-ed44491270.jpg",
  "dzogchen3-light": "dzogchen3-light.preview-da6bf19c89.jpg",
  "huayan-dark": "huayan-dark.preview-0d971c6970.jpg",
  "huayan-light": "huayan-light.preview-2abef4e531.jpg",
  "huayan5-dark": "huayan5-dark.preview-71ff79d266.jpg",
  "huayan5-light": "huayan5-light.preview-a515bd9248.jpg",
  "tiantai-dark": "tiantai-dark.preview-d4f97264cc.jpg",
  "tiantai-light": "tiantai-light.preview-4cb8695838.jpg",
  "yihua-classic": "yihua-classic.preview-ef8547fd1f.jpg",
  "yihua-dark-desktop": "yihua-dark-desktop.preview-7bdc2f0ca3.jpg",
  "yihua-dark-mobile": "yihua-dark-mobile.preview-06070faaed.jpg",
  "yihua-light-desktop": "yihua-light-desktop.preview-7b31f5fe07.jpg",
  "yihua-light-mobile": "yihua-light-mobile.preview-fca7243dc2.jpg",
  "yixi-dark": "yixi-dark.preview-0a6e885663.jpg",
  "yixi-light": "yixi-light.preview-b8c36952e8.jpg",
  "yunmen-dark": "yunmen-dark.preview-a4cb4f0c4e.jpg",
  "yunmen-light": "yunmen-light.preview-62022aea7f.jpg",
} as const;

export const CHART_ORIGINAL_FILENAMES = Object.keys(CHART_PREVIEWS).map(
  (key) => `${key}.jpg`,
);
