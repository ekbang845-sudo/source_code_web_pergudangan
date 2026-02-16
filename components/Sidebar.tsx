"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { startGlobalLoading } from "@/utils/loadingEvent";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  user?: {
    name?: string | null;
    role?: string | null;
  };
}

const Sidebar = ({
  isMobileOpen = false,
  onMobileClose,
  user,
}: SidebarProps) => {
  const pathname = usePathname();

  const [openManajemen, setOpenManajemen] = useState(() => 
    pathname.includes("/data-barang") || 
    pathname.includes("/barang-masuk") || 
    pathname.includes("/barang-keluar")
  );

  const [openLaporan, setOpenLaporan] = useState(() => 
    pathname.includes("/laporan-stok") || 
    pathname.includes("/laporan-barang-masuk") || 
    pathname.includes("/laporan-barang-keluar")
  );

  const [collapsed, setCollapsed] = useState(false);

  const isDashboardActive = pathname === "/admin/dashboard";
  
  const isManajemenActive = 
    pathname.includes("/data-barang") || 
    pathname.includes("/barang-masuk") || 
    pathname.includes("/barang-keluar");

  const isPinjamActive = pathname.includes("/pinjam-barang");
  const isAkunActive = pathname.includes("/manajemen-akun");
  
  const isLaporanActive = 
    pathname.includes("/laporan-stok") || 
    pathname.includes("/laporan-barang-masuk") || 
    pathname.includes("/laporan-barang-keluar");

  const activeSubMenu = pathname.includes("/data-barang") ? "data_barang"
    : pathname.includes("/barang-masuk") ? "barang_masuk"
    : pathname.includes("/barang-keluar") ? "barang_keluar"
    : pathname.includes("/laporan-stok") ? "laporan_stok"
    : pathname.includes("/laporan-barang-masuk") ? "Laporan_barang_masuk"
    : pathname.includes("/laporan-barang-keluar") ? "laporan_barang_keluar"
    : "";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); 


  useEffect(() => {
    if (
      pathname.includes("/data-barang") || 
      pathname.includes("/barang-masuk") || 
      pathname.includes("/barang-keluar")
    ) {
      setOpenManajemen(true); 
    }
    if (
      pathname.includes("/laporan-stok") || 
      pathname.includes("/laporan-barang-masuk") || 
      pathname.includes("/laporan-barang-keluar")
    ) {
      setOpenLaporan(true); 
    }
  }, [pathname]);

  const getBaseClass = (collapsed: boolean) => 
    `group relative w-full py-3 flex items-center rounded-r-lg transition-all duration-200 select-none border-l-4
     ${collapsed ? "justify-center px-2" : "justify-start px-4 gap-3"}`;
  
  const activeClass = "border-l-white bg-[#1E88E5] text-white shadow-md shadow-blue-200"; 
  const openClass = "border-l-[#1E88E5] bg-blue-50 text-blue-700 font-semibold";
  const inactiveClass = "border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-l-[#1E88E5]";

  const subMenuBaseClass = "w-full py-2.5 pl-10 pr-2 flex text-sm transition-all duration-200 rounded-r-lg cursor-pointer mb-1 border-l-4 border-transparent hover:border-l-blue-300 hover:bg-blue-50";
  const subMenuActive = "bg-blue-100 text-blue-700 font-medium border-l-[#1E88E5]"; 
  const subMenuInactive = "text-slate-500 hover:text-blue-600 font-normal";

  const handleDirectClick = () => {
    startGlobalLoading();
    if (onMobileClose) onMobileClose(); 
  };

  const toggleManajemen = () => {
    if (collapsed) setCollapsed(false); 
    setOpenManajemen(!openManajemen);
  };

  const toggleLaporan = () => {
    if (collapsed) setCollapsed(false); 
    setOpenLaporan(!openLaporan);
  };

  const handleSubMenuClick = () => {
    startGlobalLoading();
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      <aside
        className={`
            fixed inset-y-0 left-0 z-50 h-full bg-white shadow-2xl transition-all duration-300 flex flex-col border-r border-gray-100
            md:static md:translate-x-0
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            ${collapsed ? "md:w-20" : "md:w-72"}
            w-64
        `}
      >
        {/* --- HEADER --- */}
        <div className="h-20 flex items-center justify-between px-4 w-full bg-[#1E88E5] shadow-sm shrink-0">
          {!collapsed && (
            <h2 className="text-lg font-bold text-white truncate tracking-wide animate-fadeIn">
              Gudang Kelurahan
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-white p-1 rounded-md hover:bg-white/20 transition-colors focus:outline-none hidden md:block
              ${collapsed ? "mx-auto" : ""}`} 
          >
            <img
              src={collapsed ? "/three_dot_icon.png" : "/hamburger_icon.png"}
              alt="menu"
              className="w-6 h-6"
            />
          </button>

          <button className="text-white md:hidden" onClick={onMobileClose}>
            <FaTimes size={24} />
          </button>
        </div>

        <div
          className={`flex items-center border-b-2 border-gray-300 shrink-0 bg-white transition-all duration-300
                ${collapsed ? "justify-center py-4 px-2 h-20" : "gap-3 py-8 px-6 h-auto"}`}
        >
          <img
            src={collapsed ? "/logo_kelurahan_icon.png" : "/logo_kelurahan_expand.png"}
            alt="logo kelurahan"
            className={`object-contain transition-all duration-300
                ${collapsed ? "w-10 h-10" : "h-20 w-auto"}`}
          />
        </div>

        {/* --- MENU ITEMS --- */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar space-y-2">
          
          {/* DASHBOARD */}
          <Link href="/admin/dashboard" className="block w-full">
            <div
              onClick={handleDirectClick} 
              className={`${getBaseClass(collapsed)} ${
                isDashboardActive ? activeClass : inactiveClass
              }`}
            >
              <img
                src={isDashboardActive ? "/dashboard_white_icon.png" : "/dashboard_icon.png"}
                alt="dashboard"
                className={`shrink-0 ${collapsed ? "w-6 h-6" : "w-5 h-5"}`}
              />
              
              {!collapsed && <span className="font-medium whitespace-nowrap">Dashboard</span>}
            </div>
          </Link>

          {/* MANAJEMEN BARANG */}
          <div className="w-full">
            <button
              onClick={toggleManajemen} 
              className={`${getBaseClass(collapsed)} w-full
                ${
                  isManajemenActive ? activeClass : 
                  openManajemen ? openClass : 
                  inactiveClass
                }`}
            >
              <img
                src={isManajemenActive ? "/barang_white_icon.png" : "/barang_icon.png"}
                alt="manajemen barang"
                className={`shrink-0 ${collapsed ? "w-6 h-6" : "w-5 h-5"}`}
              />
              
              {!collapsed && (
                <>
                  <span className="flex-1 text-left font-medium whitespace-nowrap ml-3">Manajemen Barang</span>
                  <img
                    src={isManajemenActive ? "/up_icon.png" : "/up_default_icon.png"}
                    className={`w-4 h-4 transition-transform duration-300 shrink-0 ${
                       openManajemen ? "rotate-0" : "rotate-180"
                    }`}
                    alt="dropdown"
                  />
                </>
              )}
            </button>

            {/* Submenu */}
            {!collapsed && (
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out
                ${openManajemen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
              >
                <Link href="/admin/dashboard/data-barang">
                  <div onClick={handleSubMenuClick} className={`${subMenuBaseClass} ${activeSubMenu === "data_barang" ? subMenuActive : subMenuInactive}`}>
                    Data Barang
                  </div>
                </Link>
                <Link href="/admin/dashboard/barang-masuk">
                  <div onClick={handleSubMenuClick} className={`${subMenuBaseClass} ${activeSubMenu === "barang_masuk" ? subMenuActive : subMenuInactive}`}>
                    Barang Masuk
                  </div>
                </Link>
                <Link href="/admin/dashboard/barang-keluar">
                  <div onClick={handleSubMenuClick} className={`${subMenuBaseClass} ${activeSubMenu === "barang_keluar" ? subMenuActive : subMenuInactive}`}>
                    Barang Keluar
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* PINJAM BARANG */}
          <Link href="/admin/dashboard/pinjam-barang" className="block w-full">
            <div
              onClick={handleDirectClick} 
              className={`${getBaseClass(collapsed)} ${
                isPinjamActive ? activeClass : inactiveClass
              }`}
            >
              <img
                src={isPinjamActive ? "/pinjam_white_icon.png" : "/pinjam_icon.png"}
                alt="pinjam barang"
                className={`shrink-0 ${collapsed ? "w-6 h-6" : "w-5 h-5"}`}
              />
              
              {!collapsed && <span className="font-medium whitespace-nowrap">Pinjam Barang</span>}
            </div>
          </Link>

          {/* MANAJEMEN AKUN */}
          {user?.role === "admin" && (
            <Link href="/admin/dashboard/manajemen-akun" className="block w-full">
              <div
                onClick={handleDirectClick} 
                className={`${getBaseClass(collapsed)} ${
                  isAkunActive ? activeClass : inactiveClass
                }`}
              >
                <img
                  src={isAkunActive ? "/m_akun_white_icon.png" : "/m_akun_icon.png"}
                  alt="manajemen akun"
                  className={`shrink-0 ${collapsed ? "w-6 h-6" : "w-5 h-5"}`}
                />
                
                {!collapsed && <span className="font-medium whitespace-nowrap">Manajemen Akun</span>}
              </div>
            </Link>
          )}

          {/* LAPORAN */}
          <div className="w-full">
            <button
              onClick={toggleLaporan} 
              className={`${getBaseClass(collapsed)} w-full
                ${
                  isLaporanActive ? activeClass :
                  openLaporan ? openClass :
                  inactiveClass
                }`}
            >
              <img
                src={isLaporanActive ? "/laporan_white_icon.png" : "/laporan_icon.png"}
                alt="laporan"
                className={`shrink-0 ${collapsed ? "w-6 h-6" : "w-5 h-5"}`}
              />
              
              {!collapsed && (
                <>
                  <span className="flex-1 text-left font-medium whitespace-nowrap ml-3">Laporan</span>
                  <img
                    src={isLaporanActive ? "/up_icon.png" : "/up_default_icon.png"}
                    className={`w-4 h-4 transition-transform duration-300 shrink-0 ${
                       openLaporan ? "rotate-0" : "rotate-180"
                    }`}
                    alt="dropdown"
                  />
                </>
              )}
            </button>

            {/* Submenu */}
            {!collapsed && (
              <div 
                 className={`overflow-hidden transition-all duration-300 ease-in-out
                 ${openLaporan ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
              >
                <Link href="/admin/dashboard/laporan/laporan-stok">
                  <div onClick={handleSubMenuClick} className={`${subMenuBaseClass} ${activeSubMenu === "laporan_stok" ? subMenuActive : subMenuInactive}`}>
                    Laporan Stok
                  </div>
                </Link>
                <Link href="/admin/dashboard/laporan/laporan-barang-masuk">
                  <div onClick={handleSubMenuClick} className={`${subMenuBaseClass} ${activeSubMenu === "Laporan_barang_masuk" ? subMenuActive : subMenuInactive}`}>
                    Laporan Barang Masuk
                  </div>
                </Link>
                <Link href="/admin/dashboard/laporan/laporan-barang-keluar">
                  <div onClick={handleSubMenuClick} className={`${subMenuBaseClass} ${activeSubMenu === "laporan_barang_keluar" ? subMenuActive : subMenuInactive}`}>
                    Laporan Barang Keluar
                  </div>
                </Link>
              </div>
            )}
          </div>

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;