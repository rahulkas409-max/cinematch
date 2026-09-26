"use client";

import { MEALS } from "@data/dateask";
import { ChoiceGrid } from "./ChoiceGrid";

export function MealSelector({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  return <ChoiceGrid choices={MEALS} value={value} onChange={onChange} columns={2} />;
}
