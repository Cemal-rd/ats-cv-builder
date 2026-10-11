"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Gauge, PenLine } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { AtsPanel } from "@/components/ats/ats-panel";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { PrintableResume } from "@/components/preview/printable-resume";
import { SegmentedControl, type SegmentedOption } from "@/components/ui/segmented-control";
import { useFormStoreSync } from "@/hooks/use-form-store-sync";
import { resumeSchema, type Resume } from "@/lib/schema/resume";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/resume-store";
import { AppHeader } from "./app-header";
import { EditorPanel } from "./editor-panel";

type BuilderView = "edit" | "ats" | "preview";

const MOBILE_VIEWS: readonly SegmentedOption<BuilderView>[] = [
  { value: "edit", label: "Düzenle", icon: PenLine },
  { value: "ats", label: "ATS Analizi", icon: Gauge },
  { value: "preview", label: "Önizleme", icon: Eye },
];
const DESKTOP_VIEWS = MOBILE_VIEWS.slice(0, 2);

export function ResumeBuilder() {
  const form = useForm<Resume>({
    resolver: zodResolver(resumeSchema),
    defaultValues: useResumeStore.getState().resume,
    mode: "onChange",
  });
  useFormStoreSync(form);

  const [view, setView] = useState<BuilderView>("edit");
  const leftView = view === "ats" ? "ats" : "edit";

  return (
    <FormProvider {...form}>
      <div className="flex h-dvh flex-col print:hidden">
        <AppHeader onScoreClick={() => setView("ats")} />

        {/* Mobil: form / analiz / önizleme sekmeli geçiş */}
        <div className="border-b px-4 py-2 lg:hidden">
          <SegmentedControl ariaLabel="Görünüm" value={view} options={MOBILE_VIEWS} onChange={setView} className="flex w-full" />
        </div>

        <main className="flex min-h-0 flex-1">
          <section
            aria-label="Düzenleme"
            className={cn(
              "min-h-0 w-full flex-col lg:flex lg:w-1/2 lg:border-r xl:w-[46%]",
              view === "preview" ? "hidden" : "flex",
            )}
          >
            <div className="hidden border-b px-4 py-2 lg:block">
              <SegmentedControl ariaLabel="Sol panel" value={leftView} options={DESKTOP_VIEWS} onChange={setView} />
            </div>
            {/* Paneller CSS ile gizlenir; form state ve odak korunur. */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className={cn(leftView !== "edit" && "hidden")}>
                <EditorPanel />
              </div>
              <div className={cn(leftView !== "ats" && "hidden")}>
                <AtsPanel />
              </div>
            </div>
          </section>

          <section
            aria-label="Önizleme"
            className={cn("min-h-0 flex-1 flex-col bg-muted/50 lg:flex", view === "preview" ? "flex" : "hidden")}
          >
            <PreviewPanel />
          </section>
        </main>
      </div>

      <PrintableResume />
    </FormProvider>
  );
}
