/**
 * OceanGuard i18n Module - Chinese/English
 */
const i18n = {
  currentLang: "zh",
  translations: {
    zh: {
      systemName: "OceanGuard 多元智慧箱網養殖防災系統",
      systemOnline: "系統運行中",
      totalAssets: "總資產價值",
      survivalRate: "目前存活率",
      commStatus: "通訊鏈路狀態",
      geoOnline: "GEO 在線",
      latency: "延遲: 280ms",
      warningCountdown: "預警倒數",
      coldWaveApproaching: "寒流前緣逼近",
      feedSaving: "今日省餌成本",
      waterTempTrend: "水溫趨勢圖",
      dissolvedOxygen: "溶氧量 (DO) 曲線",
      hypoxiaRisk: "缺氧風險:",
      low: "低",
      medium: "中",
      high: "高",
      residualBait: "殘餌偵測",
      currentResidual: "目前殘餌率",
      aiRecommend: "AI 建議減餵",
      applyStrategy: "執行建議策略",
      digitalTwin: "Digital Twin 即時監控",
      all: "全部",
      sst: "SST",
      current: "海流",
      workVessel: "作業船",
      normalCage: "箱網(正常)",
      warningCage: "箱網(警戒)",
      dangerCage: "箱網(危險)",
      aiRecognition: "AI 辨識視窗",
      digitalTwinMode: "Digital Twin 模式",
      fishActivity: "魚群活動力",
      growthRate: "成長評估",
      fishDensity: "魚群密度",
      deviceStatus: "設備狀態監控",
      heartbeat: "心跳包狀態",
      downlinkControl: "下行控制控制台",
      sinkNet: "一鍵沉網",
      startAeration: "啟動曝氣",
      stopFeeding: "停止餵食",
      systemLog: "系統日誌",
      clear: "清除",
      systemInit: "系統初始化完成",
      triggerColdWave: "觸發寒流情境",
      resetDemo: "重置演示",
      sending: "傳輸中...",
      commandSuccess: "執行成功",
      sensorA: "感測器 A",
      sensorB: "感測器 B",
      sensorC: "感測器 C",
      gateway: "LoRa Gateway",
      camera: "AI 攝影機",
      online: "在線",
      offline: "離線",
      warning: "警告",
    },
    en: {
      systemName: "OceanGuard Smart Aquaculture System",
      systemOnline: "System Online",
      totalAssets: "Total Assets",
      survivalRate: "Survival Rate",
      commStatus: "Comm Status",
      geoOnline: "GEO Online",
      latency: "Latency: 280ms",
      warningCountdown: "Warning Countdown",
      coldWaveApproaching: "Cold Wave Approaching",
      feedSaving: "Feed Cost Saved",
      waterTempTrend: "Water Temp Trend",
      dissolvedOxygen: "Dissolved Oxygen (DO)",
      hypoxiaRisk: "Hypoxia Risk:",
      low: "Low",
      medium: "Med",
      high: "High",
      residualBait: "Residual Bait",
      currentResidual: "Residual Rate",
      aiRecommend: "AI Recommend",
      applyStrategy: "Apply Strategy",
      digitalTwin: "Digital Twin Monitor",
      all: "All",
      sst: "SST",
      current: "Current",
      workVessel: "Work Vessel",
      normalCage: "Cage (Normal)",
      warningCage: "Cage (Warning)",
      dangerCage: "Cage (Danger)",
      aiRecognition: "AI Recognition",
      digitalTwinMode: "Digital Twin Mode",
      fishActivity: "Fish Activity",
      growthRate: "Growth Rate",
      fishDensity: "Fish Density",
      deviceStatus: "Device Status",
      heartbeat: "Heartbeat Status",
      downlinkControl: "Downlink Control",
      sinkNet: "Sink Net",
      startAeration: "Start Aeration",
      stopFeeding: "Stop Feeding",
      systemLog: "System Log",
      clear: "Clear",
      systemInit: "System initialized",
      triggerColdWave: "Trigger Cold Wave",
      resetDemo: "Reset Demo",
      sending: "Sending...",
      commandSuccess: "Success",
      sensorA: "Sensor A",
      sensorB: "Sensor B",
      sensorC: "Sensor C",
      gateway: "LoRa Gateway",
      camera: "AI Camera",
      online: "Online",
      offline: "Offline",
      warning: "Warning",
    },
  },
  t(key, lang = null) {
    return this.translations[lang || this.currentLang]?.[key] || key;
  },
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      this.updatePageTranslations();
      localStorage.setItem("oceanguard-lang", lang);
    }
  },
  updatePageTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.getAttribute("data-i18n"));
    });
  },
  init() {
    const savedLang = localStorage.getItem("oceanguard-lang") || "zh";
    this.setLanguage(savedLang);
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".lang-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.setLanguage(btn.getAttribute("data-lang"));
      });
      if (btn.getAttribute("data-lang") === this.currentLang)
        btn.classList.add("active");
      else btn.classList.remove("active");
    });
  },
};
