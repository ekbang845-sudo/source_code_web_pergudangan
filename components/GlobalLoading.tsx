"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalLoading() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname(); 
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsVisible(false);
  }, [pathname, searchParams]);
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleStart = () => {
      setIsVisible(true); 
    };
    const handleStop = () => {
      setIsVisible(false);
    };

    window.addEventListener("start-global-loading", handleStart);
    window.addEventListener("stop-global-loading", handleStop);

    return () => {
      window.removeEventListener("start-global-loading", handleStart);
      window.removeEventListener("stop-global-loading", handleStop);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-700 font-semibold text-sm">Tunggu Sebentar...</p>
      </div>
    </div>
  );
}