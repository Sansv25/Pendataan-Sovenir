/**
 * Konfigurasi Akun Admin
 * Username & Password dapat disesuaikan lewat file .env.local
 */

export const ADMIN_CONFIG = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
};

const AUTH_STORAGE_KEY = 'sovenir_admin_session';

/**
 * Cek apakah session admin sedang aktif
 */
export function checkIsAdminLoggedIn() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Login admin
 */
export function loginAdmin(username, password) {
  if (
    username.trim() === ADMIN_CONFIG.username &&
    password === ADMIN_CONFIG.password
  ) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    return { success: true };
  }
  return {
    success: false,
    message: 'Username atau password admin salah.',
  };
}

/**
 * Logout admin
 */
export function logoutAdmin() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {}
}
