<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleLogin">
      <h1>天府畜牧</h1>
      <p class="sub">Vue3 项目模板</p>
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
        {{ loading ? '登录中...' : '登录' }}
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(31, 138, 76, 0.2), transparent 30%),
    linear-gradient(135deg, #0f2a1f, #16382a);
}

.login-card {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);

  h1 {
    margin: 0;
    font-size: 28px;
    color: #16382a;
    text-align: center;
  }
}

.sub {
  text-align: center;
  color: #7a8b82;
  margin: 8px 0 28px;
}

label {
  display: block;
  margin-bottom: 16px;
  color: #44554c;
  font-size: 14px;
}

input {
  display: block;
  width: 100%;
  margin-top: 8px;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #d7e3dc;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #1f8a4c;
  }
}

button {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: #1f8a4c;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.error {
  color: #d4380d;
  margin: 0 0 8px;
}

.hint {
  margin: 16px 0 0;
  color: #8a9a92;
  font-size: 12px;
  text-align: center;
}
</style>
