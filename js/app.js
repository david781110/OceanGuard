/**
 * OceanGuard 主程式
 */
const App = {
  updateInterval: null,
  countdownInterval: null,
  countdownSeconds: 23535, // 6:32:15

  /**
   * 初始化應用程式
   */
  init() {
    console.log("🌊 OceanGuard System Initializing...");

    // 初始化語言
    i18n.init();

    // 初始化模擬數據
    MockData.init();

    // 初始化圖表
    this.initCharts();

    // 初始化設備列表
    this.updateDeviceList();

    // 初始化控制模組
    DownlinkControl.init();

    // 綁定 Demo 控制按鈕
    this.bindDemoControls();

    // 開始時間更新
    this.startTimeUpdate();

    // 開始數據更新循環
    this.startDataUpdate();

    // 開始倒數
    this.startCountdown();

    console.log("✅ OceanGuard System Ready");
  },

  /**
   * 初始化所有圖表
   */
  initCharts() {
    TempChart.init("tempChart");
    DOChart.init("doChart");
    FeedChart.init("feedChart");
    MapChart.init("mapChart");
    HeartbeatChart.init("heartbeatChart");
    DensityChart.init("densityChart");
  },

  /**
   * 更新設備列表
   */
  updateDeviceList() {
    const container = document.getElementById("deviceList");
    if (!container) return;

    const devices = MockData.getDevices();

    container.innerHTML = devices
      .map((device) => {
        const statusClass =
          device.status === "online"
            ? "online"
            : device.status === "warning"
              ? "warning"
              : "offline";
        const batteryClass =
          device.battery > 60 ? "high" : device.battery > 30 ? "medium" : "low";
        const iconClass =
          device.type === "sensor"
            ? "fa-microchip"
            : device.type === "gateway"
              ? "fa-tower-broadcast"
              : "fa-camera";

        return `
                <div class="device-item">
                    <div class="device-icon ${statusClass}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="device-info">
                        <div class="device-name">${i18n.t(device.name)}</div>
                        <div class="device-status">${device.lastHeartbeat}s ago</div>
                    </div>
                    <div class="device-battery">
                        <div class="battery-bar">
                            <div class="battery-fill ${batteryClass}" style="width: ${device.battery}%"></div>
                        </div>
                        <span class="battery-text">${device.battery}%</span>
                    </div>
                </div>
            `;
      })
      .join("");
  },

  /**
   * 綁定 Demo 控制按鈕
   */
  bindDemoControls() {
    document
      .getElementById("triggerColdWave")
      ?.addEventListener("click", () => {
        MockData.triggerColdWave();
        document.getElementById("warningCard")?.classList.add("warning");
        DownlinkControl.log("⚠️ 寒流預警已觸發！", "warning");
      });

    document.getElementById("resetDemo")?.addEventListener("click", () => {
      MockData.reset();
      document.getElementById("warningCard")?.classList.remove("warning");
      this.countdownSeconds = 23535;
      DownlinkControl.log("🔄 系統已重置", "success");

      // 重新初始化圖表
      this.initCharts();
    });
  },

  /**
   * 開始時間更新
   */
  startTimeUpdate() {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const timeEl = document.getElementById("currentTime");
      if (timeEl) timeEl.textContent = timeStr;
    };

    updateTime();
    setInterval(updateTime, 1000);
  },

  /**
   * 開始數據更新循環
   */
  startDataUpdate() {
    // 每 5 秒更新數據
    this.updateInterval = setInterval(() => {
      TempChart.update();
      DOChart.update();
      FeedChart.update();
      MapChart.update();
      HeartbeatChart.update();
      DensityChart.update();
      this.updateDeviceList();
    }, 5000);
  },

  /**
   * 開始預警倒數
   */
  startCountdown() {
    const updateCountdown = () => {
      if (MockData.coldWaveActive && this.countdownSeconds > 0) {
        this.countdownSeconds -= 1;
      }

      const hours = Math.floor(this.countdownSeconds / 3600);
      const mins = Math.floor((this.countdownSeconds % 3600) / 60);
      const secs = this.countdownSeconds % 60;

      const countdownEl = document.getElementById("kpiCountdown");
      if (countdownEl) {
        countdownEl.textContent = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  },
};

// 頁面載入時初始化
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
