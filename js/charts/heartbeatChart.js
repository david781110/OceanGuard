/**
 * 心跳監控圖表模組
 */
const HeartbeatChart = {
  chart: null,
  data: [],

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.chart = echarts.init(container);
    this.initData();
    this.render();

    window.addEventListener("resize", () => this.chart?.resize());
  },

  initData() {
    const devices = ["Gateway", "Sensor A", "Sensor B", "Sensor C", "Camera"];
    const now = new Date();

    this.data = devices.map((name) => ({
      name,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: new Date(now - (19 - i) * 5000),
        status: Math.random() > 0.05 ? 1 : 0,
      })),
    }));
  },

  render() {
    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(10, 14, 26, 0.9)",
        borderColor: "rgba(0, 212, 255, 0.3)",
        textStyle: { color: "#fff" },
      },
      grid: { left: "15%", right: "5%", bottom: "15%", top: "10%" },
      xAxis: {
        type: "category",
        data: this.data[0]?.data.map((_, i) => i) || [],
        axisLine: { lineStyle: { color: "rgba(0, 212, 255, 0.3)" } },
        axisLabel: { show: false },
      },
      yAxis: {
        type: "category",
        data: this.data.map((d) => d.name),
        axisLine: { lineStyle: { color: "rgba(0, 212, 255, 0.3)" } },
        axisLabel: { color: "#6b7a8c", fontSize: 9 },
      },
      series: [
        {
          type: "heatmap",
          data: this.data.flatMap((device, yi) =>
            device.data.map((d, xi) => [xi, yi, d.status]),
          ),
          itemStyle: { borderRadius: 2 },
          emphasis: { itemStyle: { shadowBlur: 10 } },
        },
      ],
      visualMap: {
        show: false,
        min: 0,
        max: 1,
        inRange: {
          color: ["#ff4444", "#00ff88"],
        },
      },
    };

    this.chart.setOption(option);
  },

  update() {
    const now = new Date();
    this.data.forEach((device) => {
      device.data.shift();
      device.data.push({
        time: now,
        status: Math.random() > 0.05 ? 1 : 0,
      });
    });
    this.render();
  },
};
