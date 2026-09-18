import type { Caption, LayoutPreset } from "./types";

export const DEFAULT_FONT_SIZE = 0.086;
export const DEFAULT_STROKE = 0.15;

export const DEFAULT_CAPTIONS: Caption[] = [
  { id: "top", text: "ВЕРХНИЙ ТЕКСТ", x: 0.5, y: 0.1 },
  { id: "bottom", text: "НИЖНИЙ ТЕКСТ", x: 0.5, y: 0.9 },
];

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "classic",
    name: "Классика",
    fontSize: 0.086,
    stroke: 0.15,
    captions: {
      top: { x: 0.5, y: 0.1 },
      bottom: { x: 0.5, y: 0.9 },
    },
  },
  {
    id: "banner",
    name: "Баннер",
    fontSize: 0.078,
    stroke: 0.14,
    captions: {
      top: { x: 0.5, y: 0.12 },
      bottom: { x: 0.5, y: 0.22 },
    },
  },
  {
    id: "title",
    name: "Титр",
    fontSize: 0.07,
    stroke: 0.13,
    captions: {
      top: { x: 0.5, y: 0.78 },
      bottom: { x: 0.5, y: 0.9 },
    },
  },
  {
    id: "center",
    name: "Центр",
    fontSize: 0.09,
    stroke: 0.16,
    captions: {
      top: { x: 0.5, y: 0.44 },
      bottom: { x: 0.5, y: 0.56 },
    },
  },
  {
    id: "stamp",
    name: "Штамп",
    fontSize: 0.052,
    stroke: 0.12,
    captions: {
      top: { x: 0.78, y: 0.82 },
      bottom: { x: 0.78, y: 0.91 },
    },
  },
];
