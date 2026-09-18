<template>
  <section class="page">
    <h2>关于模板</h2>
    <ul>
      <li>Vue 3 + Vite，不使用 TypeScript</li>
      <li>Vue Router 4：路由守卫、布局嵌套、404</li>
      <li>Vuex 4：user / app 模块</li>
      <li>Axios：统一请求封装与拦截器</li>
      <li>屏幕适配：flexible + postcss-pxtorem</li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.page {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

h2 {
  margin: 0 0 16px;
  color: #16382a;
}

li {
  line-height: 2;
  color: #44554c;
}
</style>
