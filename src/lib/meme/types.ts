export type CaptionId = "top" | "bottom";

export type Caption = {
  id: CaptionId;
  text: string;
  x: number;
  y: number;
};

export type ImageFilter = "none" | "grayscale" | "contrast";

export type TextTone = "light" | "dark";

export type Template = {
  id: string;
  name: string;
  src: string;
};

export type LayoutPreset = {
  id: string;
  name: string;
  fontSize: number;
  stroke: number;
  captions: Record<CaptionId, { x: number; y: number }>;
};

export type MemeImage = {
  src: string;
  name: string;
};
