<template>
  <section class="page">
    <h2>首页</h2>
    <p>当前用户：{{ userName }}</p>
    <div class="cards">
      <article class="card">
        <h3>路由</h3>
        <p>已配置登录页、布局页、首页、关于页和 404。</p>
      </article>
      <article class="card">
        <h3>接口封装</h3>
        <p>Axios 拦截器已接入 Token，可在 <code>src/api</code> 继续按模块拆分。</p>
      </article>
      <article class="card">
        <h3>Vuex</h3>
        <p>user / app 模块已就绪，侧栏状态与登录信息走全局 store。</p>
      </article>
      <article class="card">
        <h3>屏幕适配</h3>
        <p>按 1920 设计稿，样式写 px，自动转 rem。</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const userName = computed(() => store.getters['user/userName'])
</script>

<style scoped lang="scss">
.page {
  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #16382a;
  }
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(22, 56, 42, 0.06);

  h3 {
    margin: 0 0 8px;
    color: #1f8a4c;
  }

  p {
    margin: 0;
    color: #5b6b64;
    line-height: 1.6;
  }
}
</style>
