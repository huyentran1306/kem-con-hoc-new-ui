/**
 * Hình nền khung admin (kiểu Outlook): ảnh vườn, sáng, be, tối.
 * Lựa chọn chỉ là tiện ích riêng của từng máy, lưu localStorage (bọc try/catch).
 */
export const WALLPAPER_KEY = 'kem-con-hoc:admin-wallpaper'

export const WALLPAPERS = [
  { id: 'garden', label: 'Ảnh vườn' },
  { id: 'light', label: 'Nền sáng' },
  { id: 'beige', label: 'Nền be' },
  { id: 'dark', label: 'Nền tối' },
]

export function readWallpaper() {
  try {
    const v = localStorage.getItem(WALLPAPER_KEY)
    if (WALLPAPERS.some((w) => w.id === v)) return v
  } catch (e) {}
  return 'garden'
}

export function saveWallpaper(id) {
  try {
    localStorage.setItem(WALLPAPER_KEY, id)
  } catch (e) {}
}
