// SparklesBackground.js - Micro-Pinpoint Ultra-Slow Serene Starfield (Strictly Behind UI Cards)
class AmbientStarfield {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.animationFrameId = null;
    this.isRunning = false;
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
    this.createStars();

    window.addEventListener('resize', () => {
      this.resize();
      this.createStars();
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

  createStars() {
    this.stars = [];
    // Sparse, serene density of tiny pinpoint micro-stars
    const numStars = Math.max(40, Math.min(Math.floor((this.width * this.height) / 18000), 90));

    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 0.5 + 0.5, // 0.5px to 1.0px tiny pinpoint dots
        baseAlpha: Math.random() * 0.3 + 0.15, // 0.15 to 0.45 soft opacity
        twinkleSpeed: Math.random() * 0.002 + 0.0008, // Ultra slow, barely perceptible twinkle
        twinkleOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.02, // Barely moving drift
        vy: -(Math.random() * 0.03 + 0.01) // Extremely gentle upward float
      });
    }
  }

  checkThemeState() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      if (!this.isRunning) {
        this.start();
      }
      if (this.canvas) {
        this.canvas.style.opacity = '1';
        this.canvas.style.display = 'block';
      }
    } else {
      if (this.canvas) {
        this.canvas.style.opacity = '0';
        setTimeout(() => {
          if (!document.documentElement.classList.contains('dark') && this.canvas) {
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

      for (let i = 0; i < this.stars.length; i++) {
        const star = this.stars[i];

        // Move star at ultra-slow speed
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around screen boundaries
        if (star.x < 0) star.x = this.width;
        if (star.x > this.width) star.x = 0;
        if (star.y < 0) star.y = this.height;
        if (star.y > this.height) star.y = 0;

        // Soft, gentle breathing twinkle
        const alpha = Math.max(0.08, Math.min(0.55, star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.2));

        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fill();
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

const ambientStarfield = new AmbientStarfield();

document.addEventListener('DOMContentLoaded', () => {
  ambientStarfield.init();
});