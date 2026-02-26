/**
 * OceanGuard 模擬數據生成器
 * 用於 Demo 展示的生成式數據
 */
const MockData = {
  // 基礎參數
  baseWaterTemp: 18.5,
  baseAirTemp: 22.0,
  baseDO: 6.5,
  coldWaveActive: false,

  // 時間序列數據存儲
  tempHistory: [],
  doHistory: [],
  feedHistory: [],

  /**
   * 初始化歷史數據
   */
  init() {
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 3600000);
      this.tempHistory.push({
        time: this.formatTime(time),
        waterTemp: this.baseWaterTemp + (Math.random() - 0.5) * 1.5,
        airTemp: this.baseAirTemp + (Math.random() - 0.5) * 3,
      });
      this.doHistory.push({
        time: this.formatTime(time),
        value: this.baseDO + (Math.random() - 0.5) * 1.2,
        predicted: null,
      });
    }
    // 計算預測值
    this.updateDOPredictions();
  },

  formatTime(date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  },

  /**
   * 生成新的水溫數據點 (含滯後迴歸)
   */
  generateTempData() {
    const now = new Date();
    const lastTemp = this.tempHistory[this.tempHistory.length - 1];

    let newAirTemp = lastTemp.airTemp;
    let newWaterTemp = lastTemp.waterTemp;

    if (this.coldWaveActive) {
      // 寒流模式：空氣溫度快速下降
      newAirTemp -= 0.8 + Math.random() * 0.4;
      // 水溫滯後反應 (Lagged Regression 效果)
      const lagEffect = (lastTemp.airTemp - newAirTemp) * 0.3;
      newWaterTemp -= lagEffect + Math.random() * 0.2;
    } else {
      // 正常波動
      newAirTemp += (Math.random() - 0.5) * 0.5;
      newWaterTemp += (Math.random() - 0.5) * 0.3;
    }

    // 限制範圍
    newAirTemp = Math.max(5, Math.min(35, newAirTemp));
    newWaterTemp = Math.max(10, Math.min(30, newWaterTemp));

    const newData = {
      time: this.formatTime(now),
      waterTemp: newWaterTemp,
      airTemp: newAirTemp,
    };

    this.tempHistory.push(newData);
    if (this.tempHistory.length > 48) this.tempHistory.shift();

    return newData;
  },

  /**
   * 計算 ΔT/hour 斜率
   */
  calculateDeltaT() {
    if (this.tempHistory.length < 2) return 0;
    const recent = this.tempHistory.slice(-6);
    const first = recent[0].waterTemp;
    const last = recent[recent.length - 1].waterTemp;
    return ((last - first) / recent.length).toFixed(2);
  },

  /**
   * 生成 DO 數據 (含缺氧風險預測)
   */
  generateDOData() {
    const now = new Date();
    const lastDO = this.doHistory[this.doHistory.length - 1];
    let newDO = lastDO.value;

    if (this.coldWaveActive) {
      // 寒流時 DO 可能降低
      newDO -= 0.1 + Math.random() * 0.15;
    } else {
      newDO += (Math.random() - 0.5) * 0.2;
    }

    newDO = Math.max(3, Math.min(9, newDO));

    const newData = {
      time: this.formatTime(now),
      value: newDO,
      predicted: null,
    };

    this.doHistory.push(newData);
    if (this.doHistory.length > 48) this.doHistory.shift();
    this.updateDOPredictions();

    return newData;
  },

  /**
   * 使用滯後迴歸更新 DO 預測
   */
  updateDOPredictions() {
    const len = this.doHistory.length;
    if (len < 6) return;

    // 簡單線性預測
    const recent = this.doHistory.slice(-6);
    const slope = (recent[5].value - recent[0].value) / 6;

    // 預測未來 4 個時間點
    for (let i = 1; i <= 4; i++) {
      const predictedValue = recent[5].value + slope * i;
      if (len - 1 + i < this.doHistory.length) {
        this.doHistory[len - 1 + i].predicted = predictedValue;
      }
    }
  },

  /**
   * 判斷缺氧風險等級
   */
  getHypoxiaRisk() {
    const currentDO = this.doHistory[this.doHistory.length - 1]?.value || 6.5;
    if (currentDO < 4) return "high";
    if (currentDO < 5) return "medium";
    return "low";
  },

  /**
   * 生成設備狀態數據
   */
  getDevices() {
    return [
      {
        id: "sensor_a",
        name: "sensorA",
        type: "sensor",
        status: "online",
        battery: 85 + Math.floor(Math.random() * 5),
        lastHeartbeat: Math.floor(Math.random() * 30),
      },
      {
        id: "sensor_b",
        name: "sensorB",
        type: "sensor",
        status: "online",
        battery: 72 + Math.floor(Math.random() * 5),
        lastHeartbeat: Math.floor(Math.random() * 60),
      },
      {
        id: "sensor_c",
        name: "sensorC",
        type: "sensor",
        status: this.coldWaveActive ? "warning" : "online",
        battery: 45 + Math.floor(Math.random() * 10),
        lastHeartbeat: Math.floor(Math.random() * 120),
      },
      {
        id: "gateway",
        name: "gateway",
        type: "gateway",
        status: "online",
        battery: 95,
        lastHeartbeat: 5,
      },
      {
        id: "camera",
        name: "camera",
        type: "camera",
        status: "online",
        battery: 68 + Math.floor(Math.random() * 5),
        lastHeartbeat: Math.floor(Math.random() * 45),
      },
    ];
  },

  /**
   * 生成箱網與船舶位置
   */
  getCagePositions() {
    // 澎湖附近座標
    const basePos = { lat: 23.5712, lng: 119.5793 };
    return {
      vessel: {
        lat: basePos.lat + 0.02,
        lng: basePos.lng + 0.01,
        name: "作業船 01",
      },
      cages: [
        {
          id: "A",
          lat: basePos.lat,
          lng: basePos.lng,
          status: "normal",
          temp: 18.2,
        },
        {
          id: "B",
          lat: basePos.lat + 0.015,
          lng: basePos.lng - 0.02,
          status: this.coldWaveActive ? "warning" : "normal",
          temp: 17.8,
        },
        {
          id: "C",
          lat: basePos.lat - 0.01,
          lng: basePos.lng + 0.025,
          status: "normal",
          temp: 18.5,
        },
        {
          id: "D",
          lat: basePos.lat - 0.02,
          lng: basePos.lng - 0.01,
          status: this.coldWaveActive ? "danger" : "normal",
          temp: 16.5,
        },
      ],
    };
  },

  /**
   * 生成殘餌數據
   */
  getResidualBaitData() {
    const baseRate = this.coldWaveActive ? 18 : 12;
    return {
      rate: baseRate + Math.floor(Math.random() * 5),
      recommend: Math.round(baseRate * 1.8),
      hourlyData: Array.from({ length: 12 }, (_, i) => ({
        hour: `${String((new Date().getHours() - 11 + i + 24) % 24).padStart(2, "0")}:00`,
        value: 8 + Math.floor(Math.random() * 10),
      })),
    };
  },

  /**
   * 生成魚群活動力數據
   */
  getFishActivity() {
    const base = this.coldWaveActive ? 55 : 78;
    return {
      activity: base + Math.floor(Math.random() * 10),
      growth: this.coldWaveActive ? "+1.2" : "+2.3",
      densityData: Array.from(
        { length: 8 },
        () => Math.floor(Math.random() * 40) + 30,
      ),
    };
  },

  /**
   * 觸發寒流情境
   */
  triggerColdWave() {
    this.coldWaveActive = true;
    this.baseAirTemp = 12;
  },

  /**
   * 重置 Demo
   */
  reset() {
    this.coldWaveActive = false;
    this.baseWaterTemp = 18.5;
    this.baseAirTemp = 22.0;
    this.baseDO = 6.5;
    this.tempHistory = [];
    this.doHistory = [];
    this.init();
  },
};
