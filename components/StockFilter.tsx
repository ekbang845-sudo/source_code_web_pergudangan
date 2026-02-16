"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFileExcel, FaChevronDown } from "react-icons/fa";
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";

const StockFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [filterStok, setFilterStok] = useState(
    searchParams.get("filter") || ""
  );

  const handleFilter = () => {
    startGlobalLoading();
    const params = new URLSearchParams(searchParams.toString());
    if (filterStok) {
      params.set("filter", filterStok);
    } else {
      params.delete("filter");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };
  const handleExport = () => {
    startGlobalLoading();
    const currentFilter = searchParams.get("filter") || "";
    const currentQuery = searchParams.get("query") || "";
    
    const params = new URLSearchParams();
    if (currentFilter) params.set("filter", currentFilter);
    if (currentQuery) params.set("query", currentQuery);

    const url = `/api/export/laporan-stok?${params.toString()}`;
    window.open(url, "_blank");
    setTimeout(() => {
      stopGlobalLoading(); 
    }, 2000);
  };

  const isFilterReady = filterStok !== "";
  
  const isExportActive = searchParams.get("filter");


  return (
    <div className="bg-[#1E88E5] p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-white mb-4">
        Filter Data Stok
      </h2>
      <div className="bg-white h-0.5 w-full mb-6"></div>

      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-white mb-2">
            Stok *
          </label>
          <div className="relative">
            <select
              value={filterStok}
              onMouseDown={() => setIsOpen(!isOpen)}
              onBlur={() => setIsOpen(false)}
              onChange={(e) => {
                setFilterStok(e.target.value);
                (e.target as HTMLSelectElement).blur(); 
              }}
              className={`w-full p-3 pr-10 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all 
                cursor-pointer text-gray-800 
                outline-none focus:outline-none 
              hover:border-blue-400 
                [-webkit-tap-highlight-color:transparent]
                ${filterStok === "" ? "text-gray-800" : "text-gray-800"
              }`}
            >
              <option value="" className="text-gray-800">
                --Pilih Kategori Stok--
              </option>
              <option value="semua" className="text-gray-800">
                Tampilkan Semua
              </option>
              <option value="habis" className="text-gray-800">
                Stok Habis (= 0)
              </option>
            </select>
            <div className={`absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-600 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}>
              <FaChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleFilter}
            disabled={!isFilterReady}
            className={`w-full sm:w-auto px-6 py-3 font-bold rounded-lg transition-all shadow-md active:scale-95 transform duration-100 ${
              isFilterReady 
                ? "bg-white text-[#1E88E5] hover:bg-blue-50" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Tampilkan
          </button>
          <button
            onClick={handleExport}
            disabled={!isExportActive}
            className={`w-full sm:w-auto px-6 py-3 font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all transform duration-100 ${
              isExportActive
                ? "bg-white text-[#1E88E5] hover:bg-blue-50"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

export default StockFilter;
