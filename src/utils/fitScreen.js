import { DESIGN_WIDTH, DESIGN_HEIGHT } from '@/config'

export function getScreenScale() {
  return {
    scaleX: window.innerWidth / DESIGN_WIDTH,
    scaleY: window.innerHeight / DESIGN_HEIGHT
  }
}

/** 按 1920x1080 横向、纵向分别缩放，铺满整个窗口 */
export function fitScreen(el) {
  if (!el) return { scaleX: 1, scaleY: 1 }
  const { scaleX, scaleY } = getScreenScale()
  el.style.transform = `scale(${scaleX}, ${scaleY})`
  return { scaleX, scaleY }
}