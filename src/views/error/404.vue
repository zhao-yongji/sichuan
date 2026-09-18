<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <router-link to="/home">返回首页</router-link>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #16382a;
}

h1 {
  margin: 0;
  font-size: 72px;
}

a {
  margin-top: 16px;
  color: #1f8a4c;
}
</style>
