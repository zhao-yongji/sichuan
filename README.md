# 天府畜牧可视化大屏

Vue 3 + Vite 大屏模板（JavaScript，不使用 TypeScript）。按 **1920×1080** 设计，横向纵向分别缩放，直接铺满窗口。

## 技术栈

- Vue 3 + Vue Router 4 + Vuex 4
- Axios 接口封装
- ECharts 图表
- 1920×1080 scale 屏幕适配

## 开始使用

```bash
npm install
npm run dev
```

开发服务默认端口 `5180`。开发环境开启 mock，登录页任意账号密码即可进入大屏。

## 目录说明

```text
src
├─ api            接口封装
├─ components     大屏面板 / 图表 / 指标卡
├─ layout         大屏顶栏（时间、标题）
├─ router         路由与守卫
├─ store          user / app / screen
├─ utils          Token、屏幕缩放
└─ views          登录页、主屏
```

## 屏幕适配

样式按 1920×1080 写 **px**。`src/utils/fitScreen.js` 会按窗口宽高分别缩放，铺满整个屏幕。

设计稿尺寸改 `src/config/index.js` 的 `DESIGN_WIDTH` / `DESIGN_HEIGHT`。

## 加一块新面板

1. 在 `src/views/home/index.vue` 用 `ScreenPanel` 包一层
2. 图表用 `VChart`，传入 ECharts `option`
3. 数据放到 `src/store/modules/screen.js`，接口写在 `src/api/modules/screen.js`

## 对接后端

把 `.env.development` 的 `VITE_USE_MOCK` 改为 `false`，并配置 `VITE_API_BASE_URL`。主屏默认每 30 秒刷新一次数据。
