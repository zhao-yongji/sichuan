<template>
  <div class="layout">
    <header class="screen-header">
      <div class="header-left">{{ nowText }}</div>
      <h1 class="header-title">{{ title }}</h1>
      <div class="header-right">
        <span class="user">{{ userName }}</span>
        <button type="button" class="logout" @click="handleLogout">退出</button>
      </div>
    </header>
    <main class="screen-body">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
const nowText = ref('')
let timer = null

const title = computed(() => import.meta.env.VITE_APP_TITLE || '天府畜牧可视化大屏')
const userName = computed(() => store.getters['user/userName'] || '值班员')

function pad(num) {
  return String(num).padStart(2, '0')
}

function tick() {
  const d = new Date()
  nowText.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function handleLogout() {
  await store.dispatch('user/logout')
  router.replace('/login')
}

onMounted(() => {
  tick()
  timer = window.setInterval(tick, 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<style scoped lang="scss">
.layout {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
}

.screen-header {
  position: relative;
  height: 86px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36px 10px;
  background:
    linear-gradient(180deg, rgba(12, 48, 36, 0.85), transparent),
    linear-gradient(90deg, transparent 8%, rgba(62, 224, 143, 0.18) 50%, transparent 92%);
  border-bottom: 1px solid rgba(62, 224, 143, 0.28);

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -1px;
    width: 520px;
    height: 3px;
    transform: translateX(-50%);
    background: linear-gradient(90deg, transparent, #3ee08f, transparent);
  }
}

.header-title {
  margin: 0;
  font-size: 36px;
  letter-spacing: 8px;
  color: #f3fff8;
  text-shadow: 0 0 18px rgba(62, 224, 143, 0.45);
}

.header-left,
.header-right {
  width: 360px;
  color: #9fdcbf;
  font-size: 18px;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

button {
  border: 1px solid rgba(62, 224, 143, 0.4);
  background: rgba(10, 36, 28, 0.7);
  color: #d7efe4;
  padding: 6px 12px;
  cursor: pointer;
}

.logout {
  border-color: rgba(240, 195, 90, 0.45);
  color: #f0c35a;
}
</style>
