"use client";

import React from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast";
import { Sidebar } from "./sidebar";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-64">
            <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
