"use client";

import { GuidedTour } from "@/client/components/GuidedTour";
import { ContextHelp } from "@/client/components/ContextHelp";
import { TrainingModeToggle } from "@/client/components/TrainingModeToggle";

export function ClientExtras() {
  return (
    <>
      <GuidedTour />
      <ContextHelp module="general" />
      <TrainingModeToggle />
    </>
  );
}
