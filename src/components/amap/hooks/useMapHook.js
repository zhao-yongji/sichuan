import { shallowRef, ref, watch, onMounted, onUnmounted, inject } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import {
  currentSelectAreaCodeKey,
  currentLevelKey,
  currentSelectPlaceNameKey,
} from "@/views/home/hooks/userBaseDataHook.js";
import {
  DEFAULT_MAP_KEY,
  DEFAULT_MAP_SECURITY_KEY,
  getColorByAdcode,
  genPulseLineData,
} from "./mapUtils";

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
    plugins: [
      "AMap.DistrictSearch",
      "AMap.Object3DLayer",
      "AMap.MoveAnimation",
    ],
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
 * 地图 Hook（省/市/县三级下钻）
 * @param {Ref<HTMLElement>} containerRef 地图容器引用
 */
export const useMap = (containerRef) => {
  const mapInstance = shallowRef(null);
  const showHeatmap = ref(false); // 默认关闭热力图（显示卫星图）
  const currentSelectAreaCode = inject(currentSelectAreaCodeKey);
  const currentLevelInject = inject(currentLevelKey);
  const currentSelectPlaceName = inject(currentSelectPlaceNameKey);

  let AMap = null; // 高德 SDK 命名空间（initMap 加载后供下钻/渲染等闭包使用）

  let textMarkers = []; // 当前层级行政区名称标签
  let interactivePolygons = []; // 当前层级可点击下钻的透明多边形（县级视图复用此数组存乡镇边界线）
  let shadowOverlays = []; // 3D 阴影多边形（含主边界线）
  let mainBoundaryLines = []; // 主边界白色描边（setFitView 依据）
  let arrowMarkers = []; // 流出方向箭头 Marker（DOM 渲染，始终位于 Loca canvas 之上）
  let arrowAnimTimers = []; // 箭头错峰出发的定时器
  let locaContainer = null; // Loca 容器（脉冲线、呼吸点图层）
  let pulseLayers = []; // 省视图特有的 Loca 图层（脉冲线/呼吸点），下钻时隐藏
  let satelliteLayer = null; // 卫星图层
  let disProvinceLayer = null; // 行政区划图层（带颜色填充）
  const areaStack = []; // 层级栈：依次保存省/市/县 district 对象（district.level 标识层级）
  let drilling = false; // 下钻查询防抖标志

  const clearOverlays = (list) => {
    list.forEach((overlay) => overlay.setMap(null));
    list.length = 0;
  };

  /** 兼容 DistrictSearch 返回的 center（LngLat 对象或数组） */
  const getCenterArr = (center) =>
    Array.isArray(center) ? [center[0], center[1]] : [center.lng, center.lat];

  /**
   * 绘制多层阴影和外边界以产生 3D 立体感
   */
  const drawBoundaryShadows = (map, boundaries) => {
    clearOverlays(shadowOverlays);
    clearOverlays(mainBoundaryLines);

    boundaries.forEach((bounds) => {
      // 最底层的深色阴影 (偏移量最大)
      const shadowPath1 = bounds.map((p) => [p.lng + 0.04, p.lat - 0.09]);
      shadowOverlays.push(
        new AMap.Polygon({
          path: shadowPath1,
          fillColor: "#1E3B5C", // 深色投影
          fillOpacity: 1,
          strokeColor: "#1E3B5C", // 同色描边，避免缝隙
          strokeWeight: 2,
          zIndex: 108,
          map,
        }),
      );

      // 中间的过渡层阴影 (偏移量中等，带青色描边)
      const shadowPath2 = bounds.map((p) => [p.lng + 0.02, p.lat - 0.05]);
      shadowOverlays.push(
        new AMap.Polygon({
          path: shadowPath2,
          fillColor: "#5E95B8", // 中间层底色
          fillOpacity: 1,
          strokeColor: "#86C8D6", // 浅青色描边
          strokeWeight: 4, // 较粗的描边以形成层级感
          zIndex: 110,
          map,
        }),
      );

      // 主边界的白色高亮描边 (无偏移)
      const mainLine = new AMap.Polyline({
        path: bounds,
        strokeColor: "#ffffff",
        strokeWeight: 3,
        strokeOpacity: 1,
        zIndex: 130,
        map,
      });
      shadowOverlays.push(mainLine);
      mainBoundaryLines.push(mainLine);
    });
  };

  /**
   * 重建行政区划图层（下钻/返回后 adcode 变化，需销毁重建）
   */
  const buildDistrictLayer = (map, district) => {
    if (disProvinceLayer) {
      map.remove(disProvinceLayer);
      disProvinceLayer = null;
    }
    disProvinceLayer = new AMap.DistrictLayer.Province({
      zIndex: 120,
      adcode: [district.adcode],
      // 省级视图需要显示市级底色和边界，所以 depth=1；下钻时如果需要展示下一级底色也保持 1；如果是最底层 district，depth=0
      depth: district.level === "district" ? 0 : 1,
      styles: {
        fill: (properties) =>
          showHeatmap.value
            ? getColorByAdcode(properties.adcode)
            : "transparent",
        "province-stroke": "transparent",
        "city-stroke":
          district.level === "province"
            ? "rgba(102, 204, 255, 0.8)"
            : "transparent",
        "county-stroke": "transparent",
      },
    });
    map.add(disProvinceLayer);
  };

  // 子级边界缓存：adcode -> boundaries
  // DistrictSearch 的 extensions:'all' 只保证查询命中的顶层区域返回 boundaries，
  // 其 districtList 子级的 boundaries 为空数组，因此子级边界必须按 adcode 逐个单独查询
  const boundaryCache = new Map();
  // 视图代数：每次渲染视图递增，用于丢弃过期的异步边界查询结果
  let viewGen = 0;

  /**
   * 查询单个行政区边界（带缓存）
   */
  const fetchBoundaries = (adcode) =>
    new Promise((resolve) => {
      const key = String(adcode);
      if (boundaryCache.has(key)) {
        resolve(boundaryCache.get(key));
        return;
      }
      const ds = new AMap.DistrictSearch({
        subdistrict: 1,
        extensions: "all",
      });
      console.log(adcode, ds);

      ds.search(key, (status, result) => {
        console.log(status, result);
        //         {
        //     "info": "OK",
        //     "districtList": [
        //         {
        //             "citycode": "0839",
        //             "adcode": "510800",
        //             "name": "广元市",
        //             "center": [
        //                 105.844004,
        //                 32.435774
        //             ],
        //             "level": "city",
        //             "boundaries": [
        //                 [[
        //                         105.495099,
        //                         31.550677
        //                     ],],[],[]
        //             ],
        //             "districtList": [
        //                 {
        //                     "citycode": "0839",
        //                     "adcode": "510812",
        //                     "name": "朝天区",
        //                     "center": [
        //                         105.882848,
        //                         32.651352
        //                     ],
        //                     "level": "district",
        //                     "boundaries": []
        //                 },
        //                 {
        //                     "citycode": "0839",
        //                     "adcode": "510824",
        //                     "name": "苍溪县",
        //                     "center": [
        //                         105.934756,
        //                         31.731709
        //                     ],
        //                     "level": "district",
        //                     "boundaries": []
        //                 },
        //                 {
        //                     "citycode": "0839",
        //                     "adcode": "510811",
        //                     "name": "昭化区",
        //                     "center": [
        //                         105.957612,
        //                         32.333173
        //                     ],
        //                     "level": "district",
        //                     "boundaries": []
        //                 },
        //                 {
        //                     "citycode": "0839",
        //                     "adcode": "510823",
        //                     "name": "剑阁县",
        //                     "center": [
        //                         105.524699,
        //                         32.288681
        //                     ],
        //                     "level": "district",
        //                     "boundaries": []
        //                 },
        //                 {
        //                     "citycode": "0839",
        //                     "adcode": "510822",
        //                     "name": "青川县",
        //                     "center": [
        //                         105.238498,
        //                         32.575821
        //                     ],
        //                     "level": "district",
        //                     "boundaries": []
        //                 },
        //                 {
        //                     "citycode": "0839",
        //                     "adcode": "510802",
        //                     "name": "利州区",
        //                     "center": [
        //                         105.845307,
        //                         32.433756
        //                     ],
        //                     "level": "district",
        //                     "boundaries": []
        //                 },
        //                 {
        //                     "citycode": "0839",
        //                     "adcode": "510821",
        //                     "name": "旺苍县",
        //                     "center": [
        //                         106.290124,
        //                         32.229074
        //                     ],
        //                     "level": "district",
        //                     "boundaries": []
        //                 }
        //             ]
        //         }
        //     ]
        // }
        const bounds =
          status === "complete" && result.districtList?.length
            ? result.districtList[0].boundaries || []
            : [];
        boundaryCache.set(key, bounds);
        resolve(bounds);
      });
    });

  // 串行查询队列：避免进入新视图时一次性并发请求触发高德接口 QPS 限制
  let fetchQueue = Promise.resolve();
  const enqueueFetchBoundaries = (adcode) => {
    const task = fetchQueue.then(() => fetchBoundaries(adcode));
    fetchQueue = task.catch(() => []);
    return task;
  };

  /**
   * 为可下钻子区域创建透明交互 Polygon（hover 高亮 + 点击下钻），并与标签 hover 联动
   */
  const createInteractivePolygon = (map, sub, textMarker) => {
    console.log(sub);

    if (!sub.boundaries?.length) return;
    const polygon = new AMap.Polygon({
      path: sub.boundaries,
      fillColor: "#4B93E9",
      fillOpacity: 1,
      strokeColor: "#66CCFF",
      strokeWeight: 2,
      // 如果是省级视图，市级描边由 DistrictLayer (city-stroke) 提供，这里的交互多边形描边设为透明，避免重叠发虚
      strokeOpacity: currentLevelInject?.value === "province" ? 0.01 : 1,
      bubble: true,
      cursor: "pointer",
      zIndex: 225, // 高于卫星图(115)/行政区划图层(120)，低于主边界线(130)
      map,
    });
    const hoverOn = () =>
      polygon.setOptions({
        fillOpacity: 0.25,
        strokeOpacity: 1,
        strokeWeight: 3,
      });
    const hoverOff = () =>
      polygon.setOptions({
        fillOpacity: 0.01,
        strokeOpacity: currentLevelInject?.value === "province" ? 0.01 : 1,
        strokeWeight: 2,
      });
    polygon.on("mouseover", hoverOn);
    polygon.on("mouseout", hoverOff);
    polygon.on("click", () => drillDown(sub));
    // 标签联动：hover 标签同样高亮区域
    textMarker.on("mouseover", hoverOn);
    textMarker.on("mouseout", hoverOff);
    interactivePolygons.push(polygon);
  };

  /**
   * 渲染子区域标签与交互多边形（省/市级可继续下钻，县级绘制乡镇边界线）
   */
  const buildSubOverlays = (map, district) => {
    clearOverlays(textMarkers);
    clearOverlays(interactivePolygons);

    const gen = viewGen;
    const canDrill = district.level !== "district"; // 县级的子区域是乡镇，不再下钻
    const labelStyle = {
      // 矩形深蓝背景框 + 亮青色边框 + 外发光
      "background-color": "rgba(16, 60, 124, 0.92)",
      border: canDrill
        ? "2px solid rgba(102, 204, 255, 0.95)"
        : "1px solid rgba(102, 204, 255, 0.7)",
      padding: canDrill ? "6px 14px" : "3px 8px",
      "box-shadow":
        "0 2px 8px rgba(0, 0, 0, 0.45), 0 0 12px rgba(56, 162, 255, 0.55)",
      color: "#FFFFFF",
      "font-size": canDrill ? "18px" : "13px",
      "font-weight": "bold",
      // 多重 text-shadow 模拟深蓝描边并叠加外发光，保证远距离可辨识
      "text-shadow":
        "-1.5px -1.5px 0 #0A2E5F, 1.5px -1.5px 0 #0A2E5F, -1.5px 1.5px 0 #0A2E5F, 1.5px 1.5px 0 #0A2E5F, 0 0 8px rgba(0, 0, 0, 0.9)",
      cursor: canDrill ? "pointer" : "default",
    };
    console.log(district);

    (district.districtList || []).forEach((sub) => {
      if (!sub.center) return;

      const textMarker = new AMap.Text({
        text: sub.name,
        position: getCenterArr(sub.center),
        anchor: "center",
        zIndex: 150,
        style: labelStyle,
      });
      // hover 时抬高 zIndex，保证该标签显示在最前，不被其他标签遮挡
      textMarker.on("mouseover", () => textMarker.setzIndex(999));
      textMarker.on("mouseout", () => textMarker.setzIndex(150));
      textMarker.setMap(map);
      textMarkers.push(textMarker);

      if (canDrill) {
        // 标签点击下钻不依赖边界数据，立即可用
        textMarker.on("click", () => drillDown(sub));
        console.log(sub);
        if (sub.boundaries?.length) {
          console.log(1);
          createInteractivePolygon(map, sub, textMarker);
        } else {
          // 子级无边界：异步单独查询（串行队列），返回后补建交互区
          enqueueFetchBoundaries(sub.adcode).then((bounds) => {
            if (gen !== viewGen || !bounds.length) return; // 视图已切换或无边界数据
            sub.boundaries = bounds; // 回填到子区域对象，返回此视图时直接复用
            createInteractivePolygon(map, sub, textMarker);
          });
        }
      } else {
        // 县级视图（canDrill 为 false）：绘制乡镇边界线
        if (sub.boundaries?.length) {
          sub.boundaries.forEach((ring) => {
            interactivePolygons.push(
              new AMap.Polyline({
                path: ring,
                strokeColor: "rgba(102, 204, 255, 0.8)", // 亮青色，和上级描边保持一致
                strokeWeight: 2,
                zIndex: 125,
                map,
              }),
            );
          });
        } else {
          // 如果乡镇没有边界数据，也去异步请求一下试试（高德有时候能返回某些乡镇的边界）
          enqueueFetchBoundaries(sub.adcode).then((bounds) => {
            if (gen !== viewGen || !bounds.length) return;
            sub.boundaries = bounds;
            bounds.forEach((ring) => {
              interactivePolygons.push(
                new AMap.Polyline({
                  path: ring,
                  strokeColor: "rgba(102, 204, 255, 0.8)",
                  strokeWeight: 2,
                  zIndex: 125,
                  map,
                }),
              );
            });
          });
        }
      }
    });
  };

  /**
   * 省视图动态图层（脉冲线/呼吸点/货车）显隐控制：下钻后隐藏，返回省级恢复
   */
  const setPulseVisible = (visible) => {
    if (!locaContainer) return;
    if (visible) {
      locaContainer.animate.start();
    } else {
      locaContainer.animate.stop();
    }
    pulseLayers.forEach((layer) => layer[visible ? "show" : "hide"]());
    arrowMarkers.forEach((marker) => marker[visible ? "show" : "hide"]());
  };

  /**
   * 渲染某一级行政区视图（省/市/县通用）：
   * 更新掩膜、阴影、行政区划图层、子区域标签与交互、视角、脉冲线显隐
   */
  const renderLevelView = (district) => {
    const map = mapInstance.value;
    if (!map) return;
    viewGen += 1; // 递增视图代数，使旧的异步边界查询结果失效
    if (currentLevelInject)
      currentLevelInject.value = district.level || "province";
    if (currentSelectAreaCode)
      currentSelectAreaCode.value = String(district.adcode);
    if (currentSelectPlaceName) currentSelectPlaceName.value = district.name;

    const boundaries = district.boundaries || [];

    // 1. 掩膜更新为当前区域边界
    map.setMask(boundaries.map((bounds) => [bounds]));

    // 2. 3D 阴影 + 主边界
    drawBoundaryShadows(map, boundaries);

    // 3. 行政区划图层
    buildDistrictLayer(map, district);

    // 4. 子区域标签与交互多边形
    buildSubOverlays(map, district);

    // 5. 视角适配到当前区域
    if (mainBoundaryLines.length) {
      map.setFitView(mainBoundaryLines, false, [40, 40, 40, 40]);
    }

    // 6. 脉冲线等仅省视图显示
    setPulseVisible(district.level === "province");
  };

  /**
   * 下钻：查询目标行政区的下一级数据并渲染
   * @param {Object} sub DistrictSearch 返回的子区域对象（含 adcode/level）
   */
  const drillDown = (sub) => {
    if (!mapInstance.value || drilling || !sub.adcode) return;
    if (sub.level === "street") return; // 乡镇级不再下钻
    drilling = true;

    const ds = new AMap.DistrictSearch({
      subdistrict: 1,
      extensions: "all",
    });
    ds.search(String(sub.adcode), (status, result) => {
      drilling = false;
      if (status !== "complete" || !result.districtList?.length) return;
      const district = result.districtList[0];
      if (!district.boundaries?.length) return; // 无边界数据则不下钻

      // 为下一级的子区域（例如：成都市下的武侯区、青羊区等）预获取边界数据
      // 只有有了 boundaries 才能渲染出轮廓描边

      boundaryCache.set(String(sub.adcode), district.boundaries); // 写入缓存，返回此视图时直接复用
      areaStack.push(district);
      renderLevelView(district);
    });
  };

  /**
   * 返回上一级
   */
  const goBack = () => {
    if (areaStack.length <= 1) return;
    areaStack.pop();
    renderLevelView(areaStack[areaStack.length - 1]);
  };

  const initMap = async () => {
    if (!containerRef.value) return;

    try {
      AMap = await loadMap(DEFAULT_MAP_KEY, DEFAULT_MAP_SECURITY_KEY);
      // Loca 依赖全局 AMap，需在 JSAPI 加载完成后再加载
      const Loca = await loadLoca(DEFAULT_MAP_KEY);

      // subdistrict: 2 携带下两级行政区列表（市、区县），供交互多边形边界获取和描边渲染
      const districtSearch = new AMap.DistrictSearch({
        subdistrict: 2,
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

          // 卫星图层 (受 mask 限制，只显示四川省内)
          // zIndex 需高于阴影多边形(110)、低于行政区划图层(120)，否则会被不透明阴影遮住
          satelliteLayer = new AMap.TileLayer.Satellite({
            zIndex: 115,
            visible: !showHeatmap.value, // 默认显示卫星图
          });
          map.add(satelliteLayer);

          // 脉冲线图层（省视图特有，成都 <-> 各市州）
          const loca = new Loca.Container({ map });
          locaContainer = loca;

          // Loca 容器 canvas 覆盖在矢量覆盖物（交互 Polygon，zIndex 125）之上，
          // 默认会拦截鼠标事件导致 polygon 的 hover/click 失效，这里禁用其指针事件
          // （项目没有 Loca 图层级的交互，不影响脉冲线/呼吸点渲染）
          const locaDom = containerRef.value.querySelector(".amap-loca");
          if (locaDom) {
            locaDom.style.pointerEvents = "none";
          } else {
            setTimeout(() => {
              const asyncLocaDom =
                containerRef.value?.querySelector(".amap-loca");
              if (asyncLocaDom) asyncLocaDom.style.pointerEvents = "none";
            }, 500);
          }

          const { outData, outPaths, scatterData } = genPulseLineData();

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

          // 流出方向货车图标：橙色车身 + 白描边，沿弧线循环飞行，方向自动对齐线的行进方向
          // 注意：moveAlong 的 autoRotation 以图标"朝上(正北)"为基准，侧视朝右的货车需先 rotate(-90) 转为朝上
          const outTruckSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><g transform="rotate(-90 16 16)"><rect x="2" y="9" width="16" height="12" rx="1.5" fill="#FF6A00" stroke="#FFFFFF" stroke-width="1.5"/><path d="M18 12 h6.5 l3.5 4 v5 h-10 z" fill="#FFA040" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/><rect x="20.5" y="13.5" width="4.5" height="3.5" rx="0.8" fill="#E8F4FF" stroke="#FFFFFF" stroke-width="1"/><circle cx="8" cy="23" r="3" fill="#2B2B2B" stroke="#FFFFFF" stroke-width="1.5"/><circle cx="22" cy="23" r="3" fill="#2B2B2B" stroke="#FFFFFF" stroke-width="1.5"/></g></svg>`;
          const outTruckIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(outTruckSvg)}`;
          // JSAPI 2.0 moveAlong 的 duration 是"每一段"路径的时长（每条弧线约 20 段），
          // 单条线飞行总时长 ≈ 50 × 20 = 1000ms
          const ARROW_DURATION = 50;
          outPaths.forEach((path, i) => {
            const truckMarker = new AMap.Marker({
              position: path[0],
              anchor: "center",
              zIndex: 160,
              cursor: "default",
              content: `<img src="${outTruckIcon}" style="width:30px;height:30px;display:block;" />`,
            });
            truckMarker.setMap(map);
            arrowMarkers.push(truckMarker);

            // 单次飞行：先重置回起点再启动动画
            // （moveAlong 结束后 marker 停在终点，若不重置起点，再次 moveAlong 无位移可走，动画只会播放一次）
            const fly = () => {
              truckMarker.stopMove();
              truckMarker.setPosition(path[0]);
              truckMarker.moveAlong(path, {
                duration: ARROW_DURATION,
                autoRotation: true, // 货车自动旋转至路径行进方向（SVG 已转为默认朝上/正北）
              });
            };

            // 飞到终点后重新出发，形成循环；
            // 用 setTimeout 挪出事件回调执行，避免动画完成状态未完全释放导致重播失效
            truckMarker.on("movealong", () => {
              setTimeout(fly, 0);
            });

            // 错峰出发：按飞行总时长把各货车的出发时间均匀错开
            const flightMs = ARROW_DURATION * (path.length - 1);
            arrowAnimTimers.push(
              setTimeout(fly, (i * flightMs) / outPaths.length),
            );
          });

          // 呼吸点层（各市州 + 成都中心，尺寸随 lineWidthRatio 变化）
          const scatterLayer = new Loca.ScatterLayer({
            zIndex: 140,
            opacity: 1,
            visible: true,
            zooms: [2, 22],
          });
          scatterLayer.setSource(new Loca.GeoJSONSource({ data: scatterData }));
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

          pulseLayers = [outLineLayer, scatterLayer];
          loca.animate.start();

          // 省级视图入栈并统一渲染（掩膜/阴影/行政区图层/标签/脉冲线显隐）
          areaStack.push(province);
          renderLevelView(province);
        }
      });
    } catch (err) {
      console.error("AMap load error:", err);
    }
  };

  onMounted(() => {
    initMap();
  });

  // 监听 showHeatmap 变化，动态切换图层（disProvinceLayer 引用随下钻重建自动更新）
  watch(showHeatmap, (newVal) => {
    if (!mapInstance.value || !satelliteLayer || !disProvinceLayer) return;

    const strokes = {
      "province-stroke": "transparent",
      "city-stroke":
        currentLevelInject?.value === "province"
          ? "rgba(102, 204, 255, 0.8)"
          : "transparent",
      "county-stroke": "transparent",
    };

    if (newVal) {
      // 开启热力图：隐藏卫星图，设置行政区颜色填充
      satelliteLayer.hide();
      disProvinceLayer.setStyles({
        fill: (properties) => getColorByAdcode(properties.adcode),
        ...strokes,
      });
    } else {
      // 关闭热力图：显示卫星图，行政区内部透明
      satelliteLayer.show();
      disProvinceLayer.setStyles({
        fill: "transparent",
        ...strokes,
      });
    }
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

    // 清理各层级覆盖物（标签/交互多边形/阴影/边界线）
    clearOverlays(textMarkers);
    clearOverlays(interactivePolygons);
    clearOverlays(shadowOverlays);
    clearOverlays(mainBoundaryLines);
    areaStack.length = 0;

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
    showHeatmap,
    currentLevel: currentLevelInject,
    goBack,
  };
};
