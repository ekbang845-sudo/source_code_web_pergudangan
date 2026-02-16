import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function DelayedOverlay() {
  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl delayed-loader">
      <div className="bg-white p-4 rounded-full shadow-lg border border-blue-100 flex items-center justify-center">
        <FaSpinner className="animate-spin text-[#1E88E5] text-2xl" />
      </div>
    </div>
  );
}