<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <router-link to="/home">返回大屏</router-link>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #d7efe4;
}

h1 {
  margin: 0;
  font-size: 96px;
  color: #3ee08f;
}

a {
  margin-top: 16px;
  color: #f0c35a;
}
</style>
