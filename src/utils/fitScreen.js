import { DESIGN_WIDTH } from '@/config'

export function getScreenScale() {
  return window.innerWidth / DESIGN_WIDTH
}

/** 按宽度等比缩放铺满左右，高度随窗口变化，避免两侧留白、字体压扁和裁切 */
export function fitScreen(el) {
  if (!el) return 1
  const scale = getScreenScale()
  el.style.width = `${DESIGN_WIDTH}px`
  el.style.height = `${window.innerHeight / scale}px`
  el.style.transform = `scale(${scale})`
  el.style.left = '0px'
  el.style.top = '0px'
  return scale
}
