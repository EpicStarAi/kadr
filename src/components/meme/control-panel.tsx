import { useRef, type ReactNode } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { LAYOUT_PRESETS } from "@/lib/meme/presets";
import { useMemeStore } from "@/lib/meme/store";
import { TEMPLATES } from "@/lib/meme/templates";
import type { CaptionId, ImageFilter, TextTone } from "@/lib/meme/types";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX_BYTES = 12 * 1024 * 1024;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-md px-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
        active
          ? "bg-fg text-bg"
          : "bg-surface-2 text-muted shadow-[var(--shadow-border)] hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function ControlPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const image = useMemeStore((s) => s.image);
  const captions = useMemeStore((s) => s.captions);
  const fontSize = useMemeStore((s) => s.fontSize);
  const stroke = useMemeStore((s) => s.stroke);
  const allCaps = useMemeStore((s) => s.allCaps);
  const tone = useMemeStore((s) => s.tone);
  const filter = useMemeStore((s) => s.filter);
  const veil = useMemeStore((s) => s.veil);
  const selectedId = useMemeStore((s) => s.selectedId);
  const activePreset = useMemeStore((s) => s.activePreset);
  const setImage = useMemeStore((s) => s.setImage);
  const setCaptionText = useMemeStore((s) => s.setCaptionText);
  const setFontSize = useMemeStore((s) => s.setFontSize);
  const setStroke = useMemeStore((s) => s.setStroke);
  const setAllCaps = useMemeStore((s) => s.setAllCaps);
  const setTone = useMemeStore((s) => s.setTone);
  const setFilter = useMemeStore((s) => s.setFilter);
  const setVeil = useMemeStore((s) => s.setVeil);
  const setSelected = useMemeStore((s) => s.setSelected);
  const applyPreset = useMemeStore((s) => s.applyPreset);
  const reset = useMemeStore((s) => s.reset);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Нужен файл изображения");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Файл больше 12 МБ");
      return;
    }
    const src = URL.createObjectURL(file);
    setImage({ src, name: file.name });
  };

  return (
    <aside className="flex w-full flex-col gap-5 lg:h-full lg:max-w-96 lg:overflow-y-auto lg:overscroll-contain">
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <Label>Кадр</Label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-8 items-center gap-1.5 text-xs font-medium text-muted hover:text-fg"
          >
            <ImagePlus className="size-3.5" />
            Загрузить
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.currentTarget.value = "";
          }}
        />
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATES.map((tpl) => {
            const active = image.src === tpl.src;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setImage({ src: tpl.src, name: tpl.name })}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-md bg-surface-2 transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  active
                    ? "shadow-[0_0_0_2px_var(--color-fg)]"
                    : "shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
                )}
                aria-label={tpl.name}
                aria-pressed={active}
              >
                <img
                  src={tpl.src}
                  alt=""
                  className="h-full w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                />
              </button>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <Label>Макет</Label>
        <div className="flex flex-wrap gap-2">
          {LAYOUT_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              active={activePreset === preset.id}
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </Chip>
          ))}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        {(
          [
            { id: "top" as CaptionId, label: "Верхний текст" },
            { id: "bottom" as CaptionId, label: "Нижний текст" },
          ] as const
        ).map((field) => {
          const cap = captions.find((c) => c.id === field.id);
          const active = selectedId === field.id;
          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label htmlFor={`cap-${field.id}`}>{field.label}</Label>
              <Textarea
                id={`cap-${field.id}`}
                rows={2}
                value={cap?.text ?? ""}
                onChange={(e) => setCaptionText(field.id, e.target.value)}
                onFocus={() => setSelected(field.id)}
                placeholder={field.id === "top" ? "Когда…" : "Но…"}
                className={cn(active && "ring-2 ring-fg/35")}
              />
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size">Размер шрифта</Label>
            <span className="font-display text-sm tabular-nums tracking-wide text-fg">
              {Math.round(fontSize * 1000)}
            </span>
          </div>
          <Slider
            id="font-size"
            min={40}
            max={160}
            step={1}
            value={[Math.round(fontSize * 1000)]}
            onValueChange={([v]) => setFontSize((v ?? 86) / 1000)}
            aria-label="Размер шрифта"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="stroke">Контур</Label>
            <span className="font-display text-sm tabular-nums tracking-wide text-fg">
              {Math.round(stroke * 100)}
            </span>
          </div>
          <Slider
            id="stroke"
            min={0}
            max={24}
            step={1}
            value={[Math.round(stroke * 100)]}
            onValueChange={([v]) => setStroke((v ?? 15) / 100)}
            aria-label="Толщина контура"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Label>Начертание</Label>
        <div className="flex flex-wrap gap-2">
          <Chip active={allCaps} onClick={() => setAllCaps(!allCaps)}>
            Прописные
          </Chip>
          {(
            [
              { id: "light" as TextTone, label: "Светлый" },
              { id: "dark" as TextTone, label: "Тёмный" },
            ] as const
          ).map((opt) => (
            <Chip key={opt.id} active={tone === opt.id} onClick={() => setTone(opt.id)}>
              {opt.label}
            </Chip>
          ))}
          <Chip active={veil} onClick={() => setVeil(!veil)}>
            Подложка
          </Chip>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Label>Фильтр</Label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "none" as ImageFilter, label: "Исходный" },
              { id: "grayscale" as ImageFilter, label: "Ч/б" },
              { id: "contrast" as ImageFilter, label: "Контраст" },
            ] as const
          ).map((opt) => (
            <Chip key={opt.id} active={filter === opt.id} onClick={() => setFilter(opt.id)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </section>

      <Button
        variant="ghost"
        className="mt-auto hidden w-full justify-start text-muted lg:inline-flex"
        onClick={reset}
      >
        <RotateCcw className="size-4" />
        Сбросить текст и макет
      </Button>
    </aside>
  );
}
