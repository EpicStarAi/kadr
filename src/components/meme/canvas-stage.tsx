import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { toast } from "sonner";
import { drawMeme, ensureMemeFont } from "@/lib/meme/draw";
import { useMemeStore } from "@/lib/meme/store";
import type { CaptionId } from "@/lib/meme/types";
import { cn } from "@/lib/utils";

const MAX_BYTES = 12 * 1024 * 1024;

export function CanvasStage() {
  const image = useMemeStore((s) => s.image);
  const captions = useMemeStore((s) => s.captions);
  const fontSize = useMemeStore((s) => s.fontSize);
  const stroke = useMemeStore((s) => s.stroke);
  const allCaps = useMemeStore((s) => s.allCaps);
  const tone = useMemeStore((s) => s.tone);
  const filter = useMemeStore((s) => s.filter);
  const veil = useMemeStore((s) => s.veil);
  const selectedId = useMemeStore((s) => s.selectedId);
  const moveCaption = useMemeStore((s) => s.moveCaption);
  const setSelected = useMemeStore((s) => s.setSelected);
  const setImage = useMemeStore((s) => s.setImage);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ id: CaptionId; pointerId: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [ratio, setRatio] = useState(4 / 3);
  const [over, setOver] = useState(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawMeme(ctx, canvas.width, canvas.height, {
      image: img,
      captions,
      fontSizeRatio: fontSize,
      strokeRatio: stroke,
      allCaps,
      filter,
      tone,
      veil,
    });
  }, [allCaps, captions, filter, fontSize, stroke, tone, veil]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    const img = new Image();
    img.decoding = "async";
    img.src = image.src;
    img.onload = async () => {
      await ensureMemeFont();
      if (cancelled) return;
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxEdge = 1400;
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      setRatio(img.naturalWidth / img.naturalHeight);
      setReady(true);
    };
    img.onerror = () => {
      if (!cancelled) setReady(false);
    };
    return () => {
      cancelled = true;
    };
  }, [image.src]);

  useEffect(() => {
    if (ready) paint();
  }, [paint, ready]);

  const clientToNorm = (clientX: number, clientY: number) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return { x: 0.5, y: 0.5 };
    return {
      x: (clientX - box.left) / box.width,
      y: (clientY - box.top) / box.height,
    };
  };

  const onPointerDown = (id: CaptionId, e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id, pointerId: e.pointerId };
    setSelected(id);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const { x, y } = clientToNorm(e.clientX, e.clientY);
    moveCaption(drag.id, x, y);
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  };

  const takeFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Нужен файл изображения");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Файл больше 12 МБ");
      return;
    }
    setImage({ src: URL.createObjectURL(file), name: file.name });
  };

  return (
    <div className="flex min-h-0 items-center justify-center p-3 sm:p-5 lg:flex-1">
      <div
        ref={wrapRef}
        className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-surface-2 shadow-[var(--shadow-well)]"
        style={{ aspectRatio: ratio }}
        onPointerDown={() => setSelected(null)}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          takeFile(e.dataTransfer.files[0]);
        }}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "block h-full w-full object-contain transition-opacity duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
        {!ready && (
          <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden />
        )}
        {over && (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-bg/70 font-display text-lg tracking-wide text-fg">
            ОТПУСТИТЕ ФОТО
          </div>
        )}
        {captions.map((cap) => {
          if (!cap.text.trim()) return null;
          const selected = selectedId === cap.id;
          return (
            <button
              key={cap.id}
              type="button"
              aria-label={
                cap.id === "top" ? "Перетащить верхний текст" : "Перетащить нижний текст"
              }
              onPointerDown={(e) => onPointerDown(cap.id, e)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={cn(
                "absolute z-10 h-14 w-4/5 min-h-11 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-md border border-dashed border-transparent bg-transparent active:cursor-grabbing",
                selected
                  ? "border-fg/70"
                  : "hover:border-fg/30",
              )}
              style={{ left: `${cap.x * 100}%`, top: `${cap.y * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
