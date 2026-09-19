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
 * 生成两点之间的弧线路径（二次贝塞尔曲线采样，视觉上比直线更柔和）
 */
const genArcPath = (start, end, ratio = 0.15) => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  // 控制点：线段中点沿垂直方向偏移
  const ctrlLng = (start[0] + end[0]) / 2 - dy * ratio;
  const ctrlLat = (start[1] + end[1]) / 2 + dx * ratio;

  const points = [];
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const mt = 1 - t;
    points.push([
      mt * mt * start[0] + 2 * mt * t * ctrlLng + t * t * end[0],
      mt * mt * start[1] + 2 * mt * t * ctrlLat + t * t * end[1],
    ]);
  }
  return points;
};

/**
 * 生成脉冲线假数据：成都 <-> 各市州（流入/流出双向）+ 呼吸点
 * lineWidthRatio 按城市 count 归一化（无数据则随机），控制线宽与呼吸点大小
 */
const genPulseLineData = () => {
  const chengdu = [cityData[510100].lng, cityData[510100].lat];
  const MAX_COUNT = 543090; // 达州（数据中的最大值）
  const inFeatures = [];
  const outFeatures = [];
  const outPaths = []; // 流出线原始路径（箭头飞行轨迹）
  const scatterFeatures = [];

  Object.entries(cityData).forEach(([adcode, city]) => {
    // 成都自身只生成中心大呼吸点
    if (adcode === "510100") return;

    const point = [city.lng, city.lat];
    const ratio =
      city.count > 0
        ? Math.min(city.count / MAX_COUNT, 1)
        : +(Math.random() * 0.5 + 0.2).toFixed(2);

    // 流入成都
    inFeatures.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: genArcPath(point, chengdu, 0.12),
      },
      properties: { lineWidthRatio: ratio },
    });

    // 从成都流出（弧线偏移方向相反，避免与流入线重叠）
    const outPath = genArcPath(chengdu, point, -0.12);
    outFeatures.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: outPath,
      },
      properties: { lineWidthRatio: ratio },
    });
    // 保留原始路径，供箭头沿线飞行使用
    outPaths.push(outPath);

    // 各市州呼吸点
    scatterFeatures.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: point },
      properties: { lineWidthRatio: ratio },
    });
  });

  // 成都中心的大呼吸点
  scatterFeatures.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: chengdu },
    properties: { lineWidthRatio: 1 },
  });

  return {
    inData: { type: "FeatureCollection", features: inFeatures },
    outData: { type: "FeatureCollection", features: outFeatures },
    outPaths,
    scatterData: { type: "FeatureCollection", features: scatterFeatures },
  };
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
    plugins: ["AMap.DistrictSearch", "AMap.Object3DLayer", "AMap.MoveAnimation"],
  });
  window.AMap = AMap;
  return AMap;
};

/**
 * 动态加载 Loca 数据可视化库（脉冲线等图层依赖，必须在 JSAPI 之后加载）
 */
export const loadLoca = (key) => {
  return new Promise((resolve, reject) => {
    if (window.Loca && window.Loca.Container) {
      resolve(window.Loca);
      return;
    }
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://webapi.amap.com/loca?v=2.0.0&key=${key}`;
    script.onload = () => resolve(window.Loca);
    script.onerror = () => reject(new Error("Loca 库加载失败"));
    document.head.appendChild(script);
  });
};

/**
 * 地图 Hook
 * @param {Ref<HTMLElement>} containerRef 地图容器引用
 */
export const useMap = (containerRef) => {
  const mapInstance = shallowRef(null);
  let textMarkers = [];
  let arrowMarkers = []; // 流出方向箭头 Marker（DOM 渲染，始终位于 Loca canvas 之上）
  let arrowAnimTimers = []; // 箭头错峰出发的定时器
  let locaContainer = null; // Loca 容器（脉冲线、呼吸点图层）

  const initMap = async () => {
    if (!containerRef.value) return;

    try {
      const AMap = await loadMap(DEFAULT_MAP_KEY, DEFAULT_MAP_SECURITY_KEY);
      // Loca 依赖全局 AMap，需在 JSAPI 加载完成后再加载
      const Loca = await loadLoca(DEFAULT_MAP_KEY);

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

          // 3. 添加城市名称和数值标签（大字号 + 矩形蓝底框 + 文字描边，大屏远距离可读）
          Object.values(cityData).forEach((city) => {
            const text = city.name;
            const textMarker = new AMap.Text({
              text: text,
              position: [city.lng, city.lat],
              anchor: "center",
              zIndex: 150,
              style: {
                // 矩形深蓝背景框 + 亮青色边框 + 外发光
                "background-color": "rgba(16, 60, 124, 0.92)",
                border: "2px solid rgba(102, 204, 255, 0.95)",
                padding: "6px 14px",
                "box-shadow":
                  "0 2px 8px rgba(0, 0, 0, 0.45), 0 0 12px rgba(56, 162, 255, 0.55)",
                color: "#FFFFFF",
                "font-size": "18px",
                "font-weight": "bold",
                // 多重 text-shadow 模拟深蓝描边并叠加外发光，保证远距离可辨识
                "text-shadow":
                  "-1.5px -1.5px 0 #0A2E5F, 1.5px -1.5px 0 #0A2E5F, -1.5px 1.5px 0 #0A2E5F, 1.5px 1.5px 0 #0A2E5F, 0 0 8px rgba(0, 0, 0, 0.9)",
                cursor: "pointer",
              },
            });

            // hover 时抬高 zIndex，保证该标签显示在最前，不被其他标签遮挡
            textMarker.on("mouseover", () => {
              textMarker.setzIndex(999);
            });
            textMarker.on("mouseout", () => {
              textMarker.setzIndex(150);
            });

            textMarker.setMap(map);
            textMarkers.push(textMarker);
          });

          // 4. 基于 Loca 添加脉冲线图层（参考高德官方"北京流入流出"示例，假数据）
          const loca = new Loca.Container({ map });
          locaContainer = loca;

          const { inData, outData, outPaths, scatterData } = genPulseLineData();

          // 从成都流出方向的线（橙色脉冲头，脉冲间隔更小、节奏更慢）
          const outLineLayer = new Loca.PulseLineLayer({
            zIndex: 141,
            opacity: 1,
            visible: true,
            zooms: [2, 22],
          });
          outLineLayer.setStyle({
            altitude: 0,
            lineWidth: (_, feature) =>
              feature.properties.lineWidthRatio * 1 + 3,
            // 高饱和橙：头部亮橙、拖尾提高透明度，远距离更醒目
            headColor: "#FF6A00",
            trailColor: "rgba(255,106,0, 0.45)",
            interval: 0.25,
            duration: 5000,
          });
          outLineLayer.setSource(new Loca.GeoJSONSource({ data: outData }));
          loca.add(outLineLayer);

          // 流出方向箭头：橙色实心 + 白描边，沿弧线循环飞行，方向自动对齐线的行进方向
          const outArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><path d="M16 3 L27 26 L16 20 L5 26 Z" fill="#FF6A00" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/></svg>`;
          const outArrowIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(outArrowSvg)}`;
          const ARROW_DURATION = 500; // 与流出脉冲 duration 一致，飞行速度与脉冲同步
          outPaths.forEach((path, i) => {
            const arrowMarker = new AMap.Marker({
              position: path[0],
              anchor: "center",
              zIndex: 160,
              cursor: "default",
              content: `<img src="${outArrowIcon}" style="width:26px;height:26px;display:block;" />`,
            });
            arrowMarker.setMap(map);
            arrowMarkers.push(arrowMarker);

            // 飞到终点后重新出发，形成循环
            const fly = () => {
              arrowMarker.moveAlong(path, {
                duration: ARROW_DURATION,
                autoRotation: true, // 箭头自动旋转至路径行进方向（SVG 默认朝上/正北）
              });
            };
            arrowMarker.on("movealong", fly);
            // 错峰出发，让各条线上的箭头位置分布更自然
            arrowAnimTimers.push(
              setTimeout(fly, (i * ARROW_DURATION) / outPaths.length)
            );
          });

          // 呼吸点层（各市州 + 成都中心，尺寸随 lineWidthRatio 变化）
          const scatterLayer = new Loca.ScatterLayer({
            zIndex: 140,
            opacity: 1,
            visible: true,
            zooms: [2, 22],
          });
          scatterLayer.setSource(
            new Loca.GeoJSONSource({ data: scatterData })
          );
          scatterLayer.setStyle({
            unit: "px",
            size: (_, feature) => {
              const size = feature.properties.lineWidthRatio * 2 + 30;
              return [size, size];
            },
            borderWidth: 0,
            texture:
              "https://a.amap.com/Loca/static/loca-v2/demos/images/breath_yellow.png",
            duration: 2000,
            animate: true,
          });
          loca.add(scatterLayer);

          // 启动动画驱动（脉冲流动与呼吸点动画依赖此循环）
          loca.animate.start();

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
    // 停止箭头飞行并清理 Marker 与错峰定时器
    arrowAnimTimers.forEach((timer) => clearTimeout(timer));
    arrowAnimTimers = [];
    arrowMarkers.forEach((marker) => {
      marker.stopMove();
      marker.setMap(null);
    });
    arrowMarkers = [];

    // 销毁标签
    textMarkers.forEach((marker) => marker.setMap(null));
    textMarkers = [];

    // 销毁 Loca 容器（同时释放脉冲线、呼吸点图层及动画循环）
    if (locaContainer) {
      locaContainer.destroy();
      locaContainer = null;
    }

    if (mapInstance.value) {
      mapInstance.value.destroy();
      mapInstance.value = null;
    }
  });

  return {
    map: mapInstance,
  };
};
