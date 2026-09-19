<template>
  <div class="login-page">
    <!-- 顶部与 layout 一致 -->
    <header class="screen-header">
      <img class="header-bg" :src="headerBg" alt="" />
      <h1 class="header-title">天府好猪</h1>
    </header>

    <div class="login-body">
      <div class="login-card">
        <div class="card-title">欢迎登录</div>
        <a-form
          ref="loginFormRef"
          :model="formState"
          :rules="formRules"
          @keyup.enter="handleLogin"
        >
          <a-form-item name="username">
            <a-input v-model:value="formState.username" :maxlength="30" placeholder="请输入账号">
              <template #prefix>
                <img class="prefix-icon" :src="iconUsername" alt="" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item name="password">
            <a-input-password
              v-model:value="formState.password"
              placeholder="请输入密码"
              :icon-render="customPasswordIcon"
            >
              <template #prefix>
                <img class="prefix-icon" :src="iconLock" alt="" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item v-if="!useMock" name="code">
            <div class="code-row">
              <a-input v-model:value="formState.code" :maxlength="4" placeholder="验证码">
                <template #prefix>
                  <img class="prefix-icon" :src="iconCode" alt="" />
                </template>
              </a-input>
              <img
                v-if="codeImg"
                :src="codeImg"
                alt=""
                class="code-img"
                title="点击刷新"
                @click="getCodeImg"
              />
              <div v-else class="code-btn" @click="getCodeImg">获取验证码</div>
            </div>
          </a-form-item>
        </a-form>
        <div class="agreement">
          已阅读并同意<span class="link">《用户服务协议》</span>及<span class="link">《隐私政策》</span>
        </div>
        <div class="login-btn" @click="handleLogin">
          <span>{{ loading ? '登录中...' : '登 录' }}</span>
        </div>
        <p v-if="useMock" class="hint">开发环境已开启 mock，任意账号密码即可进入</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputPassword as AInputPassword
} from 'ant-design-vue'
import { getCodeImgApi } from '@/api/modules/user'
import headerBg from '@/assets/image/顶部 1.png'
import iconUsername from '@/assets/image/login/icon-username.png'
import iconLock from '@/assets/image/login/icon-lock.png'
import iconCode from '@/assets/image/login/icon-code.png'
import iconEye from '@/assets/image/login/icon-eye.png'
import iconEyeClose from '@/assets/image/login/icon-eye-close.png'

const store = useStore()
const router = useRouter()
const route = useRoute()

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const loginFormRef = ref(null)
const loading = ref(false)
const codeImg = ref('')

/** 自定义密码可见性图标（用设计稿 icon 替换默认眼睛） */
const customPasswordIcon = (visible) =>
  h('img', { src: visible ? iconEye : iconEyeClose, class: 'eye-icon', width: 18, height: 18 })

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
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
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

onMounted(() => {
  getCodeImg()
})
</script>

<style scoped lang="scss">
.login-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: url('@/assets/image/login/login-bg.png') no-repeat center bottom;
  background-size: cover;
  background-color: #042a55;
}

/* 顶部与 layout/index.vue 保持一致 */
.screen-header {
  position: relative;
  height: 87px;
  line-height: 87px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

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
}

.login-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  box-sizing: border-box;
  width: 530px;
  height: 500px;
  padding: 40px 54px 0;
  background: url('@/assets/image/login/modal-bg.png') no-repeat center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;

  .card-title {
    height: 42px;
    margin: 0 auto 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'YouSheBiaoTiHei', 'YouSheBiaoTiHei';
    font-weight: 400;
    font-size: 32px;
    color: #ffffff;
    letter-spacing: 2px;
    text-shadow:
      6px 6px 4px rgba(17, 20, 22, 0.25),
      0px 0px 46px rgba(46, 174, 255, 0.41),
      0px 0px 1px #ffffff;
    text-align: center;
    font-style: normal;
    text-transform: none;
    background: linear-gradient(to bottom, rgba(56, 148, 255, 0) 0%, #3894ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .code-row {
    display: flex;
    align-items: center;
    gap: 12px;

    :deep(.ant-form-item-control-input-content) {
      flex: 1;
    }

    .code-btn {
      width: 132px;
      height: 48px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #ffffff;
      background: rgba(0, 145, 255, 0.24);
      border: 1px solid rgba(14, 190, 255, 0.55);
      border-radius: 1px;
      box-shadow: inset 0px 0px 9px 0px rgba(14, 190, 255, 0.48);
      cursor: pointer;
      user-select: none;

      &:hover {
        background: rgba(0, 145, 255, 0.4);
      }
    }

    .code-img {
      width: 132px;
      height: 48px;
      flex-shrink: 0;
      border-radius: 1px;
      cursor: pointer;
    }
  }

  .agreement {
    margin: -4px 0 4px;
    font-size: 14px;
    color: #ffffff;

    .link {
      color: #38c6ff;
      cursor: pointer;
    }
  }

  .login-btn {
    cursor: pointer;
    margin-top: 22px;
    width: 422px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, #0073ff 0%, #0da2ff 100%);
    box-shadow: inset 0px 1px 4px 2px #d2eaff;
    border-radius: 2px;
    border: 1px solid;
    border-image: radial-gradient(circle, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)) 1 1;

    span {
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
      letter-spacing: 6px;
      text-align: center;
    }
  }

  .hint {
    margin: 14px 0 0;
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
    text-align: center;
  }
}

/* 输入框统一风格 */
:deep(.ant-input-affix-wrapper) {
  height: 48px;
  background: rgba(0, 145, 255, 0.08) !important;
  box-shadow: inset 0px 0px 9px 0px rgba(14, 190, 255, 0.48);
  border-radius: 1px;
  border: 1px solid rgba(14, 190, 255, 0.55);

  &:hover,
  &:focus-within {
    border-color: #0ebeff;
  }

  .ant-input {
    height: 100%;
    background: transparent !important;
    color: #ffffff;
    -webkit-text-fill-color: #ffffff;
    caret-color: #2afff4;

    &::placeholder {
      color: rgba(255, 255, 255, 0.35);
      -webkit-text-fill-color: rgba(255, 255, 255, 0.35);
    }
  }

  .prefix-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }

  .eye-icon {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .anticon.ant-input-password-icon {
    display: none; // 隐藏默认眼睛，用设计稿 icon
  }
}

.code-row :deep(.ant-input-affix-wrapper) {
  flex: 1;
  min-width: 0;
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
