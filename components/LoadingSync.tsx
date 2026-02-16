"use client";
import { useEffect } from "react";
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";

export default function LoadingSync({ isPending }: { isPending: boolean }) {
  useEffect(() => {
    if (isPending) {
      startGlobalLoading();
    } else {
      stopGlobalLoading();
    }
    return () => stopGlobalLoading();
  }, [isPending]);

  return null; 
}