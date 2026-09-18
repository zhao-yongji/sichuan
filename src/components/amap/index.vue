<template>
  <div class="amap-container">
    <div ref="mapRef" class="map-view"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, shallowRef } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

const mapRef = ref(null);
const mapInstance = shallowRef(null);
let textMarkers = [];

// 城市数据及颜色映射
const cityData = {
  510100: { name: "成都市", count: 0, lng: 104.065735, lat: 30.659462 },
  510700: { name: "绵阳市", count: 0, lng: 104.679642, lat: 31.467975 },
  510600: { name: "德阳市", count: 0, lng: 104.398127, lat: 31.127901 },
  510500: { name: "泸州市", count: 348983, lng: 105.443432, lat: 28.871806 },
  511500: { name: "宜宾市", count: 0, lng: 104.641715, lat: 28.751312 },
  511100: { name: "乐山市", count: 0, lng: 103.767263, lat: 29.552563 },
  511300: { name: "南充市", count: 310641, lng: 106.087005, lat: 30.793128 },
  511700: { name: "达州市", count: 543090, lng: 107.468363, lat: 31.209494 },
  511800: { name: "雅安市", count: 11270, lng: 103.045798, lat: 29.986323 },
  510800: { name: "广元市", count: 0, lng: 105.843432, lat: 32.435372 },
  510900: { name: "遂宁市", count: 0, lng: 105.573514, lat: 30.515384 },
  511000: { name: "内江市", count: 157201, lng: 105.058588, lat: 29.580228 },
  511600: { name: "广安市", count: 22409, lng: 106.633343, lat: 30.456476 },
  511900: { name: "巴中市", count: 0, lng: 106.747614, lat: 31.869098 },
  511400: { name: "眉山市", count: 0, lng: 103.832645, lat: 30.04834 },
  512000: { name: "资阳市", count: 0, lng: 104.627936, lat: 30.128194 },
  510300: { name: "自贡市", count: 0, lng: 104.776116, lat: 29.339243 },
  510400: { name: "攀枝花市", count: 0, lng: 101.718637, lat: 26.582347 },
  513200: {
    name: "阿坝藏族羌族自治州",
    count: 26897,
    lng: 102.221374,
    lat: 31.899792,
  },
  513300: {
    name: "甘孜藏族自治州",
    count: 14311,
    lng: 101.963811,
    lat: 30.049522,
  },
  513400: {
    name: "凉山彝族自治州",
    count: 30202,
    lng: 102.267306,
    lat: 27.88174,
  },
};

const getColorByAdcode = (adcode) => {
  const data = cityData[adcode];
  if (!data) return "#062253"; // 默认深蓝色

  const count = data.count;
  if (count >= 300000) return "#d32029"; // 红色
  if (count >= 30000) return "#f37826"; // 橙色
  if (count > 0) return "#ffc424"; // 黄色
  return "#062253"; // 无数据时的深蓝色
};

const initMap = async () => {
  window._AMapSecurityConfig = {
    securityJsCode: "e47c11028b89174d69b7f5792d85849f", // 复用参考项目的安全密钥
  };

  try {
    const AMap = await AMapLoader.load({
      key: "496fae1930a5be230b42266fc3524b1d", // 复用参考项目的 Key
      version: "2.0",
      plugins: ["AMap.DistrictSearch", "AMap.Object3DLayer"],
    });

    // 获取四川省边界数据
    const districtSearch = new AMap.DistrictSearch({
      subdistrict: 0,
      extensions: "all",
      level: "province",
    });

    districtSearch.search("四川省", (status, result) => {
      if (status === "complete" && result.districtList.length) {
        const province = result.districtList[0];
        const boundaries = province.boundaries;
        const mask = [];

        for (let i = 0; i < boundaries.length; i += 1) {
          mask.push([boundaries[i]]);
        }

        // 初始化地图，使用掩膜
        const map = new AMap.Map(mapRef.value, {
          center: [104.065735, 30.659462], // 成都
          zoom: 6.5,
          viewMode: "2D",
          pitch: 0,
          rotation: 0,
          mask: mask, // 掩膜，只显示四川省内
          mapStyle: "amap://styles/darkblue",
          skyColor: "transparent",
          showLabel: false,
          features: [], // 不显示默认底图要素
        });

        mapInstance.value = map;

        // 1. 添加市级行政区划图层，用于绘制地市边界和填充颜色
        const disProvince = new AMap.DistrictLayer.Province({
          zIndex: 120,
          adcode: ["510000"],
          depth: 1,
          styles: {
            fill: (properties) => {
              return getColorByAdcode(properties.adcode);
            },
            "province-stroke": "#00e5ff",
            "city-stroke": "rgba(0, 229, 255, 0.6)",
            "county-stroke": "transparent",
          },
        });
        map.add(disProvince);

        // 2. 绘制外边界的高亮线和发光线
        boundaries.forEach((bounds) => {
          // 主描边
          new AMap.Polyline({
            path: bounds,
            strokeColor: "#59f3ff",
            strokeWeight: 2,
            strokeOpacity: 1,
            zIndex: 130,
            map: map,
          });

          // 外层发光
          new AMap.Polyline({
            path: bounds,
            strokeColor: "rgba(0, 229, 255, 0.4)",
            strokeWeight: 8,
            strokeOpacity: 1,
            zIndex: 120,
            map: map,
          });
        });

        // 3. 添加城市名称和数值标签
        Object.values(cityData).forEach((city) => {
          const text =
            city.count > 0 ? `${city.name} ${city.count}` : city.name;
          const textMarker = new AMap.Text({
            text: text,
            position: [city.lng, city.lat],
            anchor: "center",
            zIndex: 150,
            style: {
              "background-color": "transparent",
              "border-width": 0,
              color: "#ffffff",
              "font-size": "12px",
              "font-weight": "normal",
              "text-shadow": "0 0 2px rgba(0,0,0,0.8)",
            },
          });
          textMarker.setMap(map);
          textMarkers.push(textMarker);
        });

        // 调整视野
        map.setFitView(null, false, [20, 20, 20, 20]);
      }
    });
  } catch (err) {
    console.error("AMap load error:", err);
  }
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  // 销毁标签
  textMarkers.forEach((marker) => marker.setMap(null));
  textMarkers = [];

  if (mapInstance.value) {
    mapInstance.value.destroy();
    mapInstance.value = null;
  }
});
</script>

<style scoped lang="scss">
.amap-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #091a3d; // 纯色深蓝背景

  .map-view {
    width: 100%;
    height: 100%;
    background: transparent !important;
  }

  :deep(.amap-logo),
  :deep(.amap-copyright) {
    display: none !important;
  }
}
</style>
