// SparklesBackground.js - Ambient Background Manager: Glyph Matrix (Dark/Light), Starfield (Dark), & Sakura (Pink)
class AmbientBackgroundManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.petals = [];
    this.matrixStreams = [];
    this.matrixGrid = [];
    this.matrixLastMutation = 0;
    this.currentMode = null; // 'dark_matrix' | 'dark_stars' | 'light_matrix' | 'pink_sakura' | 'none'
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
      if (this.currentMode === 'dark_stars') this.createStars();
      else if (this.currentMode === 'dark_matrix' || this.currentMode === 'light_matrix') this.createMatrix();
      else if (this.currentMode === 'pink_sakura') this.createPetals();
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

  // --- GLYPH MATRIX: Stationary Cyber ASCII Symbol Grid with Breathing Glow & Fade ---
  createMatrix() {
    const cellSize = 14;
    this.matrixCellSize = cellSize;
    this.matrixCols = Math.ceil(this.width / cellSize);
    this.matrixRows = Math.ceil(this.height / cellSize);
    this.matrixGlyphs = "01·•+*/\\<>=-_~:;^";
    this.matrixInterval = 90; // ms for ambient micro-mutations
    this.matrixLastMutation = 0;
    this.matrixMutationRate = 0.025;

    // Stationary 2D matrix symbol grid
    this.matrixGrid = [];
    for (let r = 0; r < this.matrixRows; r++) {
      const row = [];
      for (let c = 0; c < this.matrixCols; c++) {
        // ~45% density of subtle ambient symbols
        const hasSymbol = Math.random() < 0.45;
        const isInitiallyGlowing = hasSymbol && Math.random() < 0.06;

        row.push({
          char: this.matrixGlyphs[Math.floor(Math.random() * this.matrixGlyphs.length)],
          baseAlpha: hasSymbol ? (Math.random() * 0.05 + 0.025) : 0,
          // Gentle breathing & glowing pulse state
          isGlowing: isInitiallyGlowing,
          glowProgress: isInitiallyGlowing ? Math.random() : 0,
          glowSpeed: Math.random() * 0.012 + 0.006, // smooth rise & fade
          glowPeakAlpha: Math.random() * 0.35 + 0.40,
          mutationCooldown: 0
        });
      }
      this.matrixGrid.push(row);
    }
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
    const numPetals = Math.max(12, Math.min(Math.floor((this.width * this.height) / 58000), 22));

    for (let i = 0; i < numPetals; i++) {
      this.petals.push(this.newPetal(true));
    }
  }

  newPetal(initialScatter = false) {
    const layerRand = Math.random();
    let layer = 1;
    if (layerRand < 0.35) layer = 0;
    else if (layerRand > 0.75) layer = 2;

    let baseSize, baseSpeedY, baseAlpha, swayForce, windSensitivity;
    if (layer === 0) {
      baseSize = Math.random() * 3 + 7;
      baseSpeedY = Math.random() * 0.08 + 0.16;
      baseAlpha = Math.random() * 0.15 + 0.38;
      swayForce = 0.25;
      windSensitivity = 0.7;
    } else if (layer === 1) {
      baseSize = Math.random() * 4 + 10;
      baseSpeedY = Math.random() * 0.10 + 0.22;
      baseAlpha = Math.random() * 0.15 + 0.60;
      swayForce = 0.40;
      windSensitivity = 1.0;
    } else {
      baseSize = Math.random() * 4 + 14;
      baseSpeedY = Math.random() * 0.10 + 0.28;
      baseAlpha = Math.random() * 0.12 + 0.78;
      swayForce = 0.55;
      windSensitivity = 1.25;
    }

    const shapeType = Math.floor(Math.random() * 4);

    const colorPairs = [
      { base: '#F48FB1', tip: '#FFE4E9' },
      { base: '#FF80AB', tip: '#FFF0F5' },
      { base: '#F06292', tip: '#FFD1DC' },
      { base: '#EC407A', tip: '#FFEBF0' },
      { base: '#FFAB91', tip: '#FFE8EC' }
    ];
    const colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)];

    return {
      layer,
      shapeType,
      colorPair,
      alpha: baseAlpha,
      size: baseSize,
      x: Math.random() * (this.width + 100) - 50,
      y: initialScatter ? Math.random() * (this.height + 60) - 30 : -40,
      vx: (Math.random() - 0.5) * 0.2,
      vy: baseSpeedY,
      baseSpeedY: baseSpeedY,
      swayForce: swayForce,
      windSensitivity: windSensitivity,
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.012 + 0.008,
      flutterPhase: Math.random() * Math.PI * 2,
      yawAngle: Math.random() * Math.PI * 2,
      yawSpeed: (Math.random() - 0.5) * 0.012,
      rollAngle: Math.random() * Math.PI * 2,
      rollSpeed: Math.random() * 0.016 + 0.008,
      pitchAngle: Math.random() * Math.PI * 2,
      pitchSpeed: Math.random() * 0.012 + 0.006
    };
  }

  checkThemeState() {
    const isAmbientEnabled = (typeof appStore !== 'undefined' && appStore.state)
      ? (appStore.state.ambientEffectsEnabled !== false)
      : (localStorage.getItem('collab_ambient_effects') !== 'false');

    const isDark = document.documentElement.classList.contains('dark');
    const isLight = document.documentElement.classList.contains('light');
    const isPink = document.documentElement.classList.contains('pink');

    let targetMode = 'none';
    if (isAmbientEnabled) {
      if (isDark) {
        const darkStyle = (typeof appStore !== 'undefined' && appStore.state?.darkAmbientStyle) || localStorage.getItem('collab_dark_ambient') || 'matrix';
        targetMode = (darkStyle === 'stars') ? 'dark_stars' : 'dark_matrix';
      } else if (isLight) {
        targetMode = 'light_matrix';
      } else if (isPink) {
        targetMode = 'pink_sakura';
      }
    }

    if (targetMode === this.currentMode && this.isRunning) return;

    this.currentMode = targetMode;

    if (targetMode === 'dark_stars') {
      this.createStars();
      this.start();
      if (this.canvas) {
        this.canvas.style.opacity = '1';
        this.canvas.style.display = 'block';
      }
    } else if (targetMode === 'dark_matrix' || targetMode === 'light_matrix') {
      this.createMatrix();
      this.start();
      if (this.canvas) {
        this.canvas.style.opacity = '1';
        this.canvas.style.display = 'block';
      }
    } else if (targetMode === 'pink_sakura') {
      this.createPetals();
      this.start();
      if (this.canvas) {
        this.canvas.style.opacity = '1';
        this.canvas.style.display = 'block';
      }
    } else {
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

      if (this.currentMode === 'dark_stars') {
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
      } else if (this.currentMode === 'dark_matrix' || this.currentMode === 'light_matrix') {
        // Render Stationary Cyber ASCII Symbol Grid with Organic Breathing Glow & Dimming
        const isDark = (this.currentMode === 'dark_matrix');
        const cellSize = this.matrixCellSize || 14;

        // Periodic micro-mutation timer (~90ms)
        const shouldMutate = (time - this.matrixLastMutation > this.matrixInterval);
        if (shouldMutate) {
          this.matrixLastMutation = time;
        }

        this.ctx.font = '12px Cousine, monospace, "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        if (this.matrixGrid) {
          for (let r = 0; r < this.matrixRows; r++) {
            const y = r * cellSize + (cellSize / 2);
            // Soft vertical bottom fade so it blends into background seamlessly
            const rowRatio = r / this.matrixRows;
            const bottomFade = Math.max(0.2, 1 - (rowRatio > 0.4 ? (rowRatio - 0.4) * 1.1 : 0));

            for (let c = 0; c < this.matrixCols; c++) {
              const cell = this.matrixGrid[r][c];
              if (cell.baseAlpha <= 0) continue;

              // Periodic mutation of dormant symbols
              if (shouldMutate && Math.random() < this.matrixMutationRate) {
                cell.char = this.matrixGlyphs[Math.floor(Math.random() * this.matrixGlyphs.length)];
              }

              // Randomly ignite individual symbols into a soft breathing glow cycle
              if (!cell.isGlowing && Math.random() < 0.00045) {
                cell.isGlowing = true;
                cell.glowProgress = 0;
                cell.glowSpeed = Math.random() * 0.008 + 0.004; // slow, gentle breathing pulse
                cell.glowPeakAlpha = Math.random() * 0.35 + 0.35;
                // Mutate on glow initiation for lively cryptographic effect
                cell.char = this.matrixGlyphs[Math.floor(Math.random() * this.matrixGlyphs.length)];
              }

              let currentAlpha = cell.baseAlpha;
              let isBrightGlow = false;

              // Update glow progress (sinusoidal bell curve: 0 -> peak -> 0)
              if (cell.isGlowing) {
                cell.glowProgress += cell.glowSpeed;
                if (cell.glowProgress >= 1) {
                  cell.isGlowing = false;
                  cell.glowProgress = 0;
                } else {
                  const pulseFactor = Math.sin(cell.glowProgress * Math.PI);
                  currentAlpha = cell.baseAlpha + (cell.glowPeakAlpha - cell.baseAlpha) * pulseFactor;
                  if (pulseFactor > 0.4) {
                    isBrightGlow = true;
                  }
                }
              }

              const finalAlpha = currentAlpha * bottomFade;
              if (finalAlpha <= 0.005) continue;

              const x = c * cellSize + (cellSize / 2);

              if (isDark) {
                if (isBrightGlow) {
                  this.ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha.toFixed(3)})`;
                  this.ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
                  this.ctx.shadowBlur = 4;
                } else {
                  this.ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha.toFixed(3)})`;
                  this.ctx.shadowColor = 'transparent';
                  this.ctx.shadowBlur = 0;
                }
              } else {
                if (isBrightGlow) {
                  this.ctx.fillStyle = `rgba(15, 15, 18, ${finalAlpha.toFixed(3)})`;
                  this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
                  this.ctx.shadowBlur = 2;
                } else {
                  this.ctx.fillStyle = `rgba(40, 40, 45, ${finalAlpha.toFixed(3)})`;
                  this.ctx.shadowColor = 'transparent';
                  this.ctx.shadowBlur = 0;
                }
              }

              this.ctx.fillText(cell.char, x, y);
            }
          }
          // Reset shadow for next operations
          this.ctx.shadowColor = 'transparent';
          this.ctx.shadowBlur = 0;
        }
      } else if (this.currentMode === 'pink_sakura') {
        // Multi-frequency Spring Breeze Simulation
        // Ambient wind current that waxes and wanes naturally across space & time
        const breezeX = Math.sin(time * 0.0004) * 0.40 + Math.sin(time * 0.0011 + 1.2) * 0.20 + 0.15;
        const breezeY = Math.cos(time * 0.0006 + 0.8) * 0.05;

        for (let i = 0; i < this.petals.length; i++) {
          const petal = this.petals[i];

          // 3D rotation & aerodynamic flutter coupled with air speed
          petal.swayAngle += petal.swaySpeed;
          petal.yawAngle += petal.yawSpeed + (petal.vx * 0.012);
          petal.rollAngle += petal.rollSpeed + (Math.abs(petal.vx) * 0.015);
          petal.pitchAngle += petal.pitchSpeed;

          // Compute 3D tumbling scale
          const flipX = Math.cos(petal.rollAngle);
          const flipY = Math.cos(petal.pitchAngle);
          const scaleX = Math.abs(flipX) > 0.08 ? flipX : 0.08;
          const scaleY = Math.abs(flipY) > 0.08 ? flipY : 0.08;
          const isReverse = flipX < 0 || flipY < 0;

          // Aerodynamic lift & gliding force generated by petal orientation in air
          const liftX = Math.sin(petal.yawAngle) * Math.cos(petal.rollAngle) * 0.35;
          const liftY = -Math.abs(Math.sin(petal.rollAngle)) * 0.06;

          // Target velocities influenced by natural breeze + petal aerodynamic glide + gentle sway
          const targetVx = (breezeX * petal.windSensitivity) + liftX + (Math.sin(petal.swayAngle) * petal.swayForce);
          const targetVy = petal.baseSpeedY + breezeY + liftY;

          // Smooth inertia damping (creates graceful swoops, curves, and natural floating)
          petal.vx += (targetVx - petal.vx) * 0.035;
          petal.vy += (targetVy - petal.vy) * 0.035;

          petal.x += petal.vx;
          petal.y += petal.vy;

          // Natural screen wrap & boundary respawn
          if (petal.y > this.height + 40) {
            this.petals[i] = this.newPetal(false);
            continue;
          }
          if (petal.x > this.width + 60) {
            petal.x = -40;
          } else if (petal.x < -60) {
            petal.x = this.width + 40;
          }

          this.ctx.save();
          this.ctx.translate(petal.x, petal.y);
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