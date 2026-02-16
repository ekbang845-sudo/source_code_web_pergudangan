import Loading from "@/components/Loading";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
        {/* Spinner yang sama dengan GlobalLoading */}
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-700 font-semibold text-sm">Memuat Halaman...</p>
      </div>
    </div>
  );
}