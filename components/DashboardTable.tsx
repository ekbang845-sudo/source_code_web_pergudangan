"use client";

import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface DashboardTableProps<T> {
  columns: Column<T>[];
  data: T[];
  filterKey?: keyof T;
  filterOptions?: string[];
  title?: string;
  icon?: string;
  lastUpdate?: string; // Di RecentData anda kirim string, jadi ini string
  itemsPage?: number; 
  hidePagination?: boolean;
}

export function DashboardTable<T>({
  columns,
  data,
  filterKey,
  filterOptions,
  title,
  icon,
  lastUpdate,
  itemsPage = 5, // Default 5 jika tidak diisi
  hidePagination = false, // Default false (muncul) jika tidak diisi
}: DashboardTableProps<T>) {
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // 1. UBAH DI SINI: Gunakan itemsPage dari props, bukan hardcode 4
  const itemsPerPage = itemsPage;

  const filteredData =
    filterKey && selectedFilter
      ? data.filter((item) => String(item[filterKey]) === selectedFilter)
      : data;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  // 2. LOGIKA DATA: Jika hidePagination true, ambil saja data awal tanpa paging
  const currentData = hidePagination 
    ? filteredData.slice(0, itemsPerPage) 
    : filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="bg-blue-50 p-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        {title && (
          <div className="flex items-center gap-2">
            {icon && (
              <Image src={icon} width={24} height={24} alt={`${title} icon`} />
            )}
            <h2 className="text-xl font-bold text-[#1e88e5]">{title}</h2>
          </div>
        )}

        {filterKey && filterOptions && (
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="appearance-none bg-white border border-blue-300 rounded-md pl-4 pr-10 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-blue-50"
            >
              <option value="">Filter</option>
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-t-xl overflow-hidden border border-blue-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-400 text-white text-sm font-bold">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-center border-b border-blue-400 ${
                    index !== columns.length - 1
                      ? "border-r border-blue-400"
                      : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-gray-500 bg-white h-64"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="font-medium">Data belum tersedia</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {currentData.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="odd:bg-white even:bg-blue-50 border-b border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 py-3 text-gray-700 ${
                          colIndex !== columns.length - 1
                            ? "border-r border-blue-100"
                            : ""
                        } ${col.className || "text-left"}`}
                      >
                        {col.cell
                          ? col.cell(item, startIndex + rowIndex)
                          : col.accessorKey
                          ? (item[col.accessorKey] as React.ReactNode)
                          : null}
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* 3. HAPUS BAGIAN PENGISI BARIS KOSONG (EMPTY ROWS) 
                   Agar tampilan dashboard lebih padat dan tidak ada baris putih kosong
                   jika data kurang dari 10.
                */}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Kontrol Pagination */}
      <div className="flex justify-between items-center mt-4 px-1">
        {/* Last Update tetap muncul */}
        {lastUpdate ? (
          <p className="text-sm text-gray-700">{lastUpdate}</p>
        ) : (
          <div></div>
        )}

        {/* 4. UBAH DI SINI: Sembunyikan tombol pagination jika hidePagination = true */}
        {!hidePagination && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-1 rounded-full hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>

            <div className="bg-blue-500 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm shadow-sm">
              {currentPage}
            </div>

            {totalPages > 1 && currentPage < totalPages && (
              <span className="text-gray-500 font-bold">...</span>
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1 rounded-full hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}