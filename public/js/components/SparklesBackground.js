// SparklesBackground.js - Aceternity-Style Ambient Starfield & Twinkling Sparkles
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
      canvas.className = 'fixed inset-0 pointer-events-none z-[1] transition-opacity duration-700';
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
    // Calculate density based on screen size (approx 120-160 sparkles on 1080p desktop)
    const numStars = Math.max(70, Math.min(Math.floor((this.width * this.height) / 9000), 180));

    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.6 + 0.8, // 0.8px to 2.4px crisp sparkles
        baseAlpha: Math.random() * 0.5 + 0.3, // 0.3 to 0.8 visibility
        twinkleSpeed: Math.random() * 0.005 + 0.002, // Ultra slow, relaxed twinkle
        twinkleOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.08, // Slow gentle drift
        vy: -(Math.random() * 0.12 + 0.03) // Upward drift
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

        // Drift slowly
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around screen boundaries
        if (star.x < 0) star.x = this.width;
        if (star.x > this.width) star.x = 0;
        if (star.y < 0) star.y = this.height;
        if (star.y > this.height) star.y = 0;

        // Smooth breathing twinkle
        const alpha = Math.max(0.12, Math.min(1.0, star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.4));

        // Draw glowing circular star particle
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