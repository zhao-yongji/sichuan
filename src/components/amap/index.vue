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
          viewMode: "3D",
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

        // 4. 添加 3D 墙体效果 (类似参考项目里的光墙)
        const object3Dlayer = new AMap.Object3DLayer({ zIndex: 110 });
        map.add(object3Dlayer);

        boundaries.forEach((bounds) => {
          const wall = new AMap.Object3D.Wall({
            path: bounds,
            height: -100000, // 墙体向下延伸
            color: "rgba(0, 229, 255, 0.2)",
          });
          wall.transparent = true;
          object3Dlayer.add(wall);
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
