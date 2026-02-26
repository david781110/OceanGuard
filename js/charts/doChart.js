/**
 * 溶氧量圖表模組
 */
const DOChart = {
  chart: null,

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.chart = echarts.init(container);
    this.render();

    window.addEventListener("resize", () => this.chart?.resize());
  },

  render() {
    const data = MockData.doHistory;
    const times = data.map((d) => d.time);
    const values = data.map((d) => d.value.toFixed(2));

    // 生成預測數據
    const predicted = data.map((d, i) => {
      if (i >= data.length - 4) {
        const lastValue = parseFloat(values[data.length - 5]);
        const slope =
          (parseFloat(values[data.length - 1]) -
            parseFloat(values[data.length - 6])) /
          5;
        return (lastValue + slope * (i - data.length + 5)).toFixed(2);
      }
      return null;
    });

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(10, 14, 26, 0.9)",
        borderColor: "rgba(0, 255, 136, 0.3)",
        textStyle: { color: "#fff" },
      },
      legend: {
        data: ["實際 DO", "預測趨勢"],
        textStyle: { color: "#a0b4c8" },
        top: 5,
      },
      grid: { left: "8%", right: "5%", bottom: "12%", top: "20%" },
      xAxis: {
        type: "category",
        data: times,
        axisLine: { lineStyle: { color: "rgba(0, 255, 136, 0.3)" } },
        axisLabel: { color: "#6b7a8c", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: "DO (mg/L)",
        nameTextStyle: { color: "#6b7a8c" },
        axisLine: { lineStyle: { color: "rgba(0, 255, 136, 0.3)" } },
        axisLabel: { color: "#6b7a8c" },
        splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.05)" } },
        min: 3,
        max: 9,
      },
      visualMap: {
        show: false,
        pieces: [
          { lte: 4, color: "#ff4444" },
          { gt: 4, lte: 5, color: "#ffaa00" },
          { gt: 5, color: "#00ff88" },
        ],
        seriesIndex: 0,
      },
      series: [
        {
          name: "實際 DO",
          type: "line",
          data: values,
          smooth: true,
          lineStyle: { width: 2 },
          areaStyle: { color: "rgba(0, 255, 136, 0.1)" },
          markArea: {
            silent: true,
            data: [
              [
                { yAxis: 3, itemStyle: { color: "rgba(255, 68, 68, 0.1)" } },
                { yAxis: 4 },
              ],
              [
                { yAxis: 4, itemStyle: { color: "rgba(255, 170, 0, 0.05)" } },
                { yAxis: 5 },
              ],
            ],
          },
        },
        {
          name: "預測趨勢",
          type: "line",
          data: predicted,
          smooth: true,
          lineStyle: { color: "#00aaff", width: 2, type: "dashed" },
          itemStyle: { color: "#00aaff" },
        },
      ],
    };

    this.chart.setOption(option);
  },

  update() {
    MockData.generateDOData();
    this.render();

    // 更新風險等級
    const risk = MockData.getHypoxiaRisk();
    const riskEl = document.getElementById("doRisk");
    if (riskEl) {
      riskEl.textContent = i18n.t(risk);
      riskEl.className = "risk-value " + risk;
    }
  },
};
