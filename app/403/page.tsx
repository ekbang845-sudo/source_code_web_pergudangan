export default function ForbiddenPage() {
  return (
    <div className="flex h-screen items-center justify-center text-center">
      <div>
        <h1 className="text-6xl font-bold text-red-600">403</h1>
        <p className="text-xl mt-4">Akses Ditolak: Anda tidak memiliki izin untuk halaman ini.</p>
        <a href="/login" className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded">
          Kembali ke Login
        </a>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";