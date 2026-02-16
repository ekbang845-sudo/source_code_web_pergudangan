"use client";

import React, { useEffect, useState } from "react";
import Toast from "@/components/toast"; 
import { ToastDetail } from "@/utils/toastEvent"; 

export default function GlobalToast() {
  const [toastData, setToastData] = useState<ToastDetail | null>(null);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastDetail>;
      if (customEvent.detail) {
        setToastData(customEvent.detail);
      }
    };

    window.addEventListener("show-toast", handleToastEvent);

    return () => {
      window.removeEventListener("show-toast", handleToastEvent);
    };
  }, []);

  const handleClose = () => {
    setToastData(null);
  };

  if (!toastData) return null;

  return (
    <Toast
      message={toastData.message}
      type={toastData.type}
      onClose={handleClose}
    />
  );
}