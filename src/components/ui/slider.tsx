import * as React from "react";
import { cn } from "@/lib/utils";

type SliderProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: number[];
  onValueChange: (value: number[]) => void;
};

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] ?? 0}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={cn(
        "h-11 w-full cursor-pointer appearance-none bg-transparent accent-fg",
        className,
      )}
      {...props}
    />
  ),
);
Slider.displayName = "Slider";

export { Slider };
