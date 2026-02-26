/**
 * 下行控制模組
 */
const DownlinkControl = {
  /**
   * 初始化控制按鈕事件
   */
  init() {
    // 一鍵沉網
    document.getElementById("sinkNetBtn")?.addEventListener("click", () => {
      this.sendCommand("SINK_NET", "01 06 00 01 00 01 18 0A");
    });

    // 啟動曝氣
    document.getElementById("aerationBtn")?.addEventListener("click", () => {
      this.sendCommand("AERATION", "01 06 00 02 00 01 E9 CA");
    });

    // 停止餵食
    document.getElementById("stopFeedBtn")?.addEventListener("click", () => {
      this.sendCommand("STOP_FEED", "01 06 00 03 00 00 78 0B");
    });

    // 執行建議策略
    document.getElementById("applyFeedBtn")?.addEventListener("click", () => {
      this.sendCommand("APPLY_FEED", "01 06 00 04 00 19 C8 05");
    });

    // 清除日誌
    document.getElementById("clearLog")?.addEventListener("click", () => {
      const logContent = document.getElementById("commandLog");
      if (logContent) logContent.innerHTML = "";
    });
  },

  /**
   * 發送衛星指令（模擬）
   */
  sendCommand(type, hexPacket) {
    const btn = document.querySelector(`[id$="Btn"], [id="applyFeedBtn"]`);
    const btnMap = {
      SINK_NET: "sinkNetBtn",
      AERATION: "aerationBtn",
      STOP_FEED: "stopFeedBtn",
      APPLY_FEED: "applyFeedBtn",
    };

    const targetBtn = document.getElementById(btnMap[type]);
    if (targetBtn) {
      targetBtn.classList.add("processing");
      const icon = targetBtn.querySelector("i");
      const originalClass = icon?.className;
      if (icon) icon.className = "fas fa-spinner";
    }

    // 記錄發送
    this.log(`${i18n.t("sending")} [${type}]`, "warning");
    this.log(`Modbus: ${hexPacket}`, "hex");

    // 模擬衛星延遲 (3-8秒)
    const delay = 3000 + Math.random() * 5000;

    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% 成功率

      if (success) {
        this.log(`${type} - ${i18n.t("commandSuccess")}`, "success");
        this.log(`ACK: 01 06 ${hexPacket.slice(6, 14)} 00 00`, "hex");
      } else {
        this.log(`${type} - 執行失敗 (Timeout)`, "error");
      }

      // 恢復按鈕
      const targetBtn = document.getElementById(btnMap[type]);
      if (targetBtn) {
        targetBtn.classList.remove("processing");
        const icon = targetBtn.querySelector("i");
        if (icon) {
          const iconMap = {
            SINK_NET: "fas fa-arrow-down",
            AERATION: "fas fa-fan",
            STOP_FEED: "fas fa-ban",
            APPLY_FEED: "fas fa-check",
          };
          icon.className = iconMap[type];
        }
      }
    }, delay);
  },

  /**
   * 寫入日誌
   */
  log(message, type = "") {
    const logContent = document.getElementById("commandLog");
    if (!logContent) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-msg ${type}">${message}</span>
        `;

    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
  },
};
