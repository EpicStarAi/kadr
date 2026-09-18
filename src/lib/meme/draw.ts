import type { Caption, ImageFilter, TextTone } from "./types";

const FONT_STACK = '700 64px Oswald, "Arial Black", Impact, sans-serif';

export async function ensureMemeFont(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    await document.fonts.load(FONT_STACK);
    await document.fonts.ready;
  } catch {
    /* system fallback is fine */
  }
}

function filterCss(filter: ImageFilter): string {
  if (filter === "grayscale") return "grayscale(1) contrast(1.05)";
  if (filter === "contrast") return "contrast(1.28) saturate(1.12)";
  return "none";
}

function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  if (ctx.measureText(text).width <= maxWidth) return [text];

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  const pushOverflow = (token: string) => {
    let rest = token;
    while (rest && ctx.measureText(rest).width > maxWidth) {
      let lo = 1;
      let hi = rest.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (ctx.measureText(rest.slice(0, mid)).width <= maxWidth) lo = mid;
        else hi = mid - 1;
      }
      const cut = Math.max(1, lo);
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    current = rest;
  };

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (ctx.measureText(word).width > maxWidth) pushOverflow(word);
    else current = word;
  }
  if (current) lines.push(current);
  return lines;
}

export function wrapCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  return text
    .split(/\n/)
    .flatMap((line) => wrapLine(ctx, line.trimEnd(), maxWidth))
    .filter((line) => line.length > 0);
}

export type DrawOptions = {
  image: HTMLImageElement;
  captions: Caption[];
  fontSizeRatio: number;
  strokeRatio: number;
  allCaps: boolean;
  filter: ImageFilter;
  tone: TextTone;
  veil: boolean;
};

export function drawMeme(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: DrawOptions,
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = filterCss(opts.filter);
  ctx.drawImage(opts.image, 0, 0, width, height);
  ctx.filter = "none";

  if (opts.veil) {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "rgba(0,0,0,0.48)");
    g.addColorStop(0.2, "rgba(0,0,0,0)");
    g.addColorStop(0.8, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  const fontSize = Math.max(12, Math.round(width * opts.fontSizeRatio));
  ctx.font = `700 ${fontSize}px Oswald, "Arial Black", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = Math.max(1.5, fontSize * opts.strokeRatio);
  ctx.strokeStyle = opts.tone === "light" ? "#111111" : "#f4f1ea";
  ctx.fillStyle = opts.tone === "light" ? "#f7f4ee" : "#161513";

  const lineHeight = fontSize * 1.12;
  const maxWidth = width * 0.92;

  for (const cap of opts.captions) {
    const raw = cap.text.trim();
    if (!raw) continue;
    const prepared = opts.allCaps ? raw.toLocaleUpperCase("ru-RU") : raw;
    const lines = wrapCaption(ctx, prepared, maxWidth);
    if (lines.length === 0) continue;
    const blockH = lines.length * lineHeight;
    const cx = cap.x * width;
    let startY = cap.y * height - (blockH - lineHeight) / 2;
    const minY = lineHeight * 0.55;
    const maxY = height - lineHeight * 0.55 - (lines.length - 1) * lineHeight;
    startY = Math.min(Math.max(startY, minY), maxY);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const y = startY + i * lineHeight;
      ctx.strokeText(line, cx, y);
      ctx.fillText(line, cx, y);
    }
  }

  ctx.restore();
}

export function exportMemeBlob(
  image: HTMLImageElement,
  opts: Omit<DrawOptions, "image">,
  mime = "image/png",
): Promise<Blob> {
  const maxEdge = 2048;
  const nw = image.naturalWidth || image.width;
  const nh = image.naturalHeight || image.height;
  const scale = Math.min(1, maxEdge / Math.max(nw, nh));
  const width = Math.max(1, Math.round(nw * scale));
  const height = Math.max(1, Math.round(nh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas unsupported"));
  drawMeme(ctx, width, height, { ...opts, image });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Export failed"));
    }, mime);
  });
}
