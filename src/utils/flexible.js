import { DESIGN_WIDTH, BASE_SIZE } from '@/config'

function setRem() {
  const html = document.documentElement
  const width = html.clientWidth || window.innerWidth
  const scale = Math.min(Math.max(width / DESIGN_WIDTH, 0.3), 2)
  html.style.fontSize = `${BASE_SIZE * scale}px`
}

setRem()

window.addEventListener('resize', setRem)
window.addEventListener('orientationchange', setRem)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) setRem()
})
