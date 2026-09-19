<template>
  <div class="analysis-detail">
    <div class="header">
      <div class="title">
        <div class="title-icon"></div>
        <span>分析统计</span>
      </div>
      <div class="close-btn" @click="close"></div>
    </div>
    <div class="content">
      <div class="left-tree">
        <AreaTree :show-title="false" show-refresh />
      </div>
      <div class="right-box">
        <div class="periods">
          <div
            v-for="item in periods"
            :key="item.key"
            class="period"
            :class="{ 'is-active': period === item.key }"
            @click="period = item.key"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="block-title">
          <i></i>
          <span>天府好猪一张表</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th colspan="3">天府好猪一张表</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in tableRows" :key="index">
                <td v-if="row.span" class="group" :rowspan="row.span">{{ row.group }}</td>
                <td>{{ row.label }}</td>
                <td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AreaTree from './AreaTree.vue'

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const periods = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季度' },
  { key: 'year', label: '本年' }
]
const period = ref('week')

const tableGroups = [
  {
    group: '畜牧生产',
    rows: [
      { label: '禽蛋产量(万吨)', value: '10' },
      { label: '禽蛋产量(万吨)', value: '20' },
      { label: '牛奶产量(万吨)', value: '30' }
    ]
  },
  {
    group: '动物防疫',
    rows: [
      { label: '免疫头数(万头)', value: '100' },
      { label: '免疫进度', value: '80%' },
      { label: '免疫密度(万头)', value: '200' },
      { label: '免疫入户率', value: '80%' }
    ]
  },
  {
    group: '动物检疫',
    rows: [
      { label: '产地检疫数(万头)', value: '500' },
      { label: '屠宰检疫数(万头)', value: '200' }
    ]
  },
  {
    group: '养殖备案',
    rows: [
      { label: '备案养殖户(家)', value: '100' }
    ]
  }
]

const tableRows = computed(() => {
  const list = []
  tableGroups.forEach((item) => {
    item.rows.forEach((row, index) => {
      list.push({
        group: item.group,
        span: index === 0 ? item.rows.length : 0,
        label: row.label,
        value: row.value
      })
    })
  })
  return list
})
</script>

<style scoped lang="scss">
.analysis-detail {
  width: 1490px;
  height: 804px;
  background: url('@/assets/image/modal/model2-body.png') no-repeat center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  .header {
    height: 76px;
    background: url('@/assets/image/modal/model2-header.png') no-repeat center center;
    background-size: 100% 100%;
    position: relative;
    display: flex;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      margin-left: 60px;

      .title-icon {
        width: 34px;
        height: 22px;
        background: url('@/assets/image/modal/arrow.png') no-repeat center center;
        background-size: 100% 100%;
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        font-family: 'Source Han Sans CN', 'Source Han Sans CN';
        font-weight: bold;
        font-size: 30px;
        letter-spacing: 4px;
        text-shadow: 0px 3px 3px rgba(0, 0, 0, 0.25);
        text-align: left;
        font-style: normal;
        text-transform: none;
        background: linear-gradient(to bottom, #ffffff 0%, #ffffff 48%, #b8f2ff 63%, #a1eeff 83%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    }

    .close-btn {
      position: absolute;
      right: 0px;
      top: 8px;
      width: 36px;
      height: 35px;
      background: url('@/assets/image/modal/modal-close.png') no-repeat center center;
      background-size: 100% 100%;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .content {
    flex: 1;
    display: flex;
    padding: 24px;
    gap: 24px;
    min-height: 0;

    .left-tree {
      width: 253px;
      height: 648px;
      flex-shrink: 0;
    }

    .right-box {
      flex: 1;
      min-width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .periods {
    display: flex;
    gap: 12px;
    flex-shrink: 0;

    .period {
      min-width: 88px;
      height: 36px;
      padding: 0 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c5e6fa;
      font-size: 16px;
      background: rgba(8, 48, 96, 0.7);
      border: 1px solid rgba(70, 160, 230, 0.45);
      border-radius: 4px;
      cursor: pointer;

      &.is-active {
        color: #fff;
        background: #1a7de8;
        border-color: #3aa0ff;
      }
    }
  }

  .block-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    flex-shrink: 0;

    i {
      width: 4px;
      height: 16px;
      background: #75ddff;
    }

    span {
      color: #ffffff;
      font-size: 18px;
      font-weight: 500;
      line-height: 1;
    }
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    margin-top: 14px;

    table {
      width: 100%;
      height: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      text-align: center;
      color: #d8eefc;
      font-size: 16px;

      th {
        height: 48px;
        color: #ffffff;
        font-weight: 500;
        background: rgba(8, 56, 110, 0.95);
        border: 1px solid rgba(50, 130, 190, 0.45);
      }

      td {
        background: rgba(6, 36, 78, 0.62);
        border: 1px solid rgba(50, 130, 190, 0.35);
      }

      .group {
        width: 180px;
        color: #ffffff;
        font-size: 16px;
      }
    }
  }
}
</style>
