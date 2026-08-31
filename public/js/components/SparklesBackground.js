// SparklesBackground.js - Ambient Background Manager: Pinpoint Starfield (Dark Mode) & Serene Falling Sakura Petals (Pink Mode)
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

  // --- PINK THEME: Japanese Cherry Blossom (Sakura) Falling Petals ---
  createPetals() {
    this.petals = [];
    // Serene, soothing density that never overwhelms the UI
    const numPetals = Math.max(28, Math.min(Math.floor((this.width * this.height) / 28000), 50));
    
    // Palette of delicate Japanese cherry blossom tones
    const sakuraColors = [
      'rgba(255, 183, 197, 0.72)', // Classic soft sakura
      'rgba(255, 195, 212, 0.65)', // Pale spring blossom
      'rgba(244, 143, 177, 0.68)', // Rosy cherry petal
      'rgba(255, 218, 228, 0.75)', // Delicate blush
      'rgba(255, 128, 171, 0.55)'  // Vibrant sakura pink
    ];

    for (let i = 0; i < numPetals; i++) {
      this.petals.push(this.newPetal(sakuraColors, true));
    }
  }

  newPetal(sakuraColors, initialScatter = false) {
    const colors = sakuraColors || [
      'rgba(255, 183, 197, 0.72)',
      'rgba(255, 195, 212, 0.65)',
      'rgba(244, 143, 177, 0.68)',
      'rgba(255, 218, 228, 0.75)',
      'rgba(255, 128, 171, 0.55)'
    ];

    const size = Math.random() * 6 + 7; // 7px to 13px petal size
    return {
      x: Math.random() * (this.width + 100) - 50,
      y: initialScatter ? Math.random() * (this.height + 40) - 20 : -30,
      size: size,
      // Very slow and serene falling speed
      speedY: Math.random() * 0.45 + 0.35, 
      speedX: Math.random() * 0.35 + 0.2,
      // Gentle wind swaying physics
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.012 + 0.008,
      swayRadius: Math.random() * 1.5 + 0.8,
      // 3D realistic tumbling & flipping in the breeze
      yawAngle: Math.random() * Math.PI * 2,
      yawSpeed: (Math.random() - 0.5) * 0.015,
      rollAngle: Math.random() * Math.PI * 2,
      rollSpeed: Math.random() * 0.018 + 0.008,
      pitchAngle: Math.random() * Math.PI * 2,
      pitchSpeed: Math.random() * 0.014 + 0.006,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  checkThemeState() {
    const isDark = document.documentElement.classList.contains('dark');
    const isPink = document.documentElement.classList.contains('pink');

    let targetMode = 'none';
    if (isDark) targetMode = 'dark';
    else if (isPink) targetMode = 'pink';

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
      // Light mode or undefined: fade out and pause loop
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
        // Render Pink Mode Sakura Petals
        const globalBreeze = Math.sin(time * 0.0006) * 0.35;

        for (let i = 0; i < this.petals.length; i++) {
          const petal = this.petals[i];

          // Update motion
          petal.y += petal.speedY;
          petal.x += petal.speedX + globalBreeze + Math.sin(petal.swayAngle) * petal.swayRadius;
          petal.swayAngle += petal.swaySpeed;

          // 3D tumbling rotation
          petal.yawAngle += petal.yawSpeed;
          petal.rollAngle += petal.rollSpeed;
          petal.pitchAngle += petal.pitchSpeed;

          // Recycle when petal falls off-screen
          if (petal.y > this.height + 30 || petal.x > this.width + 50 || petal.x < -60) {
            this.petals[i] = this.newPetal(null, false);
            continue;
          }

          // Draw graceful Sakura petal with 3D flip effect
          this.ctx.save();
          this.ctx.translate(petal.x, petal.y);
          this.ctx.rotate(petal.yawAngle);

          // Simulate 3D tilt/tumbling
          const flipX = Math.cos(petal.rollAngle);
          const flipY = Math.cos(petal.pitchAngle);
          const scaleX = Math.abs(flipX) > 0.08 ? flipX : 0.08;
          const scaleY = Math.abs(flipY) > 0.08 ? flipY : 0.08;
          this.ctx.scale(scaleX, scaleY);

          // Organic Sakura petal shape
          const s = petal.size;
          this.ctx.fillStyle = petal.color;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -s);
          this.ctx.bezierCurveTo(s * 0.55, -s * 0.9, s * 0.8, -s * 0.25, s * 0.5, s * 0.65);
          this.ctx.bezierCurveTo(s * 0.25, s * 0.95, 0, s, 0, s);
          this.ctx.bezierCurveTo(0, s, -s * 0.25, s * 0.95, -s * 0.5, s * 0.65);
          this.ctx.bezierCurveTo(-s * 0.8, -s * 0.25, -s * 0.55, -s * 0.9, 0, -s);
          this.ctx.fill();

          // Subtle gentle petal vein / specular highlight
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -s * 0.6);
          this.ctx.quadraticCurveTo(s * 0.04, 0, 0, s * 0.7);
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