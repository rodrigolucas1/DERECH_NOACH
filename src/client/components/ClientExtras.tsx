"use client";

import { GuidedTour } from "@/client/components/GuidedTour";
import { ContextHelp } from "@/client/components/ContextHelp";

export function ClientExtras() {
  return (
    <>
      <GuidedTour />
      <ContextHelp module="general" />
    </>
  );
}
