/**
 * Digital Twin 地圖模組 (台灣/澎湖)
 */
const MapChart = {
  chart: null,

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.chart = echarts.init(container);
    this.render();

    window.addEventListener("resize", () => this.chart?.resize());
  },

  render() {
    const positions = MockData.getCagePositions();

    // 準備船舶數據
    const vesselData = [
      {
        name: positions.vessel.name,
        value: [positions.vessel.lng, positions.vessel.lat],
        symbol: "path://M20,10 L30,30 L20,25 L10,30 Z",
        symbolSize: 20,
        itemStyle: { color: "#00d4ff" },
      },
    ];

    // 準備箱網數據
    const cageData = positions.cages.map((cage) => ({
      name: `箱網 ${cage.id}`,
      value: [cage.lng, cage.lat, cage.temp],
      itemStyle: {
        color:
          cage.status === "normal"
            ? "#00ff88"
            : cage.status === "warning"
              ? "#ffaa00"
              : "#ff4444",
      },
    }));

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(10, 14, 26, 0.9)",
        borderColor: "rgba(0, 212, 255, 0.3)",
        textStyle: { color: "#fff" },
        formatter: (params) => {
          if (params.seriesName === "箱網") {
            return `${params.name}<br/>水溫: ${params.value[2]}°C`;
          }
          return params.name;
        },
      },
      geo: {
        map: "taiwan",
        roam: true,
        center: [119.58, 23.57],
        zoom: 10,
        label: { show: false },
        itemStyle: {
          areaColor: "rgba(0, 50, 80, 0.6)",
          borderColor: "rgba(0, 212, 255, 0.5)",
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: "rgba(0, 100, 150, 0.8)",
          },
        },
      },
      series: [
        {
          name: "作業船",
          type: "scatter",
          coordinateSystem: "geo",
          data: vesselData,
          symbolSize: 20,
          label: {
            show: true,
            position: "right",
            formatter: "{b}",
            color: "#00d4ff",
            fontSize: 10,
          },
        },
        {
          name: "箱網",
          type: "effectScatter",
          coordinateSystem: "geo",
          data: cageData,
          symbolSize: 12,
          rippleEffect: {
            brushType: "stroke",
            scale: 3,
          },
          label: {
            show: true,
            position: "right",
            formatter: "{b}",
            color: "#a0b4c8",
            fontSize: 10,
          },
        },
      ],
    };

    // 註冊簡易台灣地圖
    if (!echarts.getMap("taiwan")) {
      this.registerTaiwanMap();
    }

    this.chart.setOption(option);
  },

  registerTaiwanMap() {
    // 簡化的澎湖海域地圖 GeoJSON
    echarts.registerMap("taiwan", {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "澎湖海域" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [119.4, 23.4],
                [119.4, 23.8],
                [119.8, 23.8],
                [119.8, 23.4],
                [119.4, 23.4],
              ],
            ],
          },
        },
      ],
    });
  },

  update() {
    this.render();
  },
};
