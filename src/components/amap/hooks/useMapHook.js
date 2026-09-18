import { shallowRef, onMounted, onUnmounted } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

export const DEFAULT_MAP_KEY = "496fae1930a5be230b42266fc3524b1d";
export const DEFAULT_MAP_SECURITY_KEY = "e47c11028b89174d69b7f5792d85849f";

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
  if (!data) return "#C1DEF7";

  const count = data.count;
  if (count >= 300000) return "#4B93E9"; // 高 (深蓝)
  if (count >= 30000) return "#78ADE8"; // 中 (中蓝)
  if (count > 0) return "#99C4EC"; // 低 (浅蓝)
  return "#C1DEF7"; // 无数据 (最浅蓝)
};

/**
 * 加载高德地图 SDK
 */
export const loadMap = async (key, securityCode) => {
  if (securityCode) {
    window._AMapSecurityConfig = {
      securityJsCode: securityCode,
    };
  }

  const AMap = await AMapLoader.load({
    key: key,
    version: "2.0",
    plugins: ["AMap.DistrictSearch", "AMap.Object3DLayer"],
  });
  window.AMap = AMap;
  return AMap;
};

/**
 * 地图 Hook
 * @param {Ref<HTMLElement>} containerRef 地图容器引用
 */
export const useMap = (containerRef) => {
  const mapInstance = shallowRef(null);
  let textMarkers = [];

  const initMap = async () => {
    if (!containerRef.value) return;

    try {
      const AMap = await loadMap(DEFAULT_MAP_KEY, DEFAULT_MAP_SECURITY_KEY);

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
          const map = new AMap.Map(containerRef.value, {
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
              "province-stroke": "#ffffff",
              "city-stroke": "rgba(255, 255, 255, 0.6)",
              "county-stroke": "transparent",
            },
          });
          map.add(disProvince);

          // 2. 绘制多层阴影和外边界以产生 3D 立体感
          boundaries.forEach((bounds) => {
            // 最底层的深色阴影 (偏移量最大)
            const shadowPath1 = bounds.map((p) => [p.lng + 0.04, p.lat - 0.09]);
            new AMap.Polygon({
              path: shadowPath1,
              fillColor: "#1E3B5C", // 深色投影
              fillOpacity: 1,
              strokeColor: "#1E3B5C", // 同色描边，避免缝隙
              strokeWeight: 2,
              zIndex: 108,
              map: map,
            });

            // 中间的过渡层阴影 (偏移量中等，带青色描边)
            const shadowPath2 = bounds.map((p) => [p.lng + 0.02, p.lat - 0.05]);
            new AMap.Polygon({
              path: shadowPath2,
              fillColor: "#5E95B8", // 中间层底色
              fillOpacity: 1,
              strokeColor: "#86C8D6", // 浅青色描边
              strokeWeight: 4, // 较粗的描边以形成层级感
              zIndex: 110,
              map: map,
            });

            // 主边界的白色高亮描边 (无偏移)
            new AMap.Polyline({
              path: bounds,
              strokeColor: "#ffffff",
              strokeWeight: 3, // 稍微加粗，使其更清晰
              strokeOpacity: 1,
              zIndex: 130,
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

  return {
    map: mapInstance,
  };
};
