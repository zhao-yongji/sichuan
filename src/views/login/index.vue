<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleLogin">
      <p class="eyebrow">DATA SCREEN</p>
      <h1>天府畜牧可视化大屏</h1>
      <label>
        用户名
        <input v-model.trim="form.username" type="text" placeholder="请输入用户名" />
      </label>
      <label>
        密码
        <input v-model.trim="form.password" type="password" placeholder="请输入密码" />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? '进入中...' : '进入大屏' }}
      </button>
      <p class="hint">开发环境已开启 mock，任意账号密码即可进入</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: 'admin',
  password: '123456'
})
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await store.dispatch('user/login', { ...form })
    const redirect = route.query.redirect || '/home'
    router.replace(redirect)
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  width: 1920px;
  height: 1080px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 480px;
  padding: 48px 42px;
  background: rgba(8, 28, 22, 0.82);
  border: 1px solid rgba(62, 224, 143, 0.28);
  box-shadow: 0 0 40px rgba(62, 224, 143, 0.12);

  h1 {
    margin: 0 0 32px;
    font-size: 32px;
    letter-spacing: 4px;
    color: #f3fff8;
    text-align: center;
  }
}

.eyebrow {
  margin: 0 0 8px;
  text-align: center;
  color: #3ee08f;
  letter-spacing: 6px;
  font-size: 12px;
}

label {
  display: block;
  margin-bottom: 18px;
  color: #9fdcbf;
}

input {
  display: block;
  width: 100%;
  margin-top: 8px;
  height: 46px;
  padding: 0 12px;
  border: 1px solid rgba(62, 224, 143, 0.28);
  background: rgba(2, 10, 8, 0.7);
  color: #e8fff3;
  outline: none;

  &:focus {
    border-color: #3ee08f;
  }
}

button {
  width: 100%;
  height: 48px;
  border: 0;
  margin-top: 8px;
  background: linear-gradient(90deg, #1f8a4c, #3ee08f);
  color: #04110c;
  font-size: 18px;
  letter-spacing: 4px;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.error {
  color: #ff6b6b;
  margin: 0 0 8px;
}

.hint {
  margin: 16px 0 0;
  color: #6f9484;
  font-size: 12px;
  text-align: center;
}
</style>
