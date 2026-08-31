// SparklesBackground.js - Ambient Background Manager: Pinpoint Starfield (Dark Mode) & Multi-Depth Sakura Engine (Pink Mode)
class AmbientBackgroundManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.petals = [];
    this.currentMode = null; // 'dark' | 'pink' | 'none'
    this.animationFrameId = null;
    this.isRunning = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  init() {
    let canvas = document.getElementById('ambient-sparkles-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'ambient-sparkles-canvas';
      canvas.className = 'fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000';
      canvas.style.opacity = '0';
      canvas.style.zIndex = '0';
      document.body.prepend(canvas);
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => {
      this.resize();
      if (this.currentMode === 'dark') this.createStars();
      if (this.currentMode === 'pink') this.createPetals();
    });

    this.checkThemeState();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  // --- DARK THEME: Micro-Pinpoint Starfield ---
  createStars() {
    this.stars = [];
    const numStars = Math.max(40, Math.min(Math.floor((this.width * this.height) / 18000), 90));

    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 0.5 + 0.5,
        baseAlpha: Math.random() * 0.3 + 0.15,
        twinkleSpeed: Math.random() * 0.002 + 0.0008,
        twinkleOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.02,
        vy: -(Math.random() * 0.03 + 0.01)
      });
    }
  }

  // --- PINK THEME: Japanese Cherry Blossom (Sakura) Falling Leaves & Petals ---
  createPetals() {
    this.petals = [];
    // Serene, very sparse density (14-22 petals on 1080p screen) for minimal clutter
    const numPetals = Math.max(12, Math.min(Math.floor((this.width * this.height) / 58000), 22));

    for (let i = 0; i < numPetals; i++) {
      this.petals.push(this.newPetal(true));
    }
  }

  newPetal(initialScatter = false) {
    // 3 Layer Depths: 0 = Far Background, 1 = Midground, 2 = Foreground
    const layerRand = Math.random();
    let layer = 1;
    if (layerRand < 0.35) layer = 0;
    else if (layerRand > 0.75) layer = 2;

    // Layer-specific attributes for depth of field
    let baseSize, baseSpeedY, baseAlpha, swayRadius;
    if (layer === 0) {
      baseSize = Math.random() * 3 + 7;         // Small 7-10px
      baseSpeedY = Math.random() * 0.08 + 0.12; // Ultra slow 0.12-0.20px/frame
      baseAlpha = Math.random() * 0.15 + 0.38;  // Softer opacity
      swayRadius = Math.random() * 6 + 4;       // Tight gentle sway
    } else if (layer === 1) {
      baseSize = Math.random() * 4 + 10;        // Medium 10-14px
      baseSpeedY = Math.random() * 0.10 + 0.18; // 0.18-0.28px/frame
      baseAlpha = Math.random() * 0.15 + 0.60;  // Medium opacity
      swayRadius = Math.random() * 10 + 6;      // Medium natural sway
    } else {
      baseSize = Math.random() * 4 + 14;        // Large 14-18px
      baseSpeedY = Math.random() * 0.10 + 0.24; // 0.24-0.34px/frame
      baseAlpha = Math.random() * 0.12 + 0.78;  // Rich foreground opacity
      swayRadius = Math.random() * 14 + 8;      // Expressive gentle sway
    }

    // 4 distinct leaf & petal shapes
    const shapeType = Math.floor(Math.random() * 4);

    // Varied natural gradient tone pairs (Stem base -> Petal crown)
    const colorPairs = [
      { base: '#F48FB1', tip: '#FFE4E9' }, // Classic rosy sakura
      { base: '#FF80AB', tip: '#FFF0F5' }, // Vibrant blossom
      { base: '#F06292', tip: '#FFD1DC' }, // Deep cherry accent
      { base: '#EC407A', tip: '#FFEBF0' }, // Spring rosebud
      { base: '#FFAB91', tip: '#FFE8EC' }  // Warm coral-sakura
    ];
    const colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)];

    return {
      layer,
      shapeType,
      colorPair,
      alpha: baseAlpha,
      size: baseSize,
      baseX: Math.random() * (this.width + 40) - 20,
      y: initialScatter ? Math.random() * (this.height + 60) - 30 : -40,
      // Minimal, bounded horizontal drift so petals stay in their lane
      driftX: (Math.random() - 0.5) * 0.03,
      speedY: baseSpeedY,
      // Bounded wave sway physics (no running sideways across screen)
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.008 + 0.005,
      swayRadius: swayRadius,
      windOffset: Math.random() * Math.PI * 2,
      // 3D tumbling rotation
      yawAngle: Math.random() * Math.PI * 2,
      yawSpeed: (Math.random() - 0.5) * 0.010,
      rollAngle: Math.random() * Math.PI * 2,
      rollSpeed: Math.random() * 0.012 + 0.006,
      pitchAngle: Math.random() * Math.PI * 2,
      pitchSpeed: Math.random() * 0.009 + 0.004
    };
  }

  checkThemeState() {
    const isAmbientEnabled = (typeof appStore !== 'undefined' && appStore.state)
      ? (appStore.state.ambientEffectsEnabled !== false)
      : (localStorage.getItem('collab_ambient_effects') !== 'false');

    const isDark = document.documentElement.classList.contains('dark');
    const isPink = document.documentElement.classList.contains('pink');

    let targetMode = 'none';
    if (isAmbientEnabled) {
      if (isDark) targetMode = 'dark';
      else if (isPink) targetMode = 'pink';
    }

    if (targetMode === this.currentMode && this.isRunning) return;

    this.currentMode = targetMode;

    if (targetMode === 'dark') {
      this.createStars();
      this.start();
      if (this.canvas) {
        this.canvas.style.opacity = '1';
        this.canvas.style.display = 'block';
      }
    } else if (targetMode === 'pink') {
      this.createPetals();
      this.start();
      if (this.canvas) {
        this.canvas.style.opacity = '1';
        this.canvas.style.display = 'block';
      }
    } else {
      // Disabled / Light mode: smoothly fade out and pause loop
      if (this.canvas) {
        this.canvas.style.opacity = '0';
        setTimeout(() => {
          if (this.currentMode === 'none' && this.canvas) {
            this.canvas.style.display = 'none';
          }
        }, 400);
      }
      this.stop();
    }
  }

  // Draw organic petal geometries with depth and curves
  drawPetalPath(ctx, shapeType, s) {
    ctx.beginPath();
    switch (shapeType) {
      case 0: // Classic Notched Sakura Petal
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.50, -s * 0.95, s * 0.85, -s * 0.25, s * 0.50, s * 0.70);
        ctx.bezierCurveTo(s * 0.20, s * 0.98, 0, s, 0, s);
        ctx.bezierCurveTo(0, s, -s * 0.20, s * 0.98, -s * 0.50, s * 0.70);
        ctx.bezierCurveTo(-s * 0.85, -s * 0.25, -s * 0.50, -s * 0.95, 0, -s);
        break;

      case 1: // Slender Asymmetric Drifting Petal
        ctx.moveTo(0, -s * 1.15);
        ctx.bezierCurveTo(s * 0.75, -s * 0.65, s * 0.55, s * 0.35, 0, s * 0.95);
        ctx.bezierCurveTo(-s * 0.25, s * 0.45, -s * 0.45, -s * 0.45, 0, -s * 1.15);
        break;

      case 2: // Broad Rounded Blossom Petal
        ctx.moveTo(0, -s * 0.85);
        ctx.bezierCurveTo(s * 0.92, -s * 0.75, s * 0.80, s * 0.55, 0, s * 0.95);
        ctx.bezierCurveTo(-s * 0.80, s * 0.55, -s * 0.92, -s * 0.75, 0, -s * 0.85);
        break;

      case 3: // Folded / Cupped Leaf Petal
      default:
        ctx.moveTo(-s * 0.15, -s);
        ctx.bezierCurveTo(s * 0.70, -s * 0.70, s * 0.60, s * 0.30, 0, s);
        ctx.bezierCurveTo(-s * 0.55, s * 0.25, -s * 0.65, -s * 0.55, -s * 0.15, -s);
        break;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const render = (time) => {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.currentMode === 'dark') {
        // Render Dark Mode Starfield
        for (let i = 0; i < this.stars.length; i++) {
          const star = this.stars[i];

          star.x += star.vx;
          star.y += star.vy;

          if (star.x < 0) star.x = this.width;
          if (star.x > this.width) star.x = 0;
          if (star.y < 0) star.y = this.height;
          if (star.y > this.height) star.y = 0;

          const alpha = Math.max(0.08, Math.min(0.55, star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.2));

          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
          this.ctx.beginPath();
          this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else if (this.currentMode === 'pink') {
        // Render Pink Mode Multi-Depth Sakura Engine
        for (let i = 0; i < this.petals.length; i++) {
          const petal = this.petals[i];

          // Slow vertical fall & bounded swaying
          petal.y += petal.speedY;
          petal.baseX += petal.driftX;
          petal.swayAngle += petal.swaySpeed;

          // Compute bounded natural sway position (no huge horizontal travels)
          const swayOffset = Math.sin(petal.swayAngle) * petal.swayRadius + Math.sin(time * 0.0003 + petal.windOffset) * 5;
          const renderX = petal.baseX + swayOffset;

          // 3D rotation & flutter
          petal.yawAngle += petal.yawSpeed;
          petal.rollAngle += petal.rollSpeed;
          petal.pitchAngle += petal.pitchSpeed;

          // Recycle when petal leaves bottom of the viewport
          if (petal.y > this.height + 35) {
            this.petals[i] = this.newPetal(false);
            continue;
          }

          // Compute 3D tumbling scale
          const flipX = Math.cos(petal.rollAngle);
          const flipY = Math.cos(petal.pitchAngle);
          const scaleX = Math.abs(flipX) > 0.08 ? flipX : 0.08;
          const scaleY = Math.abs(flipY) > 0.08 ? flipY : 0.08;
          const isReverse = flipX < 0 || flipY < 0;

          this.ctx.save();
          this.ctx.translate(renderX, petal.y);
          this.ctx.rotate(petal.yawAngle);
          this.ctx.scale(scaleX, scaleY);
          this.ctx.globalAlpha = petal.alpha;

          const s = petal.size;

          // Realistic 3D Directional Lighting Gradient
          const gradient = this.ctx.createLinearGradient(0, s, 0, -s);
          if (!isReverse) {
            gradient.addColorStop(0, petal.colorPair.base);
            gradient.addColorStop(0.5, petal.colorPair.tip);
            gradient.addColorStop(1, '#FFFFFF');
          } else {
            gradient.addColorStop(0, petal.colorPair.base);
            gradient.addColorStop(0.7, petal.colorPair.tip);
            gradient.addColorStop(1, '#FFF5F8');
          }

          // Foreground & Midground Depth Shadow
          if (petal.layer === 2) {
            this.ctx.shadowColor = 'rgba(233, 30, 99, 0.22)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetY = 2;
          } else if (petal.layer === 1) {
            this.ctx.shadowColor = 'rgba(233, 30, 99, 0.12)';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowOffsetY = 1;
          }

          // Fill contoured petal
          this.drawPetalPath(this.ctx, petal.shapeType, s);
          this.ctx.fillStyle = gradient;
          this.ctx.fill();

          // Reset shadow for vein highlight
          this.ctx.shadowColor = 'transparent';

          // Delicate translucent vein / crease line
          this.ctx.strokeStyle = isReverse ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.35)';
          this.ctx.lineWidth = 0.55;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -s * 0.7);
          this.ctx.quadraticCurveTo(s * 0.03, 0, 0, s * 0.75);
          this.ctx.stroke();

          // Subtle edge highlight
          this.ctx.strokeStyle = isReverse ? 'rgba(244, 143, 177, 0.25)' : 'rgba(255, 255, 255, 0.20)';
          this.ctx.lineWidth = 0.4;
          this.ctx.stroke();

          this.ctx.restore();
        }
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

// Instantiate singleton with backward-compatible alias
const ambientStarfield = new AmbientBackgroundManager();
const ambientBackground = ambientStarfield;

document.addEventListener('DOMContentLoaded', () => {
  ambientBackground.init();
});