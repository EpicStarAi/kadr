import { useCallback, useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { CanvasStage } from "@/components/meme/canvas-stage";
import { ControlPanel } from "@/components/meme/control-panel";
import { Button } from "@/components/ui/button";
import { ensureMemeFont, exportMemeBlob } from "@/lib/meme/draw";
import { useMemeStore } from "@/lib/meme/store";

export function MemeStudio() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const image = useMemeStore((s) => s.image);
  const captions = useMemeStore((s) => s.captions);
  const fontSize = useMemeStore((s) => s.fontSize);
  const stroke = useMemeStore((s) => s.stroke);
  const allCaps = useMemeStore((s) => s.allCaps);
  const tone = useMemeStore((s) => s.tone);
  const filter = useMemeStore((s) => s.filter);
  const veil = useMemeStore((s) => s.veil);
  const setImage = useMemeStore((s) => s.setImage);
  const reset = useMemeStore((s) => s.reset);

  const download = useCallback(async () => {
    setBusy(true);
    try {
      await ensureMemeFont();
      const img = new Image();
      img.src = image.src;
      await img.decode();
      const blob = await exportMemeBlob(img, {
        captions,
        fontSizeRatio: fontSize,
        strokeRatio: stroke,
        allCaps,
        filter,
        tone,
        veil,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const slug = captions
        .map((c) => c.text.trim())
        .filter(Boolean)
        .join("-")
        .toLocaleLowerCase("ru-RU")
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
      a.href = url;
      a.download = `${slug || "kadr"}-meme.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Мем сохранён");
    } catch {
      toast.error("Не удалось скачать изображение");
    } finally {
      setBusy(false);
    }
  }, [allCaps, captions, filter, fontSize, image.src, stroke, tone, veil]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void download();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [download]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-bg">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-sm bg-stamp font-display text-sm font-semibold tracking-wide text-fg"
          >
            К
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight tracking-wide text-fg">
              KADR
            </p>
            <p className="text-xs text-muted">Генератор мемов</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" />
            Фото
          </Button>
          <Button variant="secondary" size="sm" onClick={reset} className="hidden sm:inline-flex">
            <RotateCcw className="size-4" />
            Сброс
          </Button>
          <Button size="sm" onClick={() => void download()} disabled={busy}>
            <Download className="size-4" />
            {busy ? "Сборка…" : "Скачать"}
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file?.type.startsWith("image/")) {
              setImage({ src: URL.createObjectURL(file), name: file.name });
            }
            e.currentTarget.value = "";
          }}
        />
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 py-4 sm:px-5 lg:flex-row lg:items-stretch lg:gap-8 lg:py-6">
        <section className="flex min-h-0 min-w-0 flex-col lg:flex-1">
          <CanvasStage />
          <p className="px-2 pt-2 text-center text-xs text-subtle lg:text-left">
            Перетащите подписи прямо на кадре. Загрузите своё фото или выберите шаблон.
          </p>
        </section>
        <div className="px-1 pb-24 lg:w-96 lg:shrink-0 lg:pb-2">
          <ControlPanel />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 px-3 py-3 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Button variant="secondary" className="flex-1" onClick={reset}>
            <RotateCcw className="size-4" />
            Сброс
          </Button>
          <Button className="flex-[1.4]" onClick={() => void download()} disabled={busy}>
            <Download className="size-4" />
            Скачать
          </Button>
        </div>
      </div>
    </div>
  );
}
