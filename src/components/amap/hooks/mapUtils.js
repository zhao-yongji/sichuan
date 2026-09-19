export const DEFAULT_MAP_KEY = "496fae1930a5be230b42266fc3524b1d";
export const DEFAULT_MAP_SECURITY_KEY = "e47c11028b89174d69b7f5792d85849f";

// 城市数据及颜色映射
export const cityData = {
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

// 下钻后的子区域（区县/乡镇）无真实业务数据，按 adcode 生成稳定的伪随机数量，保证热力图颜色不闪烁
export const mockCountCache = {};
export const getCountByAdcode = (adcode) => {
  const data = cityData[adcode];
  if (data) return data.count;
  if (!(adcode in mockCountCache)) {
    mockCountCache[adcode] = Math.floor(Math.random() * 540000);
  }
  return mockCountCache[adcode];
};

export const getColorByAdcode = (adcode) => {
  const count = getCountByAdcode(adcode);
  if (count >= 300000) return "#4B93E9"; // 高 (深蓝)
  if (count >= 30000) return "#78ADE8"; // 中 (中蓝)
  if (count > 0) return "#99C4EC"; // 低 (浅蓝)
  return "#C1DEF7"; // 无数据 (最浅蓝)
};

/**
 * 生成两点之间的弧线路径（二次贝塞尔曲线采样，视觉上比直线更柔和）
 */
export const genArcPath = (start, end, ratio = 0.15) => {
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
export const genPulseLineData = () => {
  const chengdu = [cityData[510100].lng, cityData[510100].lat];
  const MAX_COUNT = 543090; // 达州（数据中的最大值）
  const inFeatures = [];
  const outFeatures = [];
  const outPaths = []; // 流出线原始路径（箭头飞行轨迹）
  const scatterFeatures = [];

  Object.entries(cityData).forEach(([adcode, city], index) => {
    // 成都自身只生成中心大呼吸点
    if (adcode === "510100") return;

    const point = [city.lng, city.lat];
    const ratio =
      city.count > 0
        ? Math.min(city.count / MAX_COUNT, 1)
        : +(Math.random() * 0.5 + 0.2).toFixed(2);

    // 动态计算曲率偏移量，使相邻/同方向城市的线条具有不同的弯曲程度，避免重合
    const arcOffset = 0.08 + (index % 5) * 0.06; // 产生 0.08, 0.14, 0.20, 0.26, 0.32 的曲率差异

    // 流入成都
    inFeatures.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: genArcPath(point, chengdu, arcOffset),
      },
      properties: { lineWidthRatio: ratio },
    });

    // 从成都流出（弧线偏移方向相反，避免与流入线重叠）
    const outPath = genArcPath(chengdu, point, -arcOffset);
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
