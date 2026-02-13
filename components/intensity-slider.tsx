"use client";

import { Slider } from "@/components/ui/slider";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Intensity</label>
        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Mild</span>
        <span>Intense</span>
      </div>
    </div>
  );
}
