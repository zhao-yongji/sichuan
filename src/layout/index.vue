<template>
  <div class="layout">
    <header class="screen-header">
      <img class="header-bg" :src="headerBg" alt="" />
      <h1 class="header-title">天府好猪</h1>

      <div class="header-right">
        <a-dropdown placement="bottomRight">
          <div class="account">
            <svg class="avatar" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8.5" r="4" fill="currentColor" />
              <path
                d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"
                fill="currentColor"
              />
            </svg>
            <span class="name">{{ userName || '监管账户' }}</span>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item key="logout" @click="onLogout">
                <span class="logout-item">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 12H4m0 0 3-3m-3 3 3 3M10 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  退出登录
                </span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <div class="fullscreen" @click="toggleFullscreen">
          <svg class="icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>全屏</span>
        </div>

        <div class="datetime">
          <span class="date">{{ currentDate }}</span>
          <span class="time">{{ currentTime }}</span>
        </div>
      </div>
    </header>
    <main class="screen-body">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { Dropdown as ADropdown, Menu as AMenu } from 'ant-design-vue'
import headerBg from '@/assets/image/顶部 1.png'
import store from '@/store'

const router = useRouter()
const userName = computed(() => store.getters['user/userName'])

/** 实时时间：每秒更新 */
const now = ref(new Date())
const timer = setInterval(() => {
  now.value = new Date()
}, 1000)
onUnmounted(() => clearInterval(timer))

const pad = (n) => String(n).padStart(2, '0')
const currentDate = computed(
  () =>
    `${now.value.getFullYear()}-${pad(now.value.getMonth() + 1)}-${pad(now.value.getDate())}`
)
const currentTime = computed(
  () =>
    `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}`
)

/** 登出 */
const onLogout = () => {
  Modal.confirm({
    title: '提示',
    content: '确定退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await store.dispatch('user/logout')
      message.success('已退出登录')
      router.push('/login')
    }
  })
}

/** 全屏切换 */
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(28, 130, 220, 0.22), transparent 46%),
    linear-gradient(180deg, #053c66 0%, #03284e 52%, #021a38 100%);
}

.screen-body {
  flex: 1;
  min-height: 0;
}

.screen-header {
  position: relative;
  height: 87px;
  line-height: 87px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .header-right {
    position: absolute;
    right: 24px;
    top: 0;
    height: 100%;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .account {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;

    .avatar {
      width: 32px;
      height: 32px;
      padding: 4px;
      box-sizing: border-box;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    .name {
      font-size: 18px;
      color: #ffffff;
      letter-spacing: 1px;
    }
  }

  .fullscreen {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #ffffff;
    font-size: 18px;
    letter-spacing: 1px;

    .icon {
      width: 22px;
      height: 22px;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  .datetime {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 44px;
    padding: 0 14px;
    background: linear-gradient(90deg, rgba(34, 89, 153, 0) 0%, #3894ff 100%);
    border-radius: 2px;

    .date {
      font-family: 'DINPro', 'DINPro';
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
      text-shadow: 0px 1px 3px rgba(5, 12, 25, 0.54);
      text-align: left;
      font-style: normal;
      text-transform: none;
    }

    .time {
      font-family: 'DINPro', 'DINPro';
      font-weight: 500;
      font-size: 16px;
      color: #ffffff;
      text-shadow: 0px 1px 3px rgba(5, 12, 25, 0.54);
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }
}

.logout-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.header-bg {
  position: absolute;
  left: 50%;
  top: 0;
  display: block;
  width: 1342px;
  height: 87px;
  transform: translateX(-50%);
  pointer-events: none;
}

.header-title {
  position: relative;
  z-index: 1;
  margin: 0;
  height: 87px;
  line-height: 87px;
  transform: translateY(-8px);
  font-family: 'ZiHun', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 10px;
  color: #f4fbff;
  text-shadow:
    0 0 10px rgba(90, 210, 255, 0.9),
    0 0 24px rgba(20, 140, 255, 0.55),
    0 2px 0 rgba(8, 70, 150, 0.45);
}
</style>

<style lang="scss">
/* 下拉菜单渲染在 body 下，需用全局样式 */
.logout-item {
  svg {
    width: 16px;
    height: 16px;
  }
}
</style>
