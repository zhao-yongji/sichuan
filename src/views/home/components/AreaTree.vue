<template>
  <div class="area-tree">
    <SectionTitle>区域信息</SectionTitle>
    <div class="divider"></div>
    <div class="search-box">
      <input v-model="keyword" type="text" placeholder="请输入区域信息" />
      <svg class="search-icon" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
        <path
          d="M16.5 16.5L21 21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="tree-body">
      <div v-if="loading" class="tree-tip">加载中...</div>
      <template v-else-if="visibleNodes.length">
        <div
          v-for="node in visibleNodes"
          :key="node.adcode"
          class="tree-node"
          :class="{ selected: node.adcode === selectedAdcode }"
          :style="{ paddingLeft: `${12 + node.depth * 24}px` }"
          @click="onSelect(node)"
        >
          <i
            v-if="node.children.length"
            class="arrow"
            :class="{ expanded: isExpanded(node) }"
            @click.stop="toggleExpand(node)"
          ></i>
          <i v-else class="arrow-placeholder"></i>
          <span class="node-name">{{ node.name }}</span>
        </div>
      </template>
      <div v-else class="tree-tip">暂无数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted } from "vue";
import SectionTitle from "@/components/SectionTitle.vue";
import { loadMap } from "@/components/amap/hooks/useMapHook";
import {
  DEFAULT_MAP_KEY,
  DEFAULT_MAP_SECURITY_KEY,
} from "@/components/amap/hooks/mapUtils";
import {
  currentSelectAreaCodeKey,
  currentSelectAreaCode as exportedAreaCode,
} from "@/views/home/hooks/userBaseDataHook.js";

// 优先注入全局选中区域，取不到时兜底使用模块级 ref
const areaCodeRef = inject(currentSelectAreaCodeKey, null) ?? exportedAreaCode;

const loading = ref(false);
const root = ref(null); // 树根节点（跟随当前选中的 adcode）
const keyword = ref("");
const selectedAdcode = ref("");
const expandedMap = ref({}); // adcode -> 是否展开

/**
 * 将 DistrictSearch 返回的 district 对象规范化为树节点
 * 乡镇级（street）不进入树
 */
const normalize = (district) => ({
  adcode: String(district.adcode),
  name: district.name,
  level: district.level,
  children: (district.districtList || [])
    .filter((d) => d.level !== "street")
    .map(normalize),
});

/** 通过高德行政区接口查询区域（含 subdistrict 级子区域） */
const fetchDistrict = (adcode, subdistrict = 1) =>
  new Promise((resolve) => {
    const ds = new window.AMap.DistrictSearch({
      subdistrict,
      extensions: "all",
    });
    ds.search(String(adcode), (status, result) => {
      if (status === "complete" && result.districtList?.length) {
        resolve(normalize(result.districtList[0]));
      } else {
        resolve(null);
      }
    });
  });

/** 根据 adcode 加载树根（一次带两级子区域，避免展开时反复请求） */
const loadRoot = async (adcode) => {
  if (!adcode || !window.AMap) return;
  loading.value = true;
  const district = await fetchDistrict(adcode, 2);
  loading.value = false;
  if (!district) {
    root.value = null;
    return;
  }
  root.value = district;
  selectedAdcode.value = district.adcode;
  expandedMap.value = { [district.adcode]: true }; // 根节点默认展开
};

const hasChildren = (node) => node.children.length > 0;

const isExpanded = (node) =>
  keyword.value ? true : !!expandedMap.value[node.adcode];

const toggleExpand = (node) => {
  if (!hasChildren(node)) return;
  expandedMap.value = {
    ...expandedMap.value,
    [node.adcode]: !expandedMap.value[node.adcode],
  };
};

const onSelect = (node) => {
  selectedAdcode.value = node.adcode;
};

/** 按关键字过滤树：命中节点及其祖先链保留 */
const filteredRoot = computed(() => {
  const kw = keyword.value.trim();
  if (!kw || !root.value) return root.value;
  const filter = (node) => {
    const children = node.children.map(filter).filter(Boolean);
    if (node.name.includes(kw) || children.length) {
      return { ...node, children };
    }
    return null;
  };
  return filter(root.value);
});

/** 展开状态展开后的可见节点（扁平化，带层级深度） */
const visibleNodes = computed(() => {
  const list = [];
  const walk = (node, depth) => {
    if (!node) return;
    list.push({ ...node, depth });
    if (hasChildren(node) && isExpanded(node)) {
      node.children.forEach((child) => walk(child, depth + 1));
    }
  };
  walk(filteredRoot.value, 0);
  return list;
});

let amapReady = false;

watch(areaCodeRef, (code) => {
  if (amapReady) loadRoot(code);
});

onMounted(async () => {
  // 复用地图模块的 SDK 加载逻辑（已加载时直接复用）
  if (!window.AMap) {
    await loadMap(DEFAULT_MAP_KEY, DEFAULT_MAP_SECURITY_KEY);
  }
  amapReady = true;
  loadRoot(areaCodeRef?.value || "510000");
});
</script>

<style scoped lang="scss">
.area-tree {
  box-sizing: border-box;
  width: 253px;
  height: 648px;
  background: #16407d;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
    margin: 14px 0 16px;
  }

  .search-box {
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: rgba(9, 30, 66, 0.6);
    border: 1px solid rgba(102, 204, 255, 0.35);
    border-radius: 4px;

    input {
      flex: 1;
      min-width: 0;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      font-size: 14px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.45);
      }
    }

    .search-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.65);
    }
  }

  .tree-body {
    flex: 1;
    min-height: 0;
    margin-top: 12px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(102, 204, 255, 0.4);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .tree-tip {
    padding: 20px 0;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  .tree-node {
    height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 8px;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: #34ffbf;
    }

    &.selected {
      color: #34ffbf;
      background: linear-gradient(
        90deg,
        #64ffbc 0%,
        rgba(100, 255, 188, 0) 100%
      );
      border-radius: 4px;
    }

    .arrow {
      width: 0;
      height: 0;
      flex-shrink: 0;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 6px solid currentColor;
      transition: transform 0.2s;

      &.expanded {
        transform: rotate(90deg);
      }
    }

    .arrow-placeholder {
      width: 6px;
      height: 8px;
      flex-shrink: 0;
    }

    .node-name {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
