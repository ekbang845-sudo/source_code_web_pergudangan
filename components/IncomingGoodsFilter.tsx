"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFileExcel } from "react-icons/fa";
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";

const IncomingGoodsFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const handleFilter = () => {
    let start = startDate;
    let end = endDate;

    // Tukar otomatis jika tanggal awal lebih besar dari tanggal akhir
    if (start && end && new Date(start) > new Date(end)) {
      [start, end] = [end, start];
      setStartDate(start);
      setEndDate(end);
    }
    startGlobalLoading();
    const params = new URLSearchParams(searchParams.toString());
    if (start) {
      params.set("startDate", start);
    } else {
      params.delete("startDate");
    }

    if (end) {
      params.set("endDate", end);
    } else {
      params.delete("endDate");
    }

    // Reset halaman ke 1 saat melakukan filtering
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleExport = () => {
    startGlobalLoading();
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    
    // Ambil query dari URL saat ini agar hasil ekspor sesuai pencarian
    const currentQuery = searchParams.get("query");
    if (currentQuery) params.set("query", currentQuery);

    const url = `/api/export/laporan-barang-masuk?${params.toString()}`;
    window.open(url, "_blank");
    setTimeout(() => {
      stopGlobalLoading();
    }, 2000);
  };

  const isFilterApplied = searchParams.get("startDate") && searchParams.get("endDate");
  const isDateComplete = startDate !== "" && endDate !== "";
  return (
    <div className="bg-[#1E88E5] p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-white mb-4">
        Filter Data Barang Masuk
      </h2>
      <div className="bg-white h-0.5 w-full mb-6"></div>

      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-white mb-2">
            Tanggal Awal
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-900 transition-all"
          />
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-white mb-2">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-900 transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleFilter}
            disabled={!isDateComplete}
            className={`w-full sm:w-auto px-6 py-3 font-bold rounded-lg transition-all shadow-md active:scale-95 transform duration-100 ${
              isDateComplete 
                ? "bg-white text-[#1E88E5] hover:bg-blue-50 cursor-pointer" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
            }`}
          >
            Tampilkan
          </button>
          <button
            onClick={handleExport}
            disabled={!isFilterApplied}
            className={`w-full sm:w-auto px-6 py-3 font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all transform duration-100 ${
              isFilterApplied 
                ? "bg-white text-[#1E88E5] hover:bg-blue-50 active:scale-95 cursor-pointer" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70"
            }`}
          >
            <FaFileExcel size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingGoodsFilter;
