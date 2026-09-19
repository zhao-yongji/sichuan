<template>
  <div class="production-detail">
    <div class="closePopup" @click="onClose"></div>
    <div class="title">
      <div class="icon"></div>
      <div class="text">查看更多</div>
    </div>
    <div class="popupBody">
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
      <div class="summary">
        <div class="card">
          <span class="name">{{ periodLabel }}存栏异常养殖场数</span>
          <div class="num">
            <i v-for="(item, index) in stockDigits" :key="index">{{ item }}</i>
            <span>个</span>
          </div>
          <div class="rate">
            <span>同比：<b class="up">+20%</b></span>
            <span>环比：<b class="down">-20%</b></span>
          </div>
        </div>
        <div class="card">
          <span class="name">{{ periodLabel }}出栏异常养殖场数</span>
          <div class="num">
            <i v-for="(item, index) in outDigits" :key="index">{{ item }}</i>
            <span>个</span>
          </div>
          <div class="rate">
            <span>同比：<b class="up">+20%</b></span>
            <span>环比：<b class="down">-20%</b></span>
          </div>
        </div>
      </div>
      <div class="filters">
        <label class="field">
          <span>预警区域：</span>
          <select v-model="filters.area">
            <option value="">请选择</option>
            <option value="南部县">四川省/南充市/南部县</option>
          </select>
        </label>
        <label class="field">
          <span>预警养殖场：</span>
          <select v-model="filters.farm">
            <option value="">请选择</option>
            <option value="南部福兴猪场">南部福兴猪场</option>
          </select>
        </label>
        <label class="field">
          <span>预警类型：</span>
          <select v-model="filters.type">
            <option value="">请选择</option>
            <option value="存栏异常">生猪存栏数异常</option>
            <option value="出栏异常">生猪出栏数异常</option>
          </select>
        </label>
        <label class="field">
          <span>设备：</span>
          <select v-model="filters.device">
            <option value="">请选择</option>
            <option value="118260000812">118260000812</option>
          </select>
        </label>
        <label class="field">
          <span>时间：</span>
          <input v-model="filters.time" type="date" />
        </label>
        <div class="actions">
          <button type="button" class="search" @click="onSearch">查询</button>
          <button type="button" class="reset" @click="onReset">重置</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>预警事件</th>
              <th>预警区域</th>
              <th>预警养殖场名称</th>
              <th>预警时间</th>
              <th>设备通道名称</th>
              <th>设备通道编码</th>
              <th>处理结果</th>
              <th>处理状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableList" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.event }}</td>
              <td>{{ row.area }}</td>
              <td>{{ row.farm }}</td>
              <td>{{ row.time }}</td>
              <td>{{ row.channel }}</td>
              <td>{{ row.code }}</td>
              <td>{{ row.result }}</td>
              <td>
                <span :class="row.status === '已处理' ? 'done' : 'undo'">{{ row.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['close'])

function onClose() {
  emit('close')
}

const periods = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季度' },
  { key: 'year', label: '本年' }
]
const period = ref('week')
const periodLabel = computed(() => periods.find((item) => item.key === period.value)?.label || '本周')

const stockCount = 100
const outCount = 100
const stockDigits = String(stockCount).split('')
const outDigits = String(outCount).split('')

const filters = ref({
  area: '',
  farm: '',
  type: '',
  device: '',
  time: ''
})

const tableData = [
  { id: 1, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 15:42:01', channel: '118260000812', code: '5118260000812', result: '误报', status: '已处理' },
  { id: 2, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 15:52:03', channel: '118260000813', code: '5118260000813', result: '误报', status: '已处理' },
  { id: 3, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 16:03:15', channel: '118260000814', code: '5118260000814', result: '误报', status: '已处理' },
  { id: 4, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 16:15:22', channel: '118260000815', code: '5118260000815', result: '误报', status: '已处理' },
  { id: 5, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 16:24:49', channel: '118260000816', code: '5118260000816', result: '非误报', status: '已处理' },
  { id: 6, event: '生猪出栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 16:36:55', channel: '118260000817', code: '5118260000817', result: '误报', status: '未处理' },
  { id: 7, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 16:48:08', channel: '118260000818', code: '5118260000818', result: '误报', status: '已处理' },
  { id: 8, event: '生猪出栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 16:59:20', channel: '118260000819', code: '5118260000819', result: '误报', status: '未处理' },
  { id: 9, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 17:10:33', channel: '118260000820', code: '5118260000820', result: '误报', status: '已处理' },
  { id: 10, event: '生猪存栏数异常', area: '四川省/南充市/南部县', farm: '南部福兴猪场', time: '2025-09-06 17:21:46', channel: '118260000821', code: '5118260000821', result: '误报', status: '已处理' }
]

const tableList = ref([...tableData])

function onSearch() {
  tableList.value = tableData.filter((row) => {
    const areaOk = !filters.value.area || row.area.includes(filters.value.area)
    const farmOk = !filters.value.farm || row.farm === filters.value.farm
    const typeOk = !filters.value.type || row.event.includes(filters.value.type)
    const deviceOk = !filters.value.device || row.channel === filters.value.device
    const timeOk = !filters.value.time || row.time.startsWith(filters.value.time)
    return areaOk && farmOk && typeOk && deviceOk && timeOk
  })
}

function onReset() {
  filters.value = {
    area: '',
    farm: '',
    type: '',
    device: '',
    time: ''
  }
  tableList.value = [...tableData]
}
</script>

<style scoped lang="scss">
.production-detail {
  width: 80vw;
  height: 95vh;
  background: url('@/assets/image/waringPopupBg.png') no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  .closePopup {
    position: absolute;
    top: 7px;
    right: 0;
    cursor: pointer;
    width: 32px;
    height: 31px;
    background: url('@/assets/image/alertPopup.png') no-repeat;
    background-size: 100% 100%;
  }
  .title {
    width: 100%;
    height: 76px;
    background: url('@/assets/image/waringPopupTitle.png') no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-left: 30px;
    .icon {
      width: 37px;
      height: 17px;
      background: url('@/assets/image/弹窗箭头.png') no-repeat;
      background-size: 100% 100%;
    }
    .text {
      margin-left: 12px;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 0 10px rgba(90, 210, 255, 0.85);
    }
  }
  .popupBody {
    height: calc(100% - 76px);
    box-sizing: border-box;
    padding: 20px 30px;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .periods {
      display: flex;
      gap: 12px;

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

    .summary {
      margin-top: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;

      .card {
        height: 88px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        background: rgba(6, 40, 86, 0.72);
        border: 1px solid rgba(50, 140, 210, 0.35);

        .name {
          color: #d8eefc;
          font-size: 16px;
          white-space: nowrap;
        }

        .num {
          margin-left: 18px;
          display: flex;
          align-items: flex-end;
          gap: 8px;

          i {
            width: 36px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-style: normal;
            font-size: 32px;
            font-weight: 700;
            color: #f5c542;
            background: linear-gradient(180deg, #163e6c 0%, #0b2c52 100%);
            border: 1px solid rgba(90, 170, 230, 0.35);
            border-radius: 4px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }

          span {
            margin-left: 2px;
            margin-bottom: 4px;
            color: #ffffff;
            font-size: 16px;
            line-height: 1;
          }
        }

        .rate {
          margin-left: auto;
          display: flex;
          gap: 18px;
          color: #c5e6fa;
          font-size: 14px;
          white-space: nowrap;

          .up {
            color: #2ee6a8;
            font-weight: 700;
          }

          .down {
            color: #ff7a45;
            font-weight: 700;
          }
        }
      }
    }

    .filters {
      margin-top: 18px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px 24px;
      color: #d8eefc;
      font-size: 14px;

      .field {
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;

        select,
        input {
          width: 168px;
          height: 32px;
          padding: 0 10px;
          color: #c5e6fa;
          background: rgba(4, 28, 58, 0.85);
          border: 1px solid rgba(70, 150, 210, 0.55);
          border-radius: 2px;
          outline: none;
        }
      }

      .actions {
        margin-left: auto;
        display: flex;
        gap: 12px;

        button {
          min-width: 72px;
          height: 32px;
          color: #fff;
          font-size: 14px;
          background: #1a7de8;
          border: 1px solid #3aa0ff;
          border-radius: 4px;
          cursor: pointer;
        }

        .reset {
          background: transparent;
        }
      }
    }

    .table-wrap {
      flex: 1;
      min-height: 0;
      margin-top: 16px;
      overflow: auto;

      table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
        color: #d8eefc;
        font-size: 14px;

        th {
          height: 40px;
          color: #9fd2f0;
          font-weight: 500;
          background: rgba(8, 56, 110, 0.95);
          border: 1px solid rgba(40, 110, 170, 0.45);
        }

        td {
          height: 40px;
          background: rgba(6, 36, 78, 0.72);
          border: 1px solid rgba(40, 110, 170, 0.28);
        }

        .done {
          color: #2ee6a8;
        }

        .undo {
          color: #ff5a5a;
        }
      }
    }
  }
}
</style>
