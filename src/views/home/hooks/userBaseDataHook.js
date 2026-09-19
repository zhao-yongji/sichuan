import { provide, ref } from "vue";

export const currentSelectAreaCodeKey = "sichuanCurrentSelectAreaCode";
export const currentSelectPlaceNameKey = "sichuanCurrentSelectPlaceName";
export const currentLevelKey = "sichuanCurrentLevel";

export const currentSelectAreaCode = ref("510000"); // 默认四川省
export const currentSelectPlaceName = ref("四川省");
export const currentLevel = ref("province");

export const useBaseDataHook = () => {
  provide(currentSelectAreaCodeKey, currentSelectAreaCode);
  provide(currentSelectPlaceNameKey, currentSelectPlaceName);
  provide(currentLevelKey, currentLevel);

  return {};
};
