// SparklesBackground.js - Ultra-Slow, Calm Ambient Starfield for Dark Mode
class AmbientStarfield {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.animationFrameId = null;
    this.isRunning = false;
    this.density = 45; // Sparse, calm and elegant
  }

  init() {
    let canvas = document.getElementById('ambient-sparkles-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'ambient-sparkles-canvas';
      canvas.className = 'fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000';
      canvas.style.opacity = '0';
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
    const count = Math.floor((this.width * this.height) / 22000); // Responsive sparse density
    const numStars = Math.max(30, Math.min(count, 70));

    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.2 + 0.6, // 0.6px to 1.8px tiny stars
        baseAlpha: Math.random() * 0.4 + 0.15, // 0.15 to 0.55 opacity
        twinkleSpeed: Math.random() * 0.008 + 0.003, // Very slow calm twinkle
        twinkleOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.06, // Ultra-slow drift
        vy: -(Math.random() * 0.08 + 0.02) // Gentle upward float
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
        }, 500);
      }
      this.stop();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    let lastTime = performance.now();

    const render = (time) => {
      if (!this.isRunning) return;
      const dt = time - lastTime;
      lastTime = time;

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.stars.length; i++) {
        const star = this.stars[i];

        // Move star ultra-slowly
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < 0) star.x = this.width;
        if (star.x > this.width) star.x = 0;
        if (star.y < 0) star.y = this.height;
        if (star.y > this.height) star.y = 0;

        // Gentle smooth sine wave twinkle
        const alpha = Math.max(0.08, star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.35);

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