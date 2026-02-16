import Swal, { SweetAlertResult } from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end', 
  showConfirmButton: false,
  timer: 3000,         
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: 'colored-toast', 
  }
});

/**
 * Tampilkan Notifikasi Sukses (Hijau)
 * @param message 
 */
export const showSuccessToast = (message: string) => {
  return Toast.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: message,
  });
};

/**
 * Tampilkan Notifikasi Error (Merah)
 * @param message 
 */
export const showErrorToast = (message: string) => {
  return Toast.fire({
    icon: 'error',
    title: 'Gagal!',
    text: message,
  });
};

/**
 * Tampilkan Dialog Konfirmasi (Untuk Delete/Update kritis)
 * @param title 
 * @param text 
 * @param confirmButtonText
 */
export const showConfirmDialog = async (
  title: string = 'Apakah Anda yakin?',
  text: string = "Data ini mungkin tidak bisa dikembalikan!",
  confirmButtonText: string = 'Ya, Lanjutkan!'
): Promise<SweetAlertResult> => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1E88E5', 
    cancelButtonColor: '#d33',     
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Batal',
    reverseButtons: true           
  });
};


export const showLoadingAlert = (title: string = 'Mohon Tunggu...') => {
  Swal.fire({
    title: title,
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
};


export const closeAlert = () => {
  Swal.close();
};