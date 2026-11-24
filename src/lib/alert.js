import Swal from 'sweetalert2';

/**
 * Toast notifikasi SweetAlert2 di pojok kanan atas
 */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'rounded-xl shadow-lg border border-slate-200 text-sm font-sans',
  },
});

export function toastSuccess(message) {
  return Toast.fire({
    icon: 'success',
    title: message,
  });
}

export function toastError(message) {
  return Toast.fire({
    icon: 'error',
    title: message,
  });
}

export function toastInfo(message) {
  return Toast.fire({
    icon: 'info',
    title: message,
  });
}

/**
 * Modal Alert SweetAlert2
 */
export function alertSuccess(title, text) {
  return Swal.fire({
    icon: 'success',
    title: title || 'Berhasil',
    text: text || '',
    confirmButtonText: 'Selesai',
    confirmButtonColor: '#2563eb',
    customClass: {
      popup: 'rounded-2xl font-sans',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold',
    },
  });
}

export function alertError(title, text) {
  return Swal.fire({
    icon: 'error',
    title: title || 'Gagal',
    text: text || '',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#e11d48',
    customClass: {
      popup: 'rounded-2xl font-sans',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold',
    },
  });
}

export function alertConfirm(title, text, confirmButtonText = 'Ya, Lanjutkan') {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    customClass: {
      popup: 'rounded-2xl font-sans',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold',
      cancelButton: 'px-5 py-2.5 rounded-xl font-semibold',
    },
  });
}

export default Swal;
