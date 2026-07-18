"use client";

import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}