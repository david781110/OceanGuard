/**
 * Digital Twin 地圖模組 (澎湖海域 - Leaflet.js)
 * 使用 Leaflet.js 顯示真實澎湖地圖 + 即時洋流動畫
 */
const MapChart = {
  map: null,
  cageMarkers: [],
  vesselMarker: null,
  currentLayer: null,
  currentAnimFrame: null,
  activeLayer: "all", // 'all' | 'temp' | 'current'

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 如果已經初始化過，先銷毀
    if (this.map) {
      this.destroy();
    }

    // 初始化 Leaflet 地圖
    this.map = L.map(containerId, {
      center: [23.5712, 119.5793], // 澎湖中心
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // CartoDB Dark Matter 深色圖磚 (配合科技主題)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(this.map);

    // 加上小型縮放控制 (右下角)
    L.control.zoom({ position: "topright" }).addTo(this.map);

    // 繪製箱網與船舶
    this.renderMarkers();

    // 洋流動畫圖層（暫時關閉）
    // this.initCurrentLayer();

    // 綁定圖層切換按鈕
    this.bindLayerButtons();

    // 修正 Leaflet 在 flex 容器中的 resize 問題
    setTimeout(() => this.map.invalidateSize(), 200);
    window.addEventListener("resize", () => {
      if (this.map) this.map.invalidateSize();
    });
  },

  /**
   * 繪製箱網 & 作業船標記
   */
  renderMarkers() {
    if (!this.map) return;

    // 清除舊標記
    this.cageMarkers.forEach((m) => this.map.removeLayer(m));
    this.cageMarkers = [];
    if (this.vesselMarker) {
      this.map.removeLayer(this.vesselMarker);
      this.vesselMarker = null;
    }

    const positions = MockData.getCagePositions();

    // 箱網標記
    positions.cages.forEach((cage) => {
      const color =
        cage.status === "normal"
          ? "#00ff88"
          : cage.status === "warning"
            ? "#ffaa00"
            : "#ff4444";

      // 實心標記
      const coreMarker = L.circleMarker([cage.lat, cage.lng], {
        radius: 8,
        fillColor: color,
        fillOpacity: 0.85,
        color: color,
        weight: 2,
        opacity: 1,
      }).addTo(this.map);

      coreMarker.bindPopup(
        `<div class="map-popup">
          <div class="popup-title">箱網 ${cage.id}</div>
          <div class="popup-row"><span>水溫:</span><span>${cage.temp}°C</span></div>
          <div class="popup-row"><span>狀態:</span><span style="color:${color}">${cage.status === "normal" ? "正常" : cage.status === "warning" ? "警戒" : "危險"}</span></div>
        </div>`,
        { className: "dark-popup" },
      );

      // 標籤
      const label = L.marker([cage.lat, cage.lng], {
        icon: L.divIcon({
          className: "cage-label",
          html: `<span>箱網 ${cage.id}</span>`,
          iconSize: [60, 20],
          iconAnchor: [-10, 10],
        }),
      }).addTo(this.map);

      this.cageMarkers.push(coreMarker, label);
    });

    // 作業船標記
    const vesselIcon = L.divIcon({
      className: "vessel-icon",
      html: '<i class="fas fa-ship"></i><span class="vessel-label">作業船 01</span>',
      iconSize: [80, 30],
      iconAnchor: [12, 12],
    });

    this.vesselMarker = L.marker([positions.vessel.lat, positions.vessel.lng], {
      icon: vesselIcon,
    }).addTo(this.map);
  },

  /**
   * 初始化洋流 Canvas 動畫圖層
   */
  initCurrentLayer() {
    if (!this.map) return;

    // 建立 Canvas overlay
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "400";
    canvas.id = "currentCanvas";

    const mapContainer = this.map.getContainer();
    mapContainer.appendChild(canvas);

    this.currentCanvas = canvas;
    this.currentCtx = canvas.getContext("2d");

    // 初始化粒子
    this.particles = [];
    this.initParticles();

    // 開始動畫
    this.animateCurrents();

    // 地圖移動時重繪
    this.map.on("moveend zoomend resize", () => {
      this.resizeCanvas();
      this.initParticles();
    });

    this.resizeCanvas();
  },

  /**
   * Canvas 尺寸同步
   */
  resizeCanvas() {
    if (!this.currentCanvas || !this.map) return;
    const size = this.map.getSize();
    this.currentCanvas.width = size.x;
    this.currentCanvas.height = size.y;
  },

  /**
   * 初始化洋流粒子
   */
  initParticles() {
    this.particles = [];
    const currents = MockData.getOceanCurrents();
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.createParticle(currents));
    }
  },

  /**
   * 建立單一粒子（含軌跡歷史）
   */
  createParticle(currents) {
    const lat = 23.35 + Math.random() * 0.5;
    const lng = 119.35 + Math.random() * 0.55;
    const current = this.findNearestCurrent(lat, lng, currents);

    return {
      lat,
      lng,
      speed: current.speed,
      direction: current.direction,
      age: Math.floor(Math.random() * 60),
      maxAge: 60 + Math.floor(Math.random() * 30),
      trail: [], // 儲存最近位置用於繪製拖尾
    };
  },

  /**
   * 找最近的洋流格點
   */
  findNearestCurrent(lat, lng, currents) {
    let nearest = currents[0];
    let minDist = Infinity;
    for (const c of currents) {
      const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
      if (d < minDist) {
        minDist = d;
        nearest = c;
      }
    }
    return nearest;
  },

  /**
   * 速度 → RGB 陣列（不含 alpha，方便動態調整透明度）
   */
  speedToRGB(speed) {
    if (speed > 0.8) return [255, 80, 80];
    if (speed > 0.5) return [255, 200, 50];
    if (speed > 0.3) return [0, 212, 255];
    return [100, 180, 255];
  },

  /**
   * 洋流粒子動畫主迴圈（clearRect + trail-history，保持 Canvas 透明）
   */
  animateCurrents() {
    if (!this.currentCtx || !this.map) return;

    const ctx = this.currentCtx;
    const w = this.currentCanvas.width;
    const h = this.currentCanvas.height;

    // ★ 完全清除 Canvas → 地圖圖磚 & 標記可透過
    ctx.clearRect(0, 0, w, h);

    const currents = MockData.getOceanCurrents();
    const trailMaxLen = 12;

    this.particles.forEach((p) => {
      // 依洋流方向移動
      const current = this.findNearestCurrent(p.lat, p.lng, currents);
      const rad = (current.direction * Math.PI) / 180;
      const moveScale = 0.0003 * current.speed;
      p.lat += Math.cos(rad) * moveScale;
      p.lng += Math.sin(rad) * moveScale;
      p.speed = current.speed;
      p.direction = current.direction;
      p.age++;

      // 轉螢幕座標 → 存入軌跡
      const pt = this.map.latLngToContainerPoint([p.lat, p.lng]);
      p.trail.push({ x: pt.x, y: pt.y });
      if (p.trail.length > trailMaxLen) p.trail.shift();

      // 超出畫面或超齡 → 重新生成
      if (
        pt.x < -30 ||
        pt.x > w + 30 ||
        pt.y < -30 ||
        pt.y > h + 30 ||
        p.age > p.maxAge
      ) {
        Object.assign(p, this.createParticle(currents));
        p.age = 0;
        return;
      }

      // 繪製軌跡拖尾（舊→新，越新越亮）
      if (p.trail.length < 2) return;
      const rgb = this.speedToRGB(current.speed);
      const lifeRatio = Math.min((1 - p.age / p.maxAge) * 1.5, 1);

      for (let i = 1; i < p.trail.length; i++) {
        const segRatio = i / p.trail.length;
        const alpha = segRatio * lifeRatio * 0.85;
        ctx.beginPath();
        ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
        ctx.lineWidth = 1 + current.speed * segRatio * 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // 粒子頭部亮點
      const head = p.trail[p.trail.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 1.5 + current.speed * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${lifeRatio * 0.9})`;
      ctx.fill();
    });

    this.currentAnimFrame = requestAnimationFrame(() => this.animateCurrents());
  },

  /**
   * 繪製靜態洋流箭頭（圖層切換用）
   */
  drawCurrentArrows() {
    if (!this.currentCtx || !this.map) return;
    const ctx = this.currentCtx;
    const currents = MockData.getOceanCurrents();

    currents.forEach((c) => {
      const point = this.map.latLngToContainerPoint([c.lat, c.lng]);
      const rad = (c.direction * Math.PI) / 180;
      const len = 15 + c.speed * 20;

      const endX = point.x + Math.sin(rad) * len;
      const endY = point.y - Math.cos(rad) * len;

      // 箭頭線
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(endX, endY);
      const rgb = this.speedToRGB(c.speed);
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.7)`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      // 箭頭尖
      const arrowSize = 5;
      const angle1 = rad + Math.PI + 0.4;
      const angle2 = rad + Math.PI - 0.4;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX + Math.sin(angle1) * arrowSize,
        endY - Math.cos(angle1) * arrowSize,
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX + Math.sin(angle2) * arrowSize,
        endY - Math.cos(angle2) * arrowSize,
      );
      ctx.stroke();
    });
  },

  /**
   * 綁定圖層切換按鈕
   */
  bindLayerButtons() {
    const buttons = document.querySelectorAll(".map-btn[data-layer]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const layer = btn.getAttribute("data-layer");
        this.activeLayer = layer;
        this.toggleLayers(layer);
      });
    });
  },

  /**
   * 圖層切換
   */
  toggleLayers(layer) {
    // 顯示/隱藏箱網標記
    const showMarkers = layer === "all" || layer === "temp";
    this.cageMarkers.forEach((m) => {
      if (showMarkers) {
        m.getElement && m.getElement()
          ? (m.getElement().style.display = "")
          : null;
        if (!this.map.hasLayer(m)) this.map.addLayer(m);
      } else {
        if (this.map.hasLayer(m)) this.map.removeLayer(m);
      }
    });
    if (this.vesselMarker) {
      if (showMarkers) {
        if (!this.map.hasLayer(this.vesselMarker))
          this.map.addLayer(this.vesselMarker);
      } else {
        if (this.map.hasLayer(this.vesselMarker))
          this.map.removeLayer(this.vesselMarker);
      }
    }

    // 顯示/隱藏洋流
    const showCurrents = layer === "all" || layer === "current";
    if (this.currentCanvas) {
      this.currentCanvas.style.display = showCurrents ? "" : "none";
    }
  },

  /**
   * 更新數據
   */
  update() {
    this.renderMarkers();
    // 洋流動畫持續運行，粒子會自動讀取最新 MockData
  },

  /**
   * 銷毀地圖（重置用）
   */
  destroy() {
    if (this.currentAnimFrame) {
      cancelAnimationFrame(this.currentAnimFrame);
      this.currentAnimFrame = null;
    }
    if (this.currentCanvas && this.currentCanvas.parentNode) {
      this.currentCanvas.parentNode.removeChild(this.currentCanvas);
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.cageMarkers = [];
    this.vesselMarker = null;
    this.particles = [];
  },
};
