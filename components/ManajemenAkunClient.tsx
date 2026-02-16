"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Column } from "@/components/Table";
import { FaUserPlus, FaUsersCog, FaTrash } from "react-icons/fa";
import DeleteModal from "@/components/DeleteModal";
import { deleteUser } from "@/lib/action";
import EditAkunButton from "./EditAkunButton"; 
import Toast from "@/components/toast"; 
import { startGlobalLoading } from "@/utils/loadingEvent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ManajemenAkunClientProps {
  data: User[];
  totalPages: number;
  totalItems: number;
}

export default function ManajemenAkunClient({
  data,
  totalPages,
  totalItems,
}: ManajemenAkunClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const columns: Column<User>[] = [
    {
      header: "No",
      className: "text-center",
      cell: (_, index) => (
        <span className="font-semibold text-gray-600">
          {(currentPage - 1) * 5 + index + 1}
        </span>
      ),
    },
    { 
      header: "Nama Lengkap", 
      accessorKey: "name",
      className: "text-center",
    },
    { header: "Email", accessorKey: "email", className: "text-center" },
    {
      header: "Role / Jabatan",
      accessorKey: "role",
      className: "text-center",
      cell: (item) => {
        const isAdmin = item.role.toLowerCase() === "admin";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              isAdmin
                ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isAdmin ? "Admin" : "Staff Gudang"}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      cell: (user) => (
        <div className="flex gap-2 justify-center">
          <EditAkunButton user={user} />
          <button
            onClick={() => onClickDeleteIcon(user)}
            className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200 transition-colors"
            title="Hapus Akun"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    startGlobalLoading();
    router.push("/admin/dashboard/manajemen-akun/add");
  };

  const onClickDeleteIcon = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);

    try {
      const result = await deleteUser(selectedUser.id);

      if (result.success) {
        setToast({ message: "Akun berhasil dihapus!", type: "success" });
        setIsDeleteOpen(false); 
        router.refresh(); 
      } else {
        setToast({ message: result.message || "Gagal menghapus akun!", type: "error" });
        setIsDeleteOpen(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setToast({ message: "Terjadi kesalahan sistem.", type: "error" });
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
            <FaUsersCog size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Akun</h1>
            <p className="text-gray-500 text-sm">
              Kelola data pengguna sistem gudang kelurahan
            </p>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <FaUserPlus />
          Tambah Staff
        </button>
      </div>

      <Table<User>
        title="Data Akun Staff"
        data={data}
        columns={columns}
        searchPlaceholder="Cari nama atau email..."
        itemsPage={5}
        entryLabel="staff"
        totalPages={totalPages}
        totalItems={totalItems}
        sortOptions={[
          { label: "Terbaru", value: "createdAt-desc" }, 
          { label: "Nama (A-Z)", value: "name-asc" },    
          { label: "Nama (Z-A)", value: "name-desc" },   
          { label: "Role (desc)", value: "role-asc" },    
          { label: "Email (A-Z)", value: "email-asc" },  
        ]}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Akun Pengguna"
        itemName={selectedUser?.name}
        message="Apakah Anda yakin ingin menghapus akun ini? Pengguna tidak akan bisa login lagi ke dalam sistem."
      />
    </div>
  );
}