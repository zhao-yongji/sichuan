# 天府畜牧 Vue3 模板

Vue 3 + Vite 脚手架（JavaScript，不使用 TypeScript），已包含路由、接口封装、Vuex 和屏幕适配。

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- Vue Router 4
- Vuex 4
- Axios
- Vite 5
- postcss-pxtorem + flexible（按 1920 设计稿适配）

## 开始使用

```bash
npm install
npm run dev
```

打包：

```bash
npm run build
```

开发环境默认开启 mock，登录页任意账号密码即可进入。对接真实接口时，把 `.env.development` 里的 `VITE_USE_MOCK` 改为 `false`。

## 目录说明

```text
src
├─ api            接口封装（request 拦截器 + 业务模块）
├─ assets         全局样式
├─ config         设计稿宽度、Token Key 等配置
├─ layout         登录后布局
├─ router         路由与守卫
├─ store          Vuex（user / app）
├─ utils          Token、屏幕适配
└─ views          页面
```

## 路由

在 `src/router/index.js` 的 `constantRoutes` 中新增页面。需要登录的页面放到 `/` 布局的 `children` 里；登录页、404 设置 `meta.public: true`。

## 接口

1. 在 `.env.development` 配置 `VITE_API_BASE_URL`
2. 在 `src/api/modules` 按业务拆分接口
3. 统一走 `src/api/request.js`：自动带 Token，`code !== 200` 或 401 会退出登录

示例：

```js
import { get, post } from '@/api/request'

export function fetchHerdList(params) {
  return get('/herd/list', params)
}
```

后端约定成功码为 `200`，如需调整请改 `src/api/request.js`。

## Vuex

```js
import { useStore } from 'vuex'

const store = useStore()
store.dispatch('user/login', form)
store.getters['user/userName']
store.dispatch('app/toggleSidebar')
```

新增模块放到 `src/store/modules`，并在 `src/store/index.js` 注册。

## 屏幕适配

默认按 **1920** 设计稿：

- `src/utils/flexible.js` 根据屏幕宽度设置 `html` 的 `font-size`
- `postcss-pxtorem` 把样式里的 px 转成 rem
- 样式按设计稿写 px 即可，例如 `width: 220px`

若设计稿是 375（H5），同时改两处：

1. `src/config/index.js` 的 `DESIGN_WIDTH = 375`
2. `postcss.config.js` 的 `rootValue` 改为 `37.5`，并把 `flexible.js` 的 `BASE_SIZE` 改为 `37.5`

不需要转换的样式类名加 `.norem` 或 `.ignore-rem`。
