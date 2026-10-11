"use client";

import dynamic from "next/dynamic";

/**
 * Builder yalnızca istemcide render edilir: veriler localStorage'dan gelir,
 * sunucu render'ı hidrasyon uyuşmazlığına yol açardı.
 */
const ResumeBuilder = dynamic(() => import("./resume-builder").then((m) => m.ResumeBuilder), {
  ssr: false,
  loading: BuilderSkeleton,
});

export function BuilderLoader() {
  return <ResumeBuilder />;
}

function BuilderSkeleton() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true" aria-label="Yükleniyor">
      <div className="h-14 border-b" />
      <div className="flex flex-1">
        <div className="w-full space-y-3 p-4 lg:w-1/2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="hidden flex-1 bg-muted/50 p-6 lg:block">
          <div className="mx-auto aspect-[210/297] max-w-xl animate-pulse rounded bg-background" />
        </div>
      </div>
    </div>
  );
}
