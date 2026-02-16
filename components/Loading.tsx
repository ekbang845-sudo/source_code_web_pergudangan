import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm delayed-loader">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 min-w-50 border border-blue-100 transform scale-100">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 rounded-full absolute top-0 left-0"></div>
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-gray-800 font-bold text-lg">Loading...</h3>
          <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
        </div>
        
      </div>
    </div>
  );
}