/**
 * 设计稿宽度见 src/config/index.js 的 DESIGN_WIDTH
 * rootValue 与 flexible.js 的 BASE_SIZE 保持一致（默认 100）
 * 样式里写设计稿 px，构建时会转成 rem
 */
export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 100,
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: ['.norem', '.ignore-rem'],
      minPixelValue: 1,
      exclude: /node_modules/i
    }
  }
}
