/**
 * 魚群密度圖表模組
 */
const DensityChart = {
  chart: null,

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.chart = echarts.init(container);
    this.render();

    window.addEventListener("resize", () => this.chart?.resize());
  },

  render() {
    const activityData = MockData.getFishActivity();

    const option = {
      backgroundColor: "transparent",
      grid: { left: 0, right: 0, bottom: 0, top: 0 },
      xAxis: {
        type: "category",
        show: false,
        data: Array.from({ length: 8 }, (_, i) => i),
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          type: "bar",
          data: activityData.densityData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#00d4ff" },
              { offset: 1, color: "rgba(0, 212, 255, 0.2)" },
            ]),
          },
          barWidth: "80%",
        },
      ],
    };

    this.chart.setOption(option);
  },

  update() {
    const activityData = MockData.getFishActivity();

    // 更新活動力指標
    const activityBar = document.getElementById("activityBar");
    const activityValue = document.getElementById("activityValue");
    const growthValue = document.getElementById("growthValue");

    if (activityBar) {
      activityBar.style.width = activityData.activity + "%";
      activityBar.className = "bar-fill";
      if (activityData.activity >= 70) activityBar.classList.add("high");
      else if (activityData.activity >= 40) activityBar.classList.add("medium");
      else activityBar.classList.add("low");
    }

    if (activityValue) activityValue.textContent = activityData.activity + "%";
    if (growthValue) growthValue.textContent = activityData.growth + "%/週";

    this.render();
  },
};
