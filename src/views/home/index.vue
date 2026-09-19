<template>
  <div class="home">
    <aside class="col left">
      <div class="left-top">
        <BlockPanel title="生产情况" popup="productionPopup" @searchMore="onSearchMore">
          <Production :data="productionData" />
        </BlockPanel>
      </div>
      <div class="left-bottom">
        <BlockPanel title="流通情况" popup="circulationPopup" @searchMore="onSearchMore">
          <Circulation :data="circulationData" />
        </BlockPanel>
      </div>
    </aside>

    <section class="center">
      <ScreenPanel title="地图" class="panel">
        <Amap />
      </ScreenPanel>
      <div class="animal-tabs">
        <i class="arrow prev" @click="switchAnimal(-1)"></i>
        <div
          v-for="item in animals"
          :key="item.key"
          class="tab"
          :class="{ 'is-active': animalKey === item.key }"
          @click="animalKey = item.key"
        >
          {{ item.label }}
        </div>
        <i class="arrow next" @click="switchAnimal(1)"></i>
      </div>
    </section>

    <aside class="col right">
      <div class="right-top">
        <BlockPanel title="预警情况" popup="warningPopup" @searchMore="onSearchMore">
          <Warning :data="warningData" />
        </BlockPanel>
      </div>
      <div class="right-bottom">
        <BlockPanel title="价格情况" popup="pricePopup" @searchMore="onSearchMore">
          <Price :data="priceData" />
        </BlockPanel>
      </div>
    </aside>

    <nav class="bottom-nav">
      <div
        v-for="item in navs"
        :key="item.key"
        class="nav-item"
        :class="item.key"
      >
        <i class="icon"></i>
        <span>{{ item.label }}</span>
      </div>
    </nav>

    <Popup v-model="popupVisible">
      <div class="popup-content">
        <ProductionDetail v-if="popupName === 'productionPopup'" />
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ScreenPanel from '@/components/ScreenPanel.vue'
import BlockPanel from '@/components/BlockPanel.vue'
import Production from './components/production.vue'
import ProductionDetail from './components/productionDetail.vue'
import Circulation from './components/circulation.vue'
import Warning from './components/warning.vue'
import Price from './components/price.vue'
import Popup from '@/components/Popup.vue'
import Amap from '@/components/amap/index.vue'

const productionData = {
  farmTotal: 5324,
  farmLevels: [
    { label: '2000头以上养殖场数', value: 3000 },
    { label: '500-2000头养殖场数', value: 2324 }
  ],
  stock: 1536,
  outTotal: 800
}

const circulationData = {
  yearIn: 1536,
  yesterdayIn: 1536,
  yearOut: 1536,
  yesterdayOut: 1536
}

const warningData = {
  stockAbnormal: 100,
  outAbnormal: 80
}

const priceData = {
  pigPrice: 18.06,
  pigProfit: 8.06,
  porkMarket: 18.0,
  porkCarcass: 18.0,
  porkProfit: 15.06
}

const animalKey = ref('pig')
const animals = [
  { key: 'pig', label: '猪' },
  { key: 'cattle', label: '牛' },
  { key: 'sheep', label: '羊' }
]

function switchAnimal(step) {
  const index = animals.findIndex((item) => item.key === animalKey.value)
  const next = (index + step + animals.length) % animals.length
  animalKey.value = animals[next].key
}

const navs = [
  { key: 'analysis', label: '分析统计' },
  { key: 'epidemic', label: '动物防疫' },
  { key: 'quarantine', label: '动物检疫' },
  { key: 'slaughter', label: '屠宰监管' }
]

const popupName = ref('')
const popupVisible = ref(false)
function onSearchMore(popup) {
  popupName.value = popup
  popupVisible.value = true
}


</script>

<style scoped lang="scss">
.home {
  height: 100%;
  display: grid;
  grid-template-columns: 473px 1fr 473px;
  grid-template-rows: 1fr 50px;
  gap: 16px;
  padding: 12px 24px 16px;
  box-sizing: border-box;
  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .left-top{    
      width: 100%;
      height: 48%;
    }
    .left-bottom {
      height: 46%;
      width: 100%;
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .right-top {
      width: 100%;
      height: 48%;
    }

    .right-bottom {
      width: 100%;
      height: 46%;
    }
  }

  .center {
    position: relative;

    .animal-tabs {
      position: absolute;
      left: 50%;
      bottom: 8px;
      transform: translateX(-50%);
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 13px;

      .arrow {
        width: 23px;
        height: 53px;
        flex-shrink: 0;
        cursor: pointer;
        background-repeat: no-repeat;
        background-size: 100% 100%;

        &.prev {
          background-image: url('@/assets/image/右.png');
        }

        &.next {
          background-image: url('@/assets/image/左.png');
        }
      }

      .tab {
        width: 108px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: url('@/assets/image/常态.png') no-repeat;
        background-size: 100% 100%;
        color: #d7f3ff;
        font-size: 18px;
        letter-spacing: 4px;
        cursor: pointer;
        user-select: none;

        &.is-active {
          width: 128px;
          background-image: url('@/assets/image/选中.png');
          color: #fff;
        }
      }
    }
  }

  .bottom-nav {
    grid-column: 1 / -1;
    display: flex;
    gap: 24px;
    height: 50px;
    padding: 0;

    .nav-item {
      flex: 1;
      min-width: 0;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: url('@/assets/image/按钮2.png') no-repeat;
      background-size: 100% 100%;
      color: #d7f3ff;
      font-size: 18px;
      letter-spacing: 2px;
      user-select: none;
      cursor: pointer;

      .icon {
        width: 40px;
        height: 40px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
      }

      &.analysis .icon {
        background-image: url('@/assets/image/分析统计.png');
      }

      &.epidemic .icon {
        background-image: url('@/assets/image/动物防疫.png');
      }

      &.quarantine .icon {
        background-image: url('@/assets/image/动物检疫.png');
      }

      &.slaughter .icon {
        background-image: url('@/assets/image/屠宰监管.png');
      }
    }
  }
}

.col,
.center {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel {
  flex: 1;
}

.placeholder {
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8fbfa8;
  font-size: 20px;
  letter-spacing: 4px;
}

.popup-content {
  
}
</style>
