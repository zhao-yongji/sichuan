<template>
  <div class="layout">
    <aside class="layout-sider" :class="{ collapsed: sidebarCollapsed }">
      <div class="logo">{{ sidebarCollapsed ? '天' : '天府畜牧' }}</div>
      <nav class="menu">
        <router-link to="/home" class="menu-item">首页</router-link>
        <router-link to="/about" class="menu-item">关于</router-link>
      </nav>
    </aside>
    <div class="layout-main">
      <header class="layout-header">
        <button class="collapse-btn" type="button" @click="toggleSidebar">
          {{ sidebarCollapsed ? '展开' : '收起' }}
        </button>
        <div class="header-right">
          <span class="user-name">{{ userName }}</span>
          <button class="logout-btn" type="button" @click="handleLogout">退出</button>
        </div>
      </header>
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const sidebarCollapsed = computed(() => store.getters['app/sidebarCollapsed'])
const userName = computed(() => store.getters['user/userName'] || '管理员')

function toggleSidebar() {
  store.dispatch('app/toggleSidebar')
}

async function handleLogout() {
  await store.dispatch('user/logout')
  router.replace('/login')
}
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  min-height: 100vh;
  background: #f4f7f5;
}

.layout-sider {
  width: 220px;
  background: #16382a;
  color: #fff;
  transition: width 0.2s ease;
  flex-shrink: 0;

  &.collapsed {
    width: 72px;

    .menu-item {
      text-align: center;
      padding: 14px 8px;
    }
  }
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.menu {
  padding: 16px 12px;
}

.menu-item {
  display: block;
  padding: 12px 16px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.78);
  border-radius: 8px;
  text-decoration: none;

  &.router-link-active {
    background: #1f8a4c;
    color: #fff;
  }

  &:hover {
    color: #fff;
  }
}

.layout-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.layout-header {
  height: 64px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  color: #333;
}

.collapse-btn,
.logout-btn {
  border: 0;
  background: #eef6f1;
  color: #1f8a4c;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.logout-btn {
  background: #fff1f0;
  color: #d4380d;
}

.layout-content {
  padding: 24px;
  flex: 1;
}
</style>
