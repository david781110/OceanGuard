/**
 * 殘餌偵測圖表模組
 */
const FeedChart = {
  chart: null,

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.chart = echarts.init(container);
    this.render();

    window.addEventListener("resize", () => this.chart?.resize());
  },

  render() {
    const data = MockData.getResidualBaitData();

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(10, 14, 26, 0.9)",
        borderColor: "rgba(255, 170, 0, 0.3)",
        textStyle: { color: "#fff" },
      },
      grid: { left: "10%", right: "5%", bottom: "15%", top: "10%" },
      xAxis: {
        type: "category",
        data: data.hourlyData.map((d) => d.hour),
        axisLine: { lineStyle: { color: "rgba(255, 170, 0, 0.3)" } },
        axisLabel: { color: "#6b7a8c", fontSize: 9, rotate: 45 },
      },
      yAxis: {
        type: "value",
        name: "%",
        nameTextStyle: { color: "#6b7a8c" },
        axisLine: { lineStyle: { color: "rgba(255, 170, 0, 0.3)" } },
        axisLabel: { color: "#6b7a8c" },
        splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.05)" } },
      },
      series: [
        {
          type: "bar",
          data: data.hourlyData.map((d) => d.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#ffaa00" },
              { offset: 1, color: "rgba(255, 170, 0, 0.3)" },
            ]),
          },
          barWidth: "60%",
        },
      ],
    };

    this.chart.setOption(option);
  },

  update() {
    const data = MockData.getResidualBaitData();

    // 更新顯示
    const rateEl = document.getElementById("residualRate");
    const recommendEl = document.getElementById("feedRecommend");
    if (rateEl) rateEl.textContent = data.rate + "%";
    if (recommendEl) recommendEl.textContent = data.recommend + "%";

    this.render();
  },
};
