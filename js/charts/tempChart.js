/**
 * 水溫趨勢圖表模組
 */
const TempChart = {
  chart: null,

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.chart = echarts.init(container);
    this.render();

    window.addEventListener("resize", () => this.chart?.resize());
  },

  render() {
    const data = MockData.tempHistory;
    const times = data.map((d) => d.time);
    const waterTemps = data.map((d) => d.waterTemp.toFixed(1));
    const airTemps = data.map((d) => d.airTemp.toFixed(1));

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(10, 14, 26, 0.9)",
        borderColor: "rgba(0, 212, 255, 0.3)",
        textStyle: { color: "#fff" },
      },
      legend: {
        data: ["海水溫度", "空氣溫度"],
        textStyle: { color: "#a0b4c8" },
        top: 5,
      },
      grid: { left: "8%", right: "8%", bottom: "12%", top: "20%" },
      xAxis: {
        type: "category",
        data: times,
        axisLine: { lineStyle: { color: "rgba(0, 212, 255, 0.3)" } },
        axisLabel: { color: "#6b7a8c", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: "溫度 (°C)",
        nameTextStyle: { color: "#6b7a8c" },
        axisLine: { lineStyle: { color: "rgba(0, 212, 255, 0.3)" } },
        axisLabel: { color: "#6b7a8c" },
        splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.05)" } },
      },
      series: [
        {
          name: "海水溫度",
          type: "line",
          data: waterTemps,
          smooth: true,
          lineStyle: { color: "#00d4ff", width: 2 },
          areaStyle: { color: "rgba(0, 212, 255, 0.1)" },
          itemStyle: { color: "#00d4ff" },
          markLine: {
            silent: true,
            data: [
              {
                yAxis: 16,
                lineStyle: { color: "#ffaa00", type: "dashed" },
                label: { formatter: "警戒 16°C", color: "#ffaa00" },
              },
              {
                yAxis: 14,
                lineStyle: { color: "#ff4444", type: "dashed" },
                label: { formatter: "危險 14°C", color: "#ff4444" },
              },
            ],
          },
        },
        {
          name: "空氣溫度",
          type: "line",
          data: airTemps,
          smooth: true,
          lineStyle: { color: "#ffaa00", width: 1, type: "dashed" },
          itemStyle: { color: "#ffaa00" },
        },
      ],
    };

    this.chart.setOption(option);
  },

  update() {
    MockData.generateTempData();
    this.render();

    // 更新 ΔT 顯示
    const deltaT = MockData.calculateDeltaT();
    const deltaTEl = document.getElementById("deltaT");
    if (deltaTEl) {
      deltaTEl.textContent = `${deltaT}°C`;
      deltaTEl.className = "delta-value";
      if (deltaT < -0.5) deltaTEl.classList.add("warning");
      if (deltaT < -1.0) deltaTEl.classList.add("danger");
    }
  },
};
