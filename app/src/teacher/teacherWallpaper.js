/**
 * Hình nền cổng giáo viên (cùng bộ ảnh vườn, sáng, be, tối với admin).
 * Lựa chọn là tiện ích riêng của từng máy: lưu localStorage dưới khoá riêng của cô, bọc try/catch.
 * Khi cổng mở, gắn html[data-teacher-wall] để cả hộp thoại render ra body cũng cùng một kiểu; rời cổng thì gỡ.
 */
import { useLayoutEffect, useState } from 'react'
import { WALLPAPERS } from '../admin/wallpaper.js'

export { WALLPAPERS }
export const TEACHER_WALLPAPER_KEY = 'kem-con-hoc:teacher-wallpaper'

export function readTeacherWallpaper() {
  try {
    const v = localStorage.getItem(TEACHER_WALLPAPER_KEY)
    if (WALLPAPERS.some((w) => w.id === v)) return v
  } catch (e) {}
  return 'garden'
}

export function saveTeacherWallpaper(id) {
  try {
    localStorage.setItem(TEACHER_WALLPAPER_KEY, id)
  } catch (e) {}
}

/** [wallpaper, setWallpaper]: đổi là lưu ngay và cập nhật thuộc tính trên <html>. */
export function useTeacherWallpaper() {
  const [wall, setWall] = useState(readTeacherWallpaper)
  useLayoutEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-teacher-wall', wall)
    return () => root.removeAttribute('data-teacher-wall')
  }, [wall])
  const change = (id) => {
    if (!WALLPAPERS.some((w) => w.id === id)) return
    saveTeacherWallpaper(id)
    setWall(id)
  }
  return [wall, change]
}
