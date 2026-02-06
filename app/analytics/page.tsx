"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AnalyticsContent } from "@/components/analytics/analytics-content";

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        </div>
        <AnalyticsContent />
      </div>
    </AppShell>
  );
}
