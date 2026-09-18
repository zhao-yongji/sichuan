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
let heatmapInstance = null; // 热力图实例（非响应式，避免深层代理）

/**
 * 生成热力图假数据（四川省主要城市中心 + 周边随机散点）
 * 数据格式与参考项目一致：{ lng, lat, count }
 */
const generateHeatmapData = () => {
  // 21 个市州中心坐标及基础热度
  const cityCenters = [
    { lng: 104.065735, lat: 30.659462, count: 100 }, // 成都
    { lng: 104.679642, lat: 31.467975, count: 75 }, // 绵阳
    { lng: 104.398127, lat: 31.127901, count: 60 }, // 德阳
    { lng: 105.443432, lat: 28.871806, count: 55 }, // 泸州
    { lng: 104.641715, lat: 28.751312, count: 65 }, // 宜宾
    { lng: 103.767263, lat: 29.552563, count: 50 }, // 乐山
    { lng: 106.087005, lat: 30.793128, count: 58 }, // 南充
    { lng: 107.468363, lat: 31.209494, count: 52 }, // 达州
    { lng: 103.045798, lat: 29.986323, count: 40 }, // 雅安
    { lng: 105.843432, lat: 32.435372, count: 38 }, // 广元
    { lng: 105.573514, lat: 30.515384, count: 42 }, // 遂宁
    { lng: 105.058588, lat: 29.580228, count: 45 }, // 内江
    { lng: 106.633343, lat: 30.456476, count: 44 }, // 广安
    { lng: 106.747614, lat: 31.869098, count: 36 }, // 巴中
    { lng: 103.832645, lat: 30.04834, count: 43 }, // 眉山
    { lng: 104.627936, lat: 30.128194, count: 46 }, // 资阳
    { lng: 104.776116, lat: 29.339243, count: 48 }, // 自贡
    { lng: 101.718637, lat: 26.582347, count: 35 }, // 攀枝花
    { lng: 102.221374, lat: 31.899792, count: 30 }, // 阿坝
    { lng: 101.963811, lat: 30.049522, count: 28 }, // 甘孜
    { lng: 102.267306, lat: 27.88174, count: 32 }, // 凉山
  ];

  const data = [];
  cityCenters.forEach((city) => {
    // 城市中心主热力点
    data.push({ lng: city.lng, lat: city.lat, count: city.count });

    // 周边随机散点，模拟真实数据分布
    const scatterCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < scatterCount; i += 1) {
      data.push({
        lng: city.lng + (Math.random() - 0.5) * 0.7,
        lat: city.lat + (Math.random() - 0.5) * 0.5,
        count: Math.floor(Math.random() * 50) + 10,
      });
    }
  });

  return data;
};

const initMap = async () => {
  window._AMapSecurityConfig = {
    securityJsCode: "e47c11028b89174d69b7f5792d85849f", // 复用参考项目的安全密钥
  };

  try {
    const AMap = await AMapLoader.load({
      key: "496fae1930a5be230b42266fc3524b1d", // 复用参考项目的 Key
      version: "2.0",
      plugins: ["AMap.DistrictSearch", "AMap.Object3DLayer", "AMap.HeatMap"],
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
          pitch: 35,
          rotation: 0,
          mask: mask, // 掩膜，只显示四川省内
          mapStyle: "amap://styles/blue",
          skyColor: "transparent",
          showLabel: false,
          features: ["bg"],
        });

        mapInstance.value = map;

        // 1. 添加卫星图层 (受 mask 限制，只显示四川省内)
        const satelliteLayer = new AMap.TileLayer.Satellite({
          zIndex: 10,
        });
        map.add(satelliteLayer);

        // 2. 添加市级行政区划图层，用于绘制地市边界
        const disProvince = new AMap.DistrictLayer.Province({
          zIndex: 120,
          adcode: ["510000"],
          depth: 1,
          styles: {
            fill: "transparent", // 内部透明，露出卫星图
            "province-stroke": "#00e5ff",
            "city-stroke": "rgba(0, 229, 255, 0.6)",
            "county-stroke": "transparent",
          },
        });
        map.add(disProvince);

        // 3. 绘制外边界的高亮线和发光线
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

        // 5. 添加热力图（参考 sldz_jczl_web 大屏 useMapHook 的实现，假数据）
        const heatmapData = generateHeatmapData();
        // 热力渐变最大值取数据中的最大 count，防止颜色渐变漂移
        const heatmapMax = Math.max(...heatmapData.map((d) => d.count));

        heatmapInstance = new AMap.HeatMap(map, {
          radius: 30, // 省级视野（zoom 6.5）下适当增大半径
          opacity: [0, 0.8],
          gradient: {
            0.4: "#55ce64", // 低 (绿色)
            0.7: "#e19a53", // 中 (橙色)
            1.0: "#e03d52", // 高 (红色)
          },
        });

        heatmapInstance.setDataSet({
          data: heatmapData,
          max: heatmapMax,
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
  // 先销毁热力图，释放 Canvas 资源
  if (heatmapInstance) {
    heatmapInstance.setMap(null);
    heatmapInstance = null;
  }
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
  background: transparent;

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
