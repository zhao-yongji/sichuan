<template>
  <div class="login-page">
    <div class="login-card">
      <div class="title">天府好猪</div>
      <div class="project-name">欢迎登录天府畜牧可视化大屏</div>
      <a-form
        ref="loginFormRef"
        :model="formState"
        :rules="formRules"
        @keyup.enter="handleLogin"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formState.username"
            :maxlength="30"
            placeholder="请输入用户名"
          />
        </a-form-item>
        <a-form-item name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
          />
        </a-form-item>
        <a-form-item v-if="!useMock" name="code">
          <div class="code-row">
            <a-input
              v-model:value="formState.code"
              :maxlength="4"
              placeholder="图形验证码"
            />
            <img
              :src="codeImg"
              alt=""
              class="code-img"
              title="点击刷新"
              @click="getCodeImg"
            />
          </div>
        </a-form-item>
      </a-form>
      <div class="remember-style">
        <a-checkbox v-model:checked="rememberPsd">记住密码</a-checkbox>
      </div>
      <div class="login-btn" @click="handleLogin">
        <span>{{ loading ? '登录中...' : '登 录' }}</span>
      </div>
      <p v-if="useMock" class="hint">开发环境已开启 mock，任意账号密码即可进入</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputPassword as AInputPassword,
  Checkbox as ACheckbox
} from 'ant-design-vue'
import { getCodeImgApi } from '@/api/modules/user'

const store = useStore()
const router = useRouter()
const route = useRoute()

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const loginFormRef = ref(null)
const loading = ref(false)
const rememberPsd = ref(false)
const codeImg = ref('')

const formState = reactive({
  username: '',
  password: '',
  code: '',
  grant_type: 'password',
  randomStr: '23242323234',
  scope: 'server',
  captchaKey: ''
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

/** 获取图形验证码 */
const getCodeImg = async () => {
  if (useMock) return
  try {
    formState.code = ''
    const res = await getCodeImgApi()
    formState.captchaKey = res.data.captchaKey
    codeImg.value = res.data.imageBase64
  } catch (err) {
    message.error(err.message || '获取验证码失败')
  }
}

const handleLogin = () => {
  loginFormRef.value
    .validate()
    .then(async () => {
      loading.value = true
      try {
        await store.dispatch('user/login', {
          ...formState,
          verifyCodeType: 'L'
        })
        // 记住密码
        if (rememberPsd.value) {
          localStorage.setItem('rememberedUsername', formState.username)
          localStorage.setItem('rememberedPassword', formState.password)
        } else {
          localStorage.removeItem('rememberedUsername')
          localStorage.removeItem('rememberedPassword')
        }
        const redirect = route.query.redirect || '/home'
        router.replace(redirect)
      } catch (err) {
        message.error(err.message || '登录失败')
        getCodeImg()
      } finally {
        loading.value = false
      }
    })
    .catch(() => {})
}

/** 回填记住的账号密码 */
const initFormData = () => {
  const savedUsername = localStorage.getItem('rememberedUsername')
  const savedPassword = localStorage.getItem('rememberedPassword')
  if (savedUsername && savedPassword) {
    formState.username = savedUsername
    formState.password = savedPassword
    rememberPsd.value = true
  }
}

onMounted(() => {
  initFormData()
  getCodeImg()
})
</script>

<style scoped lang="scss">
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8%;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(28, 130, 220, 0.22), transparent 46%),
    linear-gradient(180deg, #053c66 0%, #03284e 52%, #021a38 100%);

  .login-card {
    width: 420px;
    padding: 56px 48px;
    background: rgba(8, 34, 68, 0.82);
    border: 1px solid rgba(34, 200, 255, 0.35);
    box-shadow: 0 0 40px rgba(34, 200, 255, 0.15);

    .title {
      font-weight: 400;
      font-size: 42px;
      color: #ffffff;
      letter-spacing: 9px;
      text-shadow:
        0px 2px 3px rgba(17, 22, 22, 0.31),
        0px 0px 46px rgba(46, 248, 255, 0.49);
      text-align: center;
    }

    .project-name {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.4);
      text-align: center;
      margin: 12px 0 32px;
    }

    .code-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;

      :deep(.ant-input-affix-wrapper),
      :deep(.ant-input) {
        flex: 1;
      }

      .code-img {
        width: 120px;
        height: 44px;
        border-radius: 4px;
        cursor: pointer;
        flex-shrink: 0;
      }
    }

    .remember-style {
      display: flex;
      align-items: center;

      :deep(.ant-checkbox-inner) {
        background-color: transparent;
        border-color: #3df2ff;
      }

      :deep(.ant-checkbox-checked .ant-checkbox-inner) {
        background-color: #3df2ff;
      }

      :deep(.ant-checkbox-wrapper) {
        color: rgba(255, 255, 255, 0.55);
        font-size: 14px;
      }
    }

    .login-btn {
      cursor: pointer;
      margin-top: 32px;
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(90deg, #1f6feb, #3894ff);
      border: 1px solid rgba(102, 204, 255, 0.6);

      span {
        font-weight: bold;
        font-size: 24px;
        color: #ffffff;
        letter-spacing: 6px;
        text-shadow: 0px 3px 3px rgba(0, 42, 93, 0.27);
        text-align: center;
      }
    }

    .hint {
      margin: 16px 0 0;
      color: rgba(255, 255, 255, 0.35);
      font-size: 12px;
      text-align: center;
    }
  }
}

/* 输入框统一大屏蓝色风格 */
:deep(.ant-input-affix-wrapper),
:deep(.ant-input) {
  height: 46px;
  font-size: 14px;
  background-color: rgba(66, 163, 255, 0.2) !important;
  box-shadow: inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  border-radius: 2px;
  border: 2px solid #22c8ff;
  color: #ffffff;
  -webkit-text-fill-color: #ffffff;
  caret-color: #2afff4;

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
    -webkit-text-fill-color: rgba(255, 255, 255, 0.35);
  }
}
</style>

<style lang="scss">
/* 浏览器自动填充时保持透明背景白字 */
.login-page {
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px transparent inset !important;
    box-shadow: 0 0 0 30px transparent inset !important;
    -webkit-text-fill-color: #fff !important;
    transition: background-color 5000s ease-in-out;
    caret-color: #2afff4;
  }
}
</style>
