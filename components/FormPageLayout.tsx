import React from "react";
import Link from "next/link";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { IconType } from "react-icons";
import { startGlobalLoading } from "@/utils/loadingEvent";
interface FormPageLayoutProps {
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  backLink: string;
  children: React.ReactNode;
  buttonText?: string;
}

export default function FormPageLayout({
  title,
  description,
  onSubmit,
  isLoading,
  backLink,
  children,
  buttonText = "Simpan Data",
}: FormPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={backLink}
            onClick={() => startGlobalLoading()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6 group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-all">
              <FaArrowLeft className="text-blue-600" />
            </div>
            <span className="font-medium text-lg">Kembali</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">{description}</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-blue-600 overflow-hidden ring-1 ring-gray-900/5">
          <div className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              {children}

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <Link
                  href={backLink}
                  onClick={() => startGlobalLoading()}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    buttonText
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: IconType;
  helperText?: string;
  helperClassName?: string;
}

export function FormInput({
  label,
  icon: Icon,
  helperText,
  helperClassName,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon />
          </div>
        )}
        <input
          className={`block w-full rounded-lg border-gray-300 border px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 ${
            Icon ? "pl-10" : ""
          }`}
          {...props}
        />
      </div>
      {helperText && (
        <p className={`text-xs mt-1 ${helperClassName || "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: IconType;
  children: React.ReactNode;
}

export function FormSelect({
  label,
  icon: Icon,
  children,
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon />
          </div>
        )}
        <select
          className={`block w-full rounded-lg border-gray-300 border px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            Icon ? "pl-10" : ""
          }`}
          {...props}
        >
          {children}
        </select>
      </div>
    </div>
  );
}
