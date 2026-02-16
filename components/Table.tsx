"use client";

import React from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSort,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { startGlobalLoading } from "@/utils/loadingEvent";
export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface SortOption {
  label: string;
  value: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  sortOptions?: SortOption[];
  itemsPage?: number;
  entryLabel?: string;
  totalPages?: number;
  totalItems?: number;
  searchPlaceholder?: string;
  hideHeader?: boolean;
  hidePagination?: boolean;
  hideToolbar?: boolean;
}

export function Table<T>({
  columns,
  data,
  title,
  onEdit,
  onDelete,
  sortOptions,
  itemsPage = 10,
  entryLabel = "entry",
  totalPages = 1,
  totalItems,
  searchPlaceholder = "Cari...",
  hideHeader = false,
  hidePagination = false,
  hideToolbar = false,
}: TableProps<T>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("query")?.toString() || "";
  const currentSort = searchParams.get("sort")?.toString() || "";

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSort = (value: string) => {
    startGlobalLoading();
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    startGlobalLoading();
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-blue-100">
      {!hideToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {title && <h2 className="text-lg font-bold text-gray-800">{title}</h2>}

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Sort */}
            {sortOptions && (
              <div className="relative sm:w-48">
                <select
                  value={currentSort}
                  onChange={(e) => handleSort(e.target.value)}
                  className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer transition duration-150 ease-in-out text-gray-600"
                >
                  <option value="">Urutkan</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <FaSort className="h-3 w-3" />
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                defaultValue={currentSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Container with Border and Radius */}
      <div className="bg-white rounded-lg border border-blue-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {!hideHeader && (
              <thead className="bg-blue-400">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={`px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider border-b border-blue-400 ${
                        index !== columns.length - 1
                          ? "border-r border-blue-400"
                          : ""
                      } ${col.className || ""}`}
                    >
                      {col.header}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider border-b border-blue-400"
                    >
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
            )}
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
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
                data.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="odd:bg-white even:bg-blue-50 border-b border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${
                          colIndex !== columns.length - 1
                            ? "border-r border-blue-100"
                            : ""
                        } ${col.className || "text-left"}`}
                      >
                        {col.cell
                          ? col.cell(item, rowIndex)
                          : col.accessorKey
                          ? (item[col.accessorKey] as React.ReactNode)
                          : null}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
                              title="Edit"
                            >
                              <FaEdit size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination & Summary (Outside Table) */}
      {!hidePagination &&(
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-sm text-gray-600">
            Jumlah {entryLabel}:{" "}
            <span className=" text-gray-600">
              {totalItems !== undefined ? totalItems : itemsPage}
            </span>
          </p>

          <nav
            className="relative z-0 inline-flex items-center gap-2"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Current Page Circle */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#3B82F6] text-white font-bold shadow-sm">
              {currentPage}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <FaChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
