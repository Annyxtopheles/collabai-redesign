// SparklesBackground.js - Ambient Background Manager: SaaS Aurora (SaaS), Synthwave (Synth), CRT Raster (CRT), Neural Vortex (Dark), Glyph Matrix (Dark/Light), Starfield (Dark), & Sakura (Pink)
class AmbientBackgroundManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.petals = [];
    this.vortexParticles = [];
    this.crtPhosphorParticles = [];
    this.crtBeamY = 0;
    this.synthStars = [];
    this.synthGridOffset = 0;
    this.saasOrbs = [];
    this.saasSpecks = [];
    this.matrixGrid = [];
    this.matrixLastMutation = 0;
    this.currentMode = null; // 'saas_aurora' | 'synthwave_grid' | 'crt_raster' | 'dark_vortex' | 'dark_matrix' | 'dark_stars' | 'light_matrix' | 'pink_sakura' | 'none'
    this.animationFrameId = null;
    this.isRunning = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;
    this.webglCanvas = null;
    this.gl = null;
    this.shaderProgram = null;
  }

  init() {
    // 1. Initialize 2D Canvas for Classic Themes
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

    // 2. Initialize WebGL Canvas for GPU Neural Vortex Shader
    this.initWebGLShader();

    this.resize();

    window.addEventListener('resize', () => {
      this.resize();
      if (this.currentMode === 'synthwave_grid') this.createSynthwave();
      else if (this.currentMode === 'crt_raster') this.createCRT();
      else if (this.currentMode === 'dark_stars') this.createStars();
      else if (this.currentMode === 'dark_matrix' || this.currentMode === 'light_matrix') this.createMatrix();
      else if (this.currentMode === 'pink_sakura') this.createPetals();
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    }, { passive: true });

    this.checkThemeState();
  }

  initWebGLShader() {
    let glCanvas = document.getElementById('ambient-webgl-canvas');
    if (!glCanvas) {
      glCanvas = document.createElement('canvas');
      glCanvas.id = 'ambient-webgl-canvas';
      glCanvas.className = 'fixed inset-0 pointer-events-none z-0 transition-opacity duration-700';
      glCanvas.style.opacity = '0';
      glCanvas.style.zIndex = '0';
      glCanvas.style.display = 'none';
      document.body.prepend(glCanvas);
    }
    this.webglCanvas = glCanvas;

    const gl = glCanvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return false;
    this.gl = gl;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;

      vec2 domainWarp(vec2 p, float t) {
        for (int i = 1; i <= 4; i++) {
          float fi = float(i);
          p += vec2(
            sin(p.y * 2.2 + t * 0.25 + fi * 0.7) * 0.35,
            cos(p.x * 1.8 - t * 0.20 + fi * 0.9) * 0.35
          ) / fi;
        }
        return p;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        vec2 mouse = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        mouse.y = -mouse.y;

        float t = u_time * 0.28;

        // 1. Wispy Electric Silk Filaments
        vec2 p = uv;
        vec2 warped = domainWarp(p * 2.0 + vec2(t * 0.08, -t * 0.06), t);

        // Thin flowing caustic ribbon
        float ribbonDist = abs(warped.y - warped.x * 0.60 + sin(warped.x * 2.8 + t) * 0.25);
        float ribbonGlow = 0.018 / (ribbonDist + 0.022);
        
        // Fine delicate filaments
        float filaments = 0.009 / (abs(sin(warped.x * 4.5 + warped.y * 3.2 + t * 0.7)) + 0.045);

        // 2. Compact 4-Point Caustic Starburst at Cursor
        vec2 toMouse = uv - mouse;
        float distMouse = length(toMouse);

        float ang = atan(toMouse.y, toMouse.x);
        // Sharp 4-point diamond rays
        float flareRays = pow(abs(cos(ang * 2.0 + 0.785)), 12.0) + pow(abs(sin(ang * 2.0 + 0.785)), 12.0);
        float starburst = (0.015 / (distMouse + 0.015)) * (0.2 + flareRays * 0.8) * smoothstep(0.4, 0.0, distMouse);

        // Crisp compact white point core
        float whiteCore = 0.008 / (distMouse * distMouse * 45.0 + 0.006);

        // 3. Electric Royal Indigo Palette
        vec3 bgCol = vec3(0.02, 0.035, 0.08);
        vec3 deepIndigo = vec3(0.12, 0.28, 0.98);
        vec3 cyanHighlight = vec3(0.45, 0.78, 1.0);
        vec3 whiteCoreColor = vec3(1.0, 1.0, 1.0);

        vec3 color = bgCol * 0.2;
        color += deepIndigo * (ribbonGlow * 0.75 + filaments * 0.4);
        color += cyanHighlight * (starburst * 0.7 + filaments * 0.25);
        color += whiteCoreColor * (whiteCore * 0.9 + starburst * 0.35);

        // Atmospheric vignette
        float vig = 1.0 - smoothstep(0.5, 1.6, length(uv));
        color *= vig;

        gl_FragColor = vec4(color, clamp(length(color) * 0.75, 0.0, 1.0));
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return false;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return false;
    }

    this.shaderProgram = program;

    // Compile CRT FaultyTerminal Shader Program
    const crtFsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;

      float time;

      float noise(vec2 p) {
        return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.09))) + 0.2; 
      }

      mat2 rotate(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
      }

      float fbm(vec2 p) {
        p *= 1.1;
        float f = 0.0;
        float amp = 0.35;
        
        mat2 modify0 = rotate(time * 0.02);
        f += amp * noise(p);
        p = modify0 * p * 2.0;
        amp *= 0.45;
        
        mat2 modify1 = rotate(time * 0.02);
        f += amp * noise(p);
        p = modify1 * p * 2.0;
        amp *= 0.45;
        
        mat2 modify2 = rotate(time * 0.08);
        f += amp * noise(p);
        
        return f;
      }

      float digit(vec2 p) {
        vec2 grid = vec2(40.0, 20.0);
        vec2 s = floor(p * grid) / grid;
        p = p * grid;
        vec2 q = vec2(fbm(s * 0.1 + vec2(1.0)), fbm(s * 0.1 + vec2(1.0)));
        float intensity = fbm(s * 0.1 + q) * 1.2 - 0.02;
        
        vec2 mouseWorld = u_mouse;
        float distToMouse = distance(s, mouseWorld);
        float mouseInfluence = exp(-distToMouse * 5.0) * 0.20;
        intensity += mouseInfluence;
        
        float ripple = sin(distToMouse * 20.0 - u_time * 4.0) * 0.06 * mouseInfluence;
        intensity += ripple;
        
        p = fract(p);
        p *= 1.35;
        
        float px5 = p.x * 5.0;
        float py5 = (1.0 - p.y) * 5.0;
        float x = fract(px5);
        float y = fract(py5);
        
        float i = floor(py5) - 2.0;
        float j = floor(px5) - 2.0;
        float n = i * i + j * j;
        float f = n * 0.0625;
        
        float isOn = step(0.14, intensity - f);
        float brightness = isOn * (0.15 + y * 0.85) * (0.75 + x * 0.25);
        
        return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
      }

      vec2 barrel(vec2 uv) {
        vec2 c = uv * 2.0 - 1.0;
        float r2 = dot(c, c);
        c *= 1.0 + 0.08 * r2;
        return c * 0.5 + 0.5;
      }

      void main() {
        time = u_time * 0.333;
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv.y = 1.0 - uv.y;
        uv = barrel(uv);

        float d = digit(uv);
        const float off = 0.002;
        float sum = digit(uv + vec2(-off, -off)) + digit(uv + vec2(0.0, -off)) + digit(uv + vec2(off, -off)) +
                    digit(uv + vec2(-off, 0.0)) + digit(uv + vec2(0.0, 0.0)) + digit(uv + vec2(off, 0.0)) +
                    digit(uv + vec2(-off, off)) + digit(uv + vec2(0.0, off)) + digit(uv + vec2(off, off));

        float scanline = step(mod(uv.y * 120.0 + time * 12.0, 1.0), 0.25) * 0.2 + 0.85;
        vec3 tint = vec3(0.20, 1.0, 0.40);
        vec3 col = (vec3(0.85) * d + sum * 0.06 * scanline) * tint * 0.16;

        float vig = 1.0 - smoothstep(0.4, 1.4, length(uv * 2.0 - 1.0));
        col *= vig;

        gl_FragColor = vec4(col, clamp(length(col) * 1.5, 0.0, 1.0));
      }
    `;

    const crtFs = createShader(gl.FRAGMENT_SHADER, crtFsSource);
    if (crtFs) {
      const crtProgram = gl.createProgram();
      gl.attachShader(crtProgram, vs);
      gl.attachShader(crtProgram, crtFs);
      gl.linkProgram(crtProgram);
      if (gl.getProgramParameter(crtProgram, gl.LINK_STATUS)) {
        this.crtShaderProgram = crtProgram;
      }
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    this.positionLocation = gl.getAttribLocation(program, 'position');
    this.resLocation = gl.getUniformLocation(program, 'u_resolution');
    this.mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    this.timeLocation = gl.getUniformLocation(program, 'u_time');

    return true;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    if (this.webglCanvas) {
      this.webglCanvas.width = this.width;
      this.webglCanvas.height = this.height;
      if (this.gl) this.gl.viewport(0, 0, this.width, this.height);
    }
  }

  // --- SAAS THEME: Interactive Neural Vortex Background ---
  createSaaS() {
    this.vortexCenter = {
      x: this.width * 0.48,
      y: this.height * 0.28
    };

    // 1. Generate undulating neural filament streams
    this.vortexStreams = [];
    const numStreams = 14;
    for (let i = 0; i < numStreams; i++) {
      this.vortexStreams.push({
        offsetAngle: (i / numStreams) * Math.PI * 2,
        spread: (i - numStreams / 2) * 24,
        speed: Math.random() * 0.0015 + 0.0008,
        freq: Math.random() * 0.004 + 0.002,
        phase: Math.random() * Math.PI * 2,
        width: Math.random() * 2.2 + 0.8,
        color: i % 3 === 0 ? '255, 255, 255' : (i % 2 === 0 ? '120, 175, 255' : '49, 94, 255'),
        alpha: Math.random() * 0.35 + 0.25
      });
    }

    // 2. Travelling neural spark impulses
    this.vortexPulses = [];
    for (let i = 0; i < 28; i++) {
      this.vortexPulses.push({
        progress: Math.random(),
        speed: Math.random() * 0.004 + 0.002,
        streamIndex: Math.floor(Math.random() * numStreams),
        size: Math.random() * 1.8 + 1.0,
        alpha: Math.random() * 0.6 + 0.4
      });
    }
  }

  // --- SYNTHWAVE THEME: 3D Perspective Horizon Grid & Floating Stardust ---
  createSynthwave() {
    this.synthGridOffset = 0;
    this.synthStars = [];
    const numStars = Math.max(30, Math.min(Math.floor((this.width * this.height) / 24000), 65));

    for (let i = 0; i < numStars; i++) {
      this.synthStars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.65), // upper sky area
        size: Math.random() * 0.9 + 0.5,
        color: Math.random() < 0.5 ? '#FF2A85' : '#00F0FF',
        baseAlpha: Math.random() * 0.25 + 0.10,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinkleOffset: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.03 + 0.01)
      });
    }
  }

  // --- CRT THEME: Cathode Ray Scanline Sweep & Analog Phosphor Static ---
  createCRT() {
    this.crtPhosphorParticles = [];
    const numParticles = Math.max(35, Math.min(Math.floor((this.width * this.height) / 22000), 75));
    for (let i = 0; i < numParticles; i++) {
      this.crtPhosphorParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 0.7 + 0.6,
        baseAlpha: Math.random() * 0.12 + 0.06,
        flickerSpeed: Math.random() * 0.006 + 0.002,
        flickerOffset: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.04 + 0.01)
      });
    }
    this.crtBeamY = -40;
  }

  // --- DARK THEME: Interactive Synaptic Neural Vortex ---
  createVortex() {
    this.vortexParticles = [];
    const numNodes = Math.max(65, Math.min(Math.floor((this.width * this.height) / 14000), 105));
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxR = Math.min(this.width, this.height) * 0.58;

    for (let i = 0; i < numNodes; i++) {
      const spiralFactor = i / numNodes;
      const angle = (i * 2.39996) + (Math.random() * 0.3); // Golden angle distribution
      const r = Math.pow(spiralFactor, 0.65) * (maxR - 40) + 40;

      this.vortexParticles.push({
        currentAngle: angle,
        orbitSpeed: (Math.random() * 0.00032 + 0.00016) * (Math.random() < 0.2 ? -1 : 1), // ultra slow, hypnotic
        currentR: r,
        radialSpeed: (Math.random() - 0.5) * 0.035, // subtle breathing pulse
        minR: 30,
        maxR: maxR + 50,
        size: Math.random() * 0.8 + 0.8, // micro synaptic node (0.8 - 1.6px)
        baseAlpha: Math.random() * 0.16 + 0.12, // soft subtle alpha
        pulseSpeed: Math.random() * 0.0015 + 0.0008,
        pulseOffset: Math.random() * Math.PI * 2,
        x: cx,
        y: cy
      });
    }
  }

  // --- GLYPH MATRIX: Stationary Cyber ASCII Symbol Grid with Breathing Glow & Fade ---
  createMatrix() {
    const cellSize = 14;
    this.matrixCellSize = cellSize;
    this.matrixCols = Math.ceil(this.width / cellSize);
    this.matrixRows = Math.ceil(this.height / cellSize);
    this.matrixGlyphs = "01·•+*/\\<>=-_~:;^";
    this.matrixInterval = 160; // ms for ambient micro-mutations
    this.matrixLastMutation = 0;
    this.matrixMutationRate = 0.015;

    // Stationary 2D matrix symbol grid
    this.matrixGrid = [];
    for (let r = 0; r < this.matrixRows; r++) {
      const row = [];
      for (let c = 0; c < this.matrixCols; c++) {
        // ~40% density of subtle ambient symbols
        const hasSymbol = Math.random() < 0.40;
        const isInitiallyGlowing = hasSymbol && Math.random() < 0.04;

        row.push({
          char: this.matrixGlyphs[Math.floor(Math.random() * this.matrixGlyphs.length)],
          baseAlpha: hasSymbol ? (Math.random() * 0.03 + 0.015) : 0,
          // Gentle, leisurely breathing & glowing pulse state
          isGlowing: isInitiallyGlowing,
          glowProgress: isInitiallyGlowing ? Math.random() : 0,
          glowSpeed: Math.random() * 0.0035 + 0.0018, // 50% slower, serene breathing cycle
          glowPeakAlpha: Math.random() * 0.14 + 0.18,  // 50% less glow intensity (subtle & soft)
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
    const isCRT = document.documentElement.classList.contains('crt');
    const isSynthwave = document.documentElement.classList.contains('synthwave');
    const isSaaS = document.documentElement.classList.contains('saas');

    let targetMode = 'none';
    if (isAmbientEnabled) {
      if (isSaaS) {
        targetMode = 'saas_aurora';
      } else if (isSynthwave) {
        targetMode = 'synthwave_grid';
      } else if (isCRT) {
        targetMode = 'crt_raster';
      } else if (isDark) {
        const darkStyle = (typeof appStore !== 'undefined' && appStore.state?.darkAmbientStyle) || localStorage.getItem('collab_dark_ambient') || 'matrix';
        if (darkStyle === 'stars') targetMode = 'dark_stars';
        else targetMode = 'dark_matrix';
      } else if (isLight) {
        targetMode = 'light_matrix';
      } else if (isPink) {
        targetMode = 'pink_sakura';
      }
    }

    if (targetMode === this.currentMode && this.isRunning) return;

    this.currentMode = targetMode;

    if (targetMode === 'saas_aurora') {
      if (this.gl && this.shaderProgram) {
        if (this.webglCanvas) {
          this.webglCanvas.style.display = 'block';
          this.webglCanvas.style.opacity = '1';
        }
        if (this.canvas) {
          this.canvas.style.display = 'none';
        }
      } else {
        this.createSaaS();
        if (this.canvas) {
          this.canvas.style.opacity = '1';
          this.canvas.style.display = 'block';
        }
      }
      this.start();
    } else {
      if (this.webglCanvas) {
        this.webglCanvas.style.opacity = '0';
        this.webglCanvas.style.display = 'none';
      }
      if (this.canvas) {
        this.canvas.style.display = 'block';
      }

      if (targetMode === 'synthwave_grid') {
        if (this.webglCanvas) {
          this.webglCanvas.style.opacity = '0';
          this.webglCanvas.style.display = 'none';
        }
        if (this.canvas) this.canvas.style.display = 'block';
        this.createSynthwave();
        this.start();
        if (this.canvas) this.canvas.style.opacity = '1';
      } else if (targetMode === 'crt_raster') {
        // Fuse FaultyTerminal WebGL CRT Shader with 2D Analog Cathode Sweep
        if (this.gl && this.crtShaderProgram && this.webglCanvas) {
          this.webglCanvas.style.display = 'block';
          this.webglCanvas.style.opacity = '0.70';
        }
        if (this.canvas) {
          this.canvas.style.display = 'block';
          this.canvas.style.opacity = '1';
        }
        this.createCRT();
        this.start();
      } else if (targetMode === 'dark_stars') {
        if (this.webglCanvas) {
          this.webglCanvas.style.opacity = '0';
          this.webglCanvas.style.display = 'none';
        }
        if (this.canvas) this.canvas.style.display = 'block';
        this.createStars();
        this.start();
        if (this.canvas) this.canvas.style.opacity = '1';
      } else if (targetMode === 'dark_matrix' || targetMode === 'light_matrix') {
        if (this.webglCanvas) {
          this.webglCanvas.style.opacity = '0';
          this.webglCanvas.style.display = 'none';
        }
        if (this.canvas) this.canvas.style.display = 'block';
        this.createMatrix();
        this.start();
        if (this.canvas) this.canvas.style.opacity = '1';
      } else if (targetMode === 'pink_sakura') {
        if (this.webglCanvas) {
          this.webglCanvas.style.opacity = '0';
          this.webglCanvas.style.display = 'none';
        }
        if (this.canvas) this.canvas.style.display = 'block';
        this.createPetals();
        this.start();
        if (this.canvas) this.canvas.style.opacity = '1';
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

      if (this.currentMode === 'saas_aurora' && this.gl && this.shaderProgram) {
        // --- GPU WebGL Interactive Neural Vortex Fragment Shader ---
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        const gl = this.gl;
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(this.shaderProgram);

        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(this.resLocation, this.width, this.height);
        gl.uniform2f(this.mouseLocation, this.mouseX, this.mouseY);
        gl.uniform1f(this.timeLocation, time * 0.001);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      // If CRT mode, render WebGL FaultyTerminal raster under 2D canvas
      if (this.currentMode === 'crt_raster' && this.gl && this.crtShaderProgram) {
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        const gl = this.gl;
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(this.crtShaderProgram);

        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(this.resLocation, this.width, this.height);
        gl.uniform2f(this.mouseLocation, this.mouseX / this.width, 1.0 - (this.mouseY / this.height));
        gl.uniform1f(this.timeLocation, time * 0.001);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.currentMode === 'saas_aurora') {
        // Fallback 2D Canvas Neural Vortex
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.045;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.045;

        const vX = this.mouseX;
        const vY = this.mouseY;

        const plasmaGrad = this.ctx.createRadialGradient(vX, vY, 10, vX, vY, Math.max(this.width, this.height) * 0.75);
        plasmaGrad.addColorStop(0, 'rgba(49, 94, 255, 0.16)');
        plasmaGrad.addColorStop(0.3, 'rgba(30, 64, 210, 0.08)');
        plasmaGrad.addColorStop(0.65, 'rgba(10, 18, 48, 0.025)');
        plasmaGrad.addColorStop(1, 'rgba(9, 13, 22, 0)');
        this.ctx.fillStyle = plasmaGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 2. Sweeping Diagonal Electric Caustic Beam across canvas through the vortex
        const startX = -120;
        const startY = -120;
        const endX = this.width + 120;
        const endY = this.height + 120;

        // Draw flowing multi-wave neural filament streams
        if (this.vortexStreams) {
          for (let i = 0; i < this.vortexStreams.length; i++) {
            const stream = this.vortexStreams[i];
            const waveOffset = Math.sin(time * stream.speed + stream.phase);

            this.ctx.beginPath();
            const segments = 45;
            for (let s = 0; s <= segments; s++) {
              const t = s / segments;
              let px = startX + (endX - startX) * t;
              let py = startY + (endY - startY) * t;

              // Warp curve gravitationally towards the vortex center (vX, vY)
              const distToCenter = Math.hypot(px - vX, py - vY);
              const pull = Math.exp(-distToCenter / (this.width * 0.32));
              px = px + (vX - px) * pull * 0.78;
              py = py + (vY - py) * pull * 0.78;

              // Harmonic undulating electric ripple
              const ripple = Math.sin(t * 14.0 + time * stream.freq + stream.phase) * (24 + stream.spread * 0.45) * (1.0 - pull * 0.5);
              const perpX = -(endY - startY) / Math.hypot(endX - startX, endY - startY);
              const perpY = (endX - startX) / Math.hypot(endX - startX, endY - startY);

              px += perpX * (ripple + stream.spread);
              py += perpY * (ripple + stream.spread);

              if (s === 0) this.ctx.moveTo(px, py);
              else this.ctx.lineTo(px, py);
            }

            this.ctx.strokeStyle = `rgba(${stream.color}, ${(stream.alpha * (0.6 + waveOffset * 0.25)).toFixed(3)})`;
            this.ctx.lineWidth = stream.width;
            this.ctx.shadowColor = '#315EFF';
            this.ctx.shadowBlur = 14;
            this.ctx.stroke();
          }
          this.ctx.shadowBlur = 0;
        }

        // 3. Travelling Neural Impulses (Sparks along streams)
        if (this.vortexPulses) {
          for (let i = 0; i < this.vortexPulses.length; i++) {
            const p = this.vortexPulses[i];
            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;

            const t = p.progress;
            let px = startX + (endX - startX) * t;
            let py = startY + (endY - startY) * t;
            const dist = Math.hypot(px - vX, py - vY);
            const pull = Math.exp(-dist / (this.width * 0.32));
            px = px + (vX - px) * pull * 0.78;
            py = py + (vY - py) * pull * 0.78;

            const ripple = Math.sin(t * 14.0 + time * 0.003) * 24;
            const perpX = -(endY - startY) / Math.hypot(endX - startX, endY - startY);
            const perpY = (endX - startX) / Math.hypot(endX - startX, endY - startY);
            px += perpX * ripple;
            py += perpY * ripple;

            this.ctx.beginPath();
            this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            this.ctx.shadowColor = '#85A2FF';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
          }
          this.ctx.shadowBlur = 0;
        }

        // 4. Intense Caustic Starburst Singularity at the Vortex Center (vX, vY)
        const numRays = 8;
        for (let r = 0; r < numRays; r++) {
          const rayAngle = (r * Math.PI / (numRays / 2)) + Math.sin(time * 0.0008) * 0.15;
          const isPrimary = (r % 2 === 0);
          const rayLen = isPrimary ? (Math.min(this.width, this.height) * 0.42) : (Math.min(this.width, this.height) * 0.22);
          const rayWidth = isPrimary ? 22 : 12;

          this.ctx.save();
          this.ctx.translate(vX, vY);
          this.ctx.rotate(rayAngle);

          const rayGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, rayLen);
          rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          rayGrad.addColorStop(0.18, 'rgba(140, 190, 255, 0.65)');
          rayGrad.addColorStop(0.50, 'rgba(49, 94, 255, 0.25)');
          rayGrad.addColorStop(1, 'rgba(49, 94, 255, 0)');

          this.ctx.fillStyle = rayGrad;
          this.ctx.beginPath();
          this.ctx.moveTo(-rayLen, 0);
          this.ctx.quadraticCurveTo(0, rayWidth, rayLen, 0);
          this.ctx.quadraticCurveTo(0, -rayWidth, -rayLen, 0);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.restore();
        }

        // 5. Blazing White Core Singularity
        const coreGrad = this.ctx.createRadialGradient(vX, vY, 0, vX, vY, 50);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGrad.addColorStop(0.22, 'rgba(220, 240, 255, 0.92)');
        coreGrad.addColorStop(0.55, 'rgba(49, 94, 255, 0.55)');
        coreGrad.addColorStop(1, 'rgba(49, 94, 255, 0)');
        this.ctx.fillStyle = coreGrad;
        this.ctx.beginPath();
        this.ctx.arc(vX, vY, 50, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (this.currentMode === 'synthwave_grid') {
        // Render 3D Perspective Neon Horizon Grid & Synthwave Stardust
        const horizonY = this.height * 0.60;
        const vanishX = this.width / 2;

        // 1. Soft Horizon Glow
        const horizonGrad = this.ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 25);
        horizonGrad.addColorStop(0, 'rgba(255, 42, 133, 0)');
        horizonGrad.addColorStop(0.5, 'rgba(255, 42, 133, 0.055)');
        horizonGrad.addColorStop(1, 'rgba(0, 240, 255, 0.025)');
        this.ctx.fillStyle = horizonGrad;
        this.ctx.fillRect(0, horizonY - 40, this.width, 65);

        // 2. Perspective Longitudinal Grid Lines
        this.ctx.lineWidth = 0.6;
        const numRadials = 16;
        for (let i = -numRadials; i <= numRadials; i++) {
          const bottomX = vanishX + (i * (this.width / numRadials) * 1.35);
          const lineAlpha = Math.max(0.02, 0.12 - (Math.abs(i) / numRadials) * 0.06);
          this.ctx.strokeStyle = `rgba(255, 42, 133, ${lineAlpha.toFixed(3)})`;
          this.ctx.beginPath();
          this.ctx.moveTo(vanishX, horizonY);
          this.ctx.lineTo(bottomX, this.height);
          this.ctx.stroke();
        }

        // 3. Perspective Transverse Moving Grid Lines
        this.synthGridOffset = (this.synthGridOffset || 0) + 0.0028;
        if (this.synthGridOffset > 1) this.synthGridOffset -= 1;

        const numHorizontals = 9;
        for (let i = 0; i < numHorizontals; i++) {
          const progress = (i + this.synthGridOffset) / numHorizontals;
          if (progress <= 0) continue;
          const y = horizonY + Math.pow(progress, 2.4) * (this.height - horizonY);
          const alpha = Math.pow(progress, 1.8) * 0.18;
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha.toFixed(3)})`;
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.width, y);
          this.ctx.stroke();
        }

        // 4. Floating Celestial Synthwave Stardust
        if (this.synthStars) {
          for (let i = 0; i < this.synthStars.length; i++) {
            const star = this.synthStars[i];
            star.y += star.vy;
            if (star.y < 0) star.y = horizonY;

            const pulse = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
            const alpha = Math.max(0.04, Math.min(0.40, star.baseAlpha + pulse * 0.12));

            this.ctx.fillStyle = star.color === '#FF2A85'
              ? `rgba(255, 42, 133, ${alpha.toFixed(3)})`
              : `rgba(0, 240, 255, ${alpha.toFixed(3)})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      } else if (this.currentMode === 'crt_raster') {
        // Render Cathode Ray Scanline Sweep & Analog Phosphor Shimmer
        this.crtBeamY += 0.70;
        if (this.crtBeamY > this.height + 60) {
          this.crtBeamY = -60;
        }

        // Horizontal Cathode Beam Scanline Sweep
        const beamGrad = this.ctx.createLinearGradient(0, this.crtBeamY - 35, 0, this.crtBeamY + 35);
        beamGrad.addColorStop(0, 'rgba(51, 255, 102, 0)');
        beamGrad.addColorStop(0.5, 'rgba(51, 255, 102, 0.038)');
        beamGrad.addColorStop(1, 'rgba(51, 255, 102, 0)');
        this.ctx.fillStyle = beamGrad;
        this.ctx.fillRect(0, this.crtBeamY - 35, this.width, 70);

        // Analog Phosphor Particles Shimmer
        if (this.crtPhosphorParticles) {
          for (let i = 0; i < this.crtPhosphorParticles.length; i++) {
            const p = this.crtPhosphorParticles[i];
            p.y += p.vy;
            if (p.y < 0) p.y = this.height;

            const pulse = Math.sin(time * p.flickerSpeed + p.flickerOffset);
            const alpha = Math.max(0.02, Math.min(0.24, p.baseAlpha + pulse * 0.06));

            this.ctx.fillStyle = `rgba(51, 255, 102, ${alpha.toFixed(3)})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      } else if (this.currentMode === 'dark_vortex') {
        // Render Interactive Synaptic Neural Vortex Swarm
        const cx = this.width / 2;
        const cy = this.height / 2;

        // Smooth mouse easing with gentle attraction
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.035;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.035;

        // Center of vortex subtly tracks cursor with low intensity
        const vortexCx = cx + (this.mouseX - cx) * 0.06;
        const vortexCy = cy + (this.mouseY - cy) * 0.06;

        const pts = this.vortexParticles;
        const len = pts ? pts.length : 0;

        // 1. Update particle positions
        for (let i = 0; i < len; i++) {
          const p = pts[i];

          // Ultra slow orbital angular velocity
          p.currentAngle += p.orbitSpeed;
          p.currentR += p.radialSpeed;
          if (p.currentR > p.maxR) {
            p.radialSpeed = -Math.abs(p.radialSpeed);
          } else if (p.currentR < p.minR) {
            p.radialSpeed = Math.abs(p.radialSpeed);
          }

          // Elliptical swirling vortex coordinate
          let targetX = vortexCx + Math.cos(p.currentAngle) * (p.currentR * 1.28);
          let targetY = vortexCy + Math.sin(p.currentAngle) * (p.currentR * 0.84);

          // Subtle interactive mouse deflection
          const dx = targetX - this.mouseX;
          const dy = targetY - this.mouseY;
          const distMouse = Math.hypot(dx, dy);
          if (distMouse < 140 && distMouse > 0) {
            const pushFactor = (1 - distMouse / 140) * 20;
            targetX += (dx / distMouse) * pushFactor;
            targetY += (dy / distMouse) * pushFactor;
          }

          p.x += (targetX - p.x) * 0.05;
          p.y += (targetY - p.y) * 0.05;
        }

        // 2. Draw subtle synaptic filaments between nearby nodes
        this.ctx.lineWidth = 0.5;
        const maxDist = 85;
        for (let i = 0; i < len; i++) {
          const p1 = pts[i];
          for (let j = i + 1; j < len; j++) {
            const p2 = pts[j];
            const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (d < maxDist) {
              const filamentAlpha = Math.pow(1 - d / maxDist, 1.8) * 0.14;
              this.ctx.strokeStyle = `rgba(255, 255, 255, ${filamentAlpha.toFixed(3)})`;
              this.ctx.beginPath();
              this.ctx.moveTo(p1.x, p1.y);
              this.ctx.lineTo(p2.x, p2.y);
              this.ctx.stroke();
            }
          }
        }

        // 3. Draw synaptic nodes with gentle pulsation
        for (let i = 0; i < len; i++) {
          const p = pts[i];
          const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset);
          const alpha = Math.max(0.06, Math.min(0.38, p.baseAlpha + pulse * 0.08));

          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else if (this.currentMode === 'dark_stars') {
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

              // Randomly ignite individual symbols into a soft, slow breathing glow cycle
              if (!cell.isGlowing && Math.random() < 0.00022) {
                cell.isGlowing = true;
                cell.glowProgress = 0;
                cell.glowSpeed = Math.random() * 0.0035 + 0.0018; // 50% slower, serene rise & fade
                cell.glowPeakAlpha = Math.random() * 0.14 + 0.18; // 50% less intensity
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
                  if (pulseFactor > 0.5) {
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
                  this.ctx.shadowColor = 'rgba(255, 255, 255, 0.20)';
                  this.ctx.shadowBlur = 2;
                } else {
                  this.ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha.toFixed(3)})`;
                  this.ctx.shadowColor = 'transparent';
                  this.ctx.shadowBlur = 0;
                }
              } else {
                if (isBrightGlow) {
                  this.ctx.fillStyle = `rgba(20, 20, 24, ${finalAlpha.toFixed(3)})`;
                  this.ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
                  this.ctx.shadowBlur = 1;
                } else {
                  this.ctx.fillStyle = `rgba(50, 50, 55, ${finalAlpha.toFixed(3)})`;
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