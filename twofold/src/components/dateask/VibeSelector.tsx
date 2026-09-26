"use client";

import { VIBES, WINDOWS } from "@data/dateask";
import { ChoiceGrid } from "./ChoiceGrid";

export function VibeSelector({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  return <ChoiceGrid choices={VIBES} value={value} onChange={onChange} columns={1} />;
}

export function WindowSelector({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  return <ChoiceGrid choices={WINDOWS} value={value} onChange={onChange} columns={1} />;
}
