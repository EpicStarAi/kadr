import { create } from "zustand";
import { DEFAULT_CAPTIONS, DEFAULT_FONT_SIZE, DEFAULT_STROKE, LAYOUT_PRESETS } from "./presets";
import { DEFAULT_TEMPLATE } from "./templates";
import type { Caption, CaptionId, ImageFilter, LayoutPreset, MemeImage, TextTone } from "./types";

type MemeState = {
  image: MemeImage;
  captions: Caption[];
  fontSize: number;
  stroke: number;
  allCaps: boolean;
  tone: TextTone;
  filter: ImageFilter;
  veil: boolean;
  selectedId: CaptionId | null;
  activePreset: string;
  setImage: (image: MemeImage) => void;
  setCaptionText: (id: CaptionId, text: string) => void;
  moveCaption: (id: CaptionId, x: number, y: number) => void;
  setFontSize: (value: number) => void;
  setStroke: (value: number) => void;
  setAllCaps: (value: boolean) => void;
  setTone: (value: TextTone) => void;
  setFilter: (value: ImageFilter) => void;
  setVeil: (value: boolean) => void;
  setSelected: (id: CaptionId | null) => void;
  applyPreset: (preset: LayoutPreset) => void;
  reset: () => void;
};

function clamp01(n: number) {
  return Math.min(0.94, Math.max(0.06, n));
}

export const useMemeStore = create<MemeState>((set) => ({
  image: { src: DEFAULT_TEMPLATE.src, name: DEFAULT_TEMPLATE.name },
  captions: DEFAULT_CAPTIONS.map((c) => ({ ...c })),
  fontSize: DEFAULT_FONT_SIZE,
  stroke: DEFAULT_STROKE,
  allCaps: true,
  tone: "light",
  filter: "none",
  veil: true,
  selectedId: null,
  activePreset: "classic",
  setImage: (image) => set({ image }),
  setCaptionText: (id, text) =>
    set((s) => ({
      captions: s.captions.map((c) => (c.id === id ? { ...c, text } : c)),
    })),
  moveCaption: (id, x, y) =>
    set((s) => ({
      captions: s.captions.map((c) =>
        c.id === id ? { ...c, x: clamp01(x), y: clamp01(y) } : c,
      ),
      selectedId: id,
      activePreset: "custom",
    })),
  setFontSize: (fontSize) => set({ fontSize, activePreset: "custom" }),
  setStroke: (stroke) => set({ stroke, activePreset: "custom" }),
  setAllCaps: (allCaps) => set({ allCaps }),
  setTone: (tone) => set({ tone }),
  setFilter: (filter) => set({ filter }),
  setVeil: (veil) => set({ veil }),
  setSelected: (selectedId) => set({ selectedId }),
  applyPreset: (preset) =>
    set((s) => ({
      fontSize: preset.fontSize,
      stroke: preset.stroke,
      activePreset: preset.id,
      captions: s.captions.map((c) => ({
        ...c,
        x: preset.captions[c.id].x,
        y: preset.captions[c.id].y,
      })),
    })),
  reset: () =>
    set((s) => ({
      captions: DEFAULT_CAPTIONS.map((c) => ({ ...c })),
      fontSize: DEFAULT_FONT_SIZE,
      stroke: DEFAULT_STROKE,
      allCaps: true,
      tone: "light",
      filter: "none",
      veil: true,
      selectedId: null,
      activePreset: LAYOUT_PRESETS[0]!.id,
      image: s.image,
    })),
}));
