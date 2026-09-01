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

    const gl = glCanvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false }) || glCanvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return false;
    this.gl = gl;
    this.instancedExt = gl.getExtension('ANGLE_instanced_arrays');
    this.vao = gl.createVertexArray ? gl.createVertexArray() : null;

    const vsAeroShards = `#version 300 es
      precision highp float;

      uniform vec4 u_viewport;     // [aspect, shardWorldSize, renderScale, flowDistance]
      uniform vec4 u_shape;        // [spread, depth, turbulence, pointerShiftY]
      uniform vec4 u_effects;      // [spin, edgeSoftness, stretch, exposure]
      uniform vec4 u_composition;  // [right, left, center, full]
      uniform vec4 u_transport;    // [travelPhase, seamTaper, 0, 0]
      uniform vec4 u_formation;    // [stream, vortex, ribbon, 0]
      uniform vec4 u_gather;       // [pointerWorldX, pointerWorldY, holdAmount, holdPhase]
      uniform vec4 u_pointer;      // [pointerWorldX, pointerWorldY, radius, presence]
      uniform vec4 u_material;     // [roughness, materialKind, brightness, glow]
      uniform vec4 u_light;        // [lightX, lightY, lightZ, pointerShiftX]
      uniform vec4 u_environment;  // [lightSurface, 0, 0, 0]
      uniform vec4 u_baseColor;
      uniform vec4 u_highlightColor;
      uniform vec4 u_accentColor;

      flat out vec4 v_baseAlpha;
      flat out vec3 v_creaseColor;
      out vec2 v_localCoord;

      uint hashU32(uint value) {
        uint state = value * 747796405u + 2891336453u;
        uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
        return (word >> 22u) ^ word;
      }

      float unitFloat(uint value) {
        return float(hashU32(value)) * (1.0 / 4294967296.0);
      }

      vec3 safeNormalize(vec3 value) {
        return value / max(length(value), 0.0001);
      }

      vec2 safeNormalize2(vec2 value) {
        return value / max(length(value), 0.0001);
      }

      float cubic(float p0, float p1, float p2, float p3, float t) {
        float oneMinusT = 1.0 - t;
        return oneMinusT * oneMinusT * oneMinusT * p0
          + 3.0 * oneMinusT * oneMinusT * t * p1
          + 3.0 * oneMinusT * t * t * p2
          + t * t * t * p3;
      }

      float cubicDerivative(float p0, float p1, float p2, float p3, float t) {
        float oneMinusT = 1.0 - t;
        return 3.0 * oneMinusT * oneMinusT * (p1 - p0)
          + 6.0 * oneMinusT * t * (p2 - p1)
          + 3.0 * t * t * (p3 - p2);
      }

      float sideArc(float phase) {
        float lookup[32] = float[32](
          0.000000, 0.052475, 0.097829, 0.135121, 0.166845, 0.195164, 0.221458, 0.246639,
          0.271368, 0.296184, 0.321577, 0.348019, 0.375973, 0.405832, 0.437746, 0.471327,
          0.505474, 0.538781, 0.570323, 0.599945, 0.628000, 0.655048, 0.681734, 0.708795,
          0.737169, 0.768244, 0.804295, 0.848010, 0.894805, 0.935083, 0.969270, 1.000000
        );
        float scaled = clamp(phase, 0.0, 0.999999) * 31.0;
        int index = int(floor(scaled));
        if (index > 30) index = 30;
        return mix(lookup[index], lookup[index + 1], fract(scaled));
      }

      float centerArc(float phase) {
        float lookup[32] = float[32](
          0.000000, 0.028692, 0.059794, 0.096620, 0.140315, 0.179839, 0.212476, 0.241834,
          0.270282, 0.299332, 0.329968, 0.362347, 0.395341, 0.427241, 0.457283, 0.485900,
          0.514192, 0.543773, 0.577230, 0.618093, 0.661144, 0.696770, 0.727388, 0.756064,
          0.784657, 0.814415, 0.845979, 0.878880, 0.911508, 0.942489, 0.971712, 1.000000
        );
        float scaled = clamp(phase, 0.0, 0.999999) * 31.0;
        int index = int(floor(scaled));
        if (index > 30) index = 30;
        return mix(lookup[index], lookup[index + 1], fract(scaled));
      }

      float fullArc(float phase) {
        float lookup[32] = float[32](
          0.000000, 0.028092, 0.055939, 0.083892, 0.112291, 0.141449, 0.171637, 0.203033,
          0.235650, 0.269282, 0.303537, 0.337982, 0.372308, 0.406392, 0.440263, 0.474026,
          0.507794, 0.541636, 0.575553, 0.609470, 0.643257, 0.676761, 0.709855, 0.742465,
          0.774594, 0.806319, 0.837790, 0.869218, 0.900862, 0.933020, 0.965991, 1.000000
        );
        float scaled = clamp(phase, 0.0, 0.999999) * 31.0;
        int index = int(floor(scaled));
        if (index > 30) index = 30;
        return mix(lookup[index], lookup[index + 1], fract(scaled));
      }

      float mobileArc(float phase) {
        float lookup[32] = float[32](
          0.000000, 0.028885, 0.057970, 0.087431, 0.117400, 0.147935, 0.179017, 0.210560,
          0.242467, 0.274689, 0.307272, 0.340367, 0.374193, 0.408970, 0.444794, 0.481483,
          0.518517, 0.555206, 0.591030, 0.625807, 0.659633, 0.692728, 0.725311, 0.757533,
          0.789440, 0.820983, 0.852065, 0.882600, 0.912569, 0.942030, 0.971115, 1.000000
        );
        float scaled = clamp(phase, 0.0, 0.999999) * 31.0;
        int index = int(floor(scaled));
        if (index > 30) index = 30;
        return mix(lookup[index], lookup[index + 1], fract(scaled));
      }

      struct PathSample {
        vec3 position;
        vec3 tangent;
        float phase;
      };

      PathSample sidePath(float seedPhase, float distance, float aspect, float mirror) {
        const float pi = 3.14159265359;
        float pathLength = 2.65 + 0.61 * aspect + 0.09 * aspect * aspect;
        float phase = fract(seedPhase + distance / pathLength);
        float t = sideArc(phase);
        float x = cubic(1.24, 1.02, -0.28, 0.12, t) + sin(t * pi * 4.0 + 0.34) * 0.055;
        float y = cubic(1.38, 0.72, -0.56, -1.38, t) + sin(t * pi * 2.0 - 0.6) * 0.04;
        float z = sin(t * pi * 3.0) * 0.18;
        vec3 derivative = vec3(
          mirror * aspect * (
            cubicDerivative(1.24, 1.02, -0.28, 0.12, t)
              + cos(t * pi * 4.0 + 0.34) * pi * 4.0 * 0.055
          ),
          cubicDerivative(1.38, 0.72, -0.56, -1.38, t)
            + cos(t * pi * 2.0 - 0.6) * pi * 2.0 * 0.04,
          cos(t * pi * 3.0) * pi * 3.0 * 0.18
        );
        PathSample s;
        s.position = vec3(mirror * aspect * x, y, z);
        s.tangent = safeNormalize(derivative);
        s.phase = phase;
        return s;
      }

      PathSample centerPath(float seedPhase, float distance, float aspect) {
        const float pi = 3.14159265359;
        float pathLength = 2.3 + 2.0 * aspect + 0.35 * aspect * aspect;
        float phase = fract(seedPhase + distance / pathLength);
        float t = centerArc(phase);
        float angle = mix(-0.25 * pi, 1.75 * pi, t);
        float angleDerivative = 2.0 * pi;
        float radius = 0.72 + sin(t * pi * 4.0) * 0.12;
        float radiusDerivative = cos(t * pi * 4.0) * pi * 4.0 * 0.12;
        vec3 derivative = vec3(
          aspect * (
            -sin(angle) * angleDerivative * radius
              + cos(angle) * radiusDerivative
          ),
          cos(angle) * angleDerivative * radius
            + sin(angle) * radiusDerivative,
          cos(t * pi * 2.0) * pi * 2.0 * 0.16
        );
        PathSample s;
        s.position = vec3(
          cos(angle) * radius * aspect,
          sin(angle) * radius,
          sin(t * pi * 2.0) * 0.16
        );
        s.tangent = safeNormalize(derivative);
        s.phase = phase;
        return s;
      }

      PathSample fullPath(float seedPhase, float distance, float aspect) {
        const float pi = 3.14159265359;
        float pathWidth = 2.44 * aspect;
        float pathLength = sqrt(pathWidth * pathWidth + 5.0);
        float phase = fract(seedPhase + distance / pathLength);
        float t = fullArc(phase);
        vec3 derivative = vec3(
          aspect * 2.44,
          cos((t * 1.72 - 0.2) * pi) * 1.72 * pi * 0.54
            + cos(t * pi * 3.0) * pi * 3.0 * 0.12,
          -sin(t * pi * 2.0 - 0.7) * pi * 2.0 * 0.22
        );
        PathSample s;
        s.position = vec3(
          mix(-aspect * 1.22, aspect * 1.22, t),
          sin((t * 1.72 - 0.2) * pi) * 0.54 + sin(t * pi * 3.0) * 0.12,
          cos(t * pi * 2.0 - 0.7) * 0.22
        );
        s.tangent = safeNormalize(derivative);
        s.phase = phase;
        return s;
      }

      PathSample mobilePath(float seedPhase, float distance, float aspect) {
        const float pi = 3.14159265359;
        float pathWidth = 2.56 * aspect;
        float pathLength = sqrt(pathWidth * pathWidth + 1.0);
        float phase = fract(seedPhase + distance / pathLength);
        float t = mobileArc(phase);
        vec3 derivative = vec3(
          aspect * 2.56,
          cos(t * pi) * pi * 0.28 + cos(t * pi * 3.0) * pi * 3.0 * 0.06,
          -sin(t * pi * 2.0) * pi * 2.0 * 0.16
        );
        PathSample s;
        s.position = vec3(
          mix(-aspect * 1.28, aspect * 1.28, t),
          -0.86 + sin(t * pi) * 0.28 + sin(t * pi * 3.0) * 0.06,
          cos(t * pi * 2.0) * 0.16
        );
        s.tangent = safeNormalize(derivative);
        s.phase = phase;
        return s;
      }

      PathSample weightedPath(float seedPhase, float phaseOffset, float aspect, vec4 weights) {
        float phase = fract(seedPhase + phaseOffset);
        PathSample result;
        result.position = vec3(0.0);
        result.tangent = vec3(0.0);
        result.phase = phase;

        if (aspect < 0.82) {
          float compactWeight = weights.x + weights.y + weights.z;
          if (compactWeight > 0.0001) {
            PathSample compact = mobilePath(phase, 0.0, aspect);
            result.position += compact.position * compactWeight;
            result.tangent += compact.tangent * compactWeight;
          }
          if (weights.w > 0.0001) {
            PathSample wide = fullPath(phase, 0.0, aspect);
            result.position += wide.position * weights.w;
            result.tangent += wide.tangent * weights.w;
          }
        } else {
          if (weights.x > 0.0001) {
            PathSample right = sidePath(phase, 0.0, aspect, 1.0);
            result.position += right.position * weights.x;
            result.tangent += right.tangent * weights.x;
          }
          if (weights.y > 0.0001) {
            PathSample left = sidePath(phase, 0.0, aspect, -1.0);
            result.position += left.position * weights.y;
            result.tangent += left.tangent * weights.y;
          }
          if (weights.z > 0.0001) {
            PathSample center = centerPath(phase, 0.0, aspect);
            result.position += center.position * weights.z;
            result.tangent += center.tangent * weights.z;
          }
          if (weights.w > 0.0001) {
            PathSample wide = fullPath(phase, 0.0, aspect);
            result.position += wide.position * weights.w;
            result.tangent += wide.tangent * weights.w;
          }
        }

        result.tangent = safeNormalize(result.tangent + vec3(0.0001, 0.0, 0.0));
        return result;
      }

      vec2 pointerField(vec2 delta, float radius, vec2 flow, float depth) {
        vec2 offset = delta / max(radius, 0.001);
        float along = dot(offset, flow);
        float across = dot(offset, vec2(-flow.y, flow.x));
        float alongSquared = along * along;
        float layer = depth * inversesqrt(1.0 + depth * depth);
        float bend = (0.22 * alongSquared + 0.12 * layer * along) / (1.0 + alongSquared);
        float curvedAcross = (across + bend) / (1.0 + layer * 0.18);
        float falloff = exp(-0.28 * alongSquared - 1.2 * curvedAcross * curvedAcross);
        return offset * falloff;
      }

      vec3 shardVertex(uint index) {
        const float fold = 0.34;
        vec3 vertices[6] = vec3[6](
          vec3(0.0, 1.0, fold),
          vec3(-0.72, 0.0, 0.0),
          vec3(0.0, -1.0, fold),
          vec3(0.0, 1.0, fold),
          vec3(0.0, -1.0, fold),
          vec3(0.72, 0.0, 0.0)
        );
        return vertices[index % 6u];
      }

      float softbox(vec3 direction, vec2 center, vec2 size) {
        vec2 q = abs((direction.xy - center) / size);
        vec2 q2 = q * q;
        vec2 q4 = q2 * q2;
        return exp(-(q4.x + q4.y));
      }

      vec3 aces(vec3 color) {
        const float a = 2.51;
        const float b = 0.03;
        const float c = 2.43;
        const float d = 0.59;
        const float e = 0.14;
        return clamp((color * (a * color + b)) / (color * (c * color + d) + e), vec3(0.0), vec3(1.0));
      }

      void main() {
        uint vertexIndex = uint(gl_VertexID);
        uint instanceIndex = uint(gl_InstanceID);

        float seedPhase = unitFloat(instanceIndex * 1664525u + 1013904223u);
        float seedLane = unitFloat(instanceIndex * 2246822519u + 3266489917u);
        float seedDepth = unitFloat(instanceIndex * 668265263u + 374761393u);
        float seedScale = unitFloat(instanceIndex * 1597334677u + 3812015801u);

        float aspect = u_viewport.x;
        PathSample path = weightedPath(seedPhase, u_transport.x, aspect, u_composition);
        vec3 direction = path.tangent;
        vec2 planarNormal = safeNormalize2(vec2(-direction.y, direction.x));

        float signedLane = seedLane * 2.0 - 1.0;
        float lane = sign(signedLane) * pow(abs(signedLane), 0.72);
        float widthProfile = 0.46 + pow(max(sin(path.phase * 3.14159265359), 0.0), 0.72) * 0.54;
        float looseSeed = unitFloat(instanceIndex * 3266489917u + 668265263u);
        float loose = smoothstep(0.92, 1.0, looseSeed);
        float flowWave = sin(path.phase * 37.6991118431 + seedDepth * 12.0);
        float laneWidth = (lane * 0.56 + flowWave * 0.055 * u_shape.z) * u_shape.x
          * widthProfile * (1.0 + loose * 0.72);
        float depthLane = (seedDepth * 2.0 - 1.0) * u_shape.y
          + cos(path.phase * 31.4159265359 + seedLane * 8.0) * 0.06 * u_shape.z;
        vec3 renderPosition = path.position + vec3(planarNormal * laneWidth, depthLane);

        if (u_formation.y + u_formation.z > 0.00001) {
          vec2 center = vec2((u_composition.x - u_composition.y) * aspect * 0.56, 0.0);
          vec3 formedPosition = renderPosition * u_formation.x;
          vec3 formedDirection = direction * u_formation.x;
          if (u_formation.y > 0.00001) {
            float radius = 0.16 + sqrt(seedLane) * 0.74 * (0.45 + u_shape.x * 0.55);
            float angle = seedPhase * 6.28318530718 + u_viewport.w / radius;
            vec2 radial = vec2(cos(angle), sin(angle));
            vec3 pos = vec3(center + radial * radius, (seedDepth - 0.5) * u_shape.y * 0.65 + radial.y * 0.2);
            formedPosition += pos * u_formation.y;
            formedDirection += safeNormalize(vec3(-radial.y, radial.x, radial.x * 0.2)) * u_formation.y;
          }
          if (u_formation.z > 0.00001) {
            float phase = fract(seedPhase + u_viewport.w / (aspect * 3.0 + 2.0));
            float angle = phase * 6.28318530718;
            float ribbonWidth = (seedLane - 0.5) * 0.54 * u_shape.x;
            vec3 pos = vec3(
              mix(-aspect * 1.35, aspect * 1.35, phase) + center.x * 0.5,
              sin(angle) * 0.42 + cos(angle * 2.0) * ribbonWidth,
              (cos(angle) * 0.35 + sin(angle * 2.0) * ribbonWidth + (seedDepth - 0.5) * 0.12) * u_shape.y
            );
            vec3 tangent = safeNormalize(vec3(aspect * 2.7, cos(angle) * 2.638938, -sin(angle) * 2.199115 * u_shape.y));
            formedPosition += pos * u_formation.z;
            formedDirection += tangent * u_formation.z;
          }
          renderPosition = formedPosition;
          direction = safeNormalize(formedDirection + vec3(0.0, 0.0, 0.02 * u_formation.x * (1.0 - u_formation.x)));
          planarNormal = safeNormalize2(vec2(-direction.y, direction.x));
        }

        if (abs(u_pointer.w) > 0.0001) {
          vec2 field = pointerField(
            u_pointer.xy - renderPosition.xy,
            u_pointer.z,
            vec2(planarNormal.y, -planarNormal.x),
            renderPosition.z
          );
          vec2 lateral = field - direction.xy * dot(field, direction.xy);
          renderPosition += vec3(lateral * u_pointer.w * 0.36, 0.0);
          direction = safeNormalize(vec3(direction.xy + lateral * u_pointer.w * 0.65, direction.z));
        }

        vec3 shapeLocal = shardVertex(vertexIndex);
        vec3 local = shapeLocal;
        local.x *= mix(0.72, 1.08, seedLane);
        local.y *= mix(0.82, 1.12, seedDepth);
        local.x += (seedDepth - 0.5) * (1.0 - abs(local.y)) * 0.16;

        vec3 side = cross(vec3(0.0, 0.0, 1.0), direction);
        float sideLengthSquared = dot(side, side);
        if (sideLengthSquared > 0.0001) {
          side *= inversesqrt(sideLengthSquared);
        } else {
          side = vec3(1.0, 0.0, 0.0);
        }
        vec3 facing = cross(direction, side);
        float rollDirection = mix(-1.5, 1.7, seedDepth);
        float roll = seedLane * 6.28318530718 + u_viewport.w * rollDirection * u_effects.x * 2.4;
        float rollSin = sin(roll);
        float rollCos = cos(roll);
        vec3 bankedSide = side * rollCos + facing * rollSin;
        vec3 bankedFacing = facing * rollCos - side * rollSin;
        float depthScale = mix(0.56, 1.58, clamp(renderPosition.z * 0.62 + 0.5, 0.0, 1.0));
        float scaleShape = 0.46 + seedScale * 0.58 + pow(seedScale, 12.0) * 1.55;
        float size = u_viewport.y * scaleShape * depthScale * (1.0 - u_gather.z * 0.3);
        float width = size * 0.72;
        float lengthScale = size * 1.26 * u_effects.z;
        vec3 world = renderPosition
          + direction * local.y * lengthScale
          + bankedSide * local.x * width
          + bankedFacing * local.z * width;

        float perspective = 1.0 / max(0.62, 1.0 - world.z * 0.34);
        vec2 ndc = world.xy * u_viewport.z / vec2(aspect, 1.0) * perspective;
        float depth = clamp(0.56 - world.z * 0.24, 0.03, 0.97);
        uint triangle = vertexIndex / 3u;

        float facetSide = (triangle == 1u) ? 1.0 : -1.0;
        vec3 localNormal = vec3(facetSide * 0.394903, 0.0, 0.918723);
        vec3 normal = bankedSide * localNormal.x + bankedFacing * localNormal.z;
        vec3 viewDirection = normalize(vec3(-renderPosition.xy * 0.08, 1.0));
        vec2 pointerShift = vec2(u_light.w, u_shape.w);
        vec3 keyDirection = u_light.xyz;
        vec3 halfDirection = normalize(keyDirection + viewDirection);
        float roughness = clamp(u_material.x, 0.04, 0.96);
        float materialKind = u_material.y;
        float glow = u_material.w;
        vec3 reflection = reflect(-viewDirection, normal);
        float broad = softbox(
          reflection,
          vec2(-0.34, 0.28) + pointerShift * 0.36,
          vec2(0.52, 0.22) + roughness * 0.3
        );
        float strip = softbox(
          reflection,
          vec2(0.48, -0.08) - pointerShift * 0.2,
          vec2(0.12, 0.72)
        );
        float diffuse = max(dot(normal, keyDirection), 0.0);
        float specularPower = mix(92.0, 9.0, roughness);
        float specular = pow(max(dot(normal, halfDirection), 0.0), specularPower);
        float fresnelBase = 1.0 - max(dot(normal, viewDirection), 0.0);
        float fresnelSquared = fresnelBase * fresnelBase;
        float fresnel = fresnelSquared * fresnelSquared;
        float facet = mix(0.76, 1.0, smoothstep(-0.08, 0.08, normal.x));
        float depthFog = smoothstep(-0.68, 0.58, renderPosition.z);
        vec3 depthTint = mix(u_accentColor.rgb * 0.52, u_baseColor.rgb, depthFog);
        vec3 color = depthTint * (0.1 + diffuse * 0.3) * facet;
        color += u_highlightColor.rgb * (broad * mix(0.3, 0.86, 1.0 - roughness)) * (1.0 + glow * 0.14);
        color += u_accentColor.rgb * strip * (0.12 + fresnel * 0.42);
        color += u_highlightColor.rgb * specular * mix(0.82, 1.0, seedDepth);
        color += mix(u_baseColor.rgb, u_accentColor.rgb, seedLane) * fresnel * (0.15 + glow * 0.16);
        color += u_accentColor.rgb * (broad * 0.045 + fresnel * 0.075) * glow;
        vec3 creaseCol = color + u_highlightColor.rgb * (0.08 + specular * 0.22);

        float fill = (0.38 + diffuse * 0.12) * facet * u_environment.x;
        color += mix(u_accentColor.rgb, u_baseColor.rgb, depthFog) * fill;
        creaseCol += mix(u_accentColor.rgb, u_baseColor.rgb, depthFog) * fill;

        float fog = mix(0.42, 1.0, depthFog);
        float exposure = fog * u_material.z * u_effects.w * 0.78;
        vec3 mapped = aces(color * exposure);
        vec3 mappedCrease = aces(creaseCol * exposure);
        float shardAlpha = mix(0.40, 0.85, depthFog);
        float seam = smoothstep(0.0, 0.035, path.phase) * (1.0 - smoothstep(0.965, 1.0, path.phase));
        shardAlpha *= mix(1.0, seam, u_transport.y * u_formation.x * (1.0 - u_gather.z));

        gl_Position = vec4(ndc, depth, 1.0);
        v_baseAlpha = vec4(mapped, shardAlpha);
        v_creaseColor = mappedCrease - mapped;
        v_localCoord = shapeLocal.xy;
      }
    `;

    const fsAeroShards = `#version 300 es
      precision highp float;

      uniform vec4 u_effects; // [spin, edgeSoftness, stretch, exposure]

      flat in vec4 v_baseAlpha;
      flat in vec3 v_creaseColor;
      in vec2 v_localCoord;

      out vec4 fragColor;

      void main() {
        float crease = (1.0 - smoothstep(0.015, 0.11, abs(v_localCoord.x)))
          * (1.0 - smoothstep(0.78, 1.0, abs(v_localCoord.y)));
        float coverage = 1.0;
        if (u_effects.y > 0.001) {
          float diamondDistance = 1.0 - abs(v_localCoord.y) - abs(v_localCoord.x) / 0.72;
          float edgeWidth = max(fwidth(diamondDistance) * u_effects.y, 0.0001);
          coverage = smoothstep(0.0, edgeWidth, diamondDistance);
        }
        vec3 mapped = v_baseAlpha.rgb + v_creaseColor * crease;
        float coveredAlpha = v_baseAlpha.a * coverage * 0.46;
        fragColor = vec4(mapped * coveredAlpha, coveredAlpha);
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

    const vs = createShader(gl.VERTEX_SHADER, vsAeroShards);
    const fs = createShader(gl.FRAGMENT_SHADER, fsAeroShards);
    if (!vs || !fs) return false;

    const saasProgram = gl.createProgram();
    gl.attachShader(saasProgram, vs);
    gl.attachShader(saasProgram, fs);
    gl.linkProgram(saasProgram);

    if (!gl.getProgramParameter(saasProgram, gl.LINK_STATUS)) {
      console.error('SaaS AeroShards Program link error:', gl.getProgramInfoLog(saasProgram));
      return false;
    }

    this.saasShader = {
      program: saasProgram,
      u_viewport: gl.getUniformLocation(saasProgram, 'u_viewport'),
      u_shape: gl.getUniformLocation(saasProgram, 'u_shape'),
      u_effects: gl.getUniformLocation(saasProgram, 'u_effects'),
      u_composition: gl.getUniformLocation(saasProgram, 'u_composition'),
      u_transport: gl.getUniformLocation(saasProgram, 'u_transport'),
      u_formation: gl.getUniformLocation(saasProgram, 'u_formation'),
      u_gather: gl.getUniformLocation(saasProgram, 'u_gather'),
      u_pointer: gl.getUniformLocation(saasProgram, 'u_pointer'),
      u_material: gl.getUniformLocation(saasProgram, 'u_material'),
      u_light: gl.getUniformLocation(saasProgram, 'u_light'),
      u_environment: gl.getUniformLocation(saasProgram, 'u_environment'),
      u_baseColor: gl.getUniformLocation(saasProgram, 'u_baseColor'),
      u_highlightColor: gl.getUniformLocation(saasProgram, 'u_highlightColor'),
      u_accentColor: gl.getUniformLocation(saasProgram, 'u_accentColor'),
      instanceCount: 3200
    };

    // Compile Dark Mode Celestial Aurora SideRays Shader Program
    const auroraFsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
        vec2 sourceToCoord = coord - raySource;
        float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
        return clamp(
          (0.42 + 0.16 * sin(cosAngle * seedA + u_time * speed)) +
          (0.28 + 0.18 * cos(-cosAngle * seedB + u_time * speed)),
          0.0, 1.0) *
          clamp((u_resolution.x - length(sourceToCoord)) / u_resolution.x, 0.45, 1.0);
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 coord = vec2(fragCoord.x, u_resolution.y - fragCoord.y);
        vec2 rayPos = vec2(u_resolution.x * 0.98, -0.15 * u_resolution.y);

        vec2 rel = coord - rayPos;
        vec2 tiltedCoord = rel + rayPos;

        float halfSpread = 1.35 * 0.275;
        vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
        vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

        vec3 rayColor1 = vec3(0.95, 0.72, 0.12); // #EAB308 Celestial Warm Amber
        vec3 rayColor2 = vec3(0.48, 0.75, 1.0);  // #96C8FF Luminous Sky Blue

        vec4 rays1 = vec4(rayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, 1.0);
        vec4 rays2 = vec4(rayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, 0.30);

        vec4 color = rays1 * 0.32 + rays2 * 0.68;

        float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, u_resolution.y - rayPos.y)) / u_resolution.y;
        float brightness = 0.78 / pow(max(distanceToLight, 0.001), 1.12);
        color.rgb *= brightness;

        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(gray), color.rgb, 1.35);

        float vig = 1.0 - smoothstep(0.35, 1.55, length(coord / u_resolution.xy - 0.5) * 1.35);
        color.rgb *= vig * 0.48;

        gl_FragColor = vec4(color.rgb, clamp(length(color.rgb) * 1.25, 0.0, 1.0));
      }
    `;

    const auroraFs = createShader(gl.FRAGMENT_SHADER, auroraFsSource);
    if (auroraFs) {
      const auroraProgram = gl.createProgram();
      gl.attachShader(auroraProgram, vs);
      gl.attachShader(auroraProgram, auroraFs);
      gl.linkProgram(auroraProgram);
      if (gl.getProgramParameter(auroraProgram, gl.LINK_STATUS)) {
        this.auroraShader = {
          program: auroraProgram,
          pos: gl.getAttribLocation(auroraProgram, 'position'),
          res: gl.getUniformLocation(auroraProgram, 'u_resolution'),
          time: gl.getUniformLocation(auroraProgram, 'u_time')
        };
      }
    }

    // Compile Dark Mode Pixel Snow Shader Program
    const snowFsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);
      const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);
      const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);

      float hash31(vec3 p) {
        p = fract(p * vec3(443.8975, 397.2973, 491.1871));
        p += dot(p, p.yzx + 19.19);
        return fract((p.x + p.y) * p.z);
      }

      vec3 hash33(vec3 p) {
        p = fract(p * vec3(443.8975, 397.2973, 491.1871));
        p += dot(p, p.yzx + 19.19);
        return fract((p.xxy + p.yxx) * p.zyx);
      }

      void main() {
        float uPixelResolution = 360.0;
        float uFlakeSize = 0.006;
        float uMinFlakeSize = 0.65;
        float uSpeed = 1.05;
        float uDepthFade = 11.0;
        float uFarPlane = 18.0;
        float uDensity = 0.26;
        vec3 uColor = vec3(0.85, 0.92, 1.0);

        float pixelSize = max(1.0, floor(0.5 + u_resolution.x / uPixelResolution));
        float invPixelSize = 1.0 / pixelSize;
        
        vec2 fragCoord = floor(gl_FragCoord.xy * invPixelSize);
        vec2 res = u_resolution * invPixelSize;
        float invResX = 1.0 / res.x;

        vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));
        ray = ray.x * camI + ray.y * camJ + ray.z * camK;

        float timeSpeed = u_time * uSpeed;
        float windX = cos(2.18) * 0.4;
        float windY = sin(2.18) * 0.4;
        vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * timeSpeed;
        vec3 pos = camPos;

        vec3 absRay = max(abs(ray), vec3(0.001));
        vec3 strides = 1.0 / absRay;
        vec3 raySign = step(ray, vec3(0.0));
        vec3 phase = fract(pos) * strides;
        phase = mix(strides - phase, phase, raySign);

        float rayDotCamK = dot(ray, camK);
        float invRayDotCamK = 1.0 / rayDotCamK;
        float invDepthFade = 1.0 / uDepthFade;
        float halfInvResX = 0.5 * invResX;
        vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);

        float t = 0.0;
        for (int i = 0; i < 96; i++) {
          if (t >= uFarPlane) break;
          
          vec3 fpos = floor(pos);
          float cellHash = hash31(fpos);

          if (cellHash < uDensity) {
            vec3 h = hash33(fpos);
            
            vec3 sinArg1 = fpos.yzx * 0.073;
            vec3 sinArg2 = fpos.zxy * 0.27;
            vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(sinArg1) + 4.0 * sin(sinArg2) + 2.0 * h + timeAnim);
            flakePos = flakePos * 0.8 + 0.1 + fpos;

            float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;
            
            if (toIntersection > 0.0) {
              vec3 testPos = pos + ray * toIntersection - flakePos;
              float testX = dot(testPos, camI);
              float testY = dot(testPos, camJ);
              vec2 testUV = abs(vec2(testX, testY));
              
              float depth = dot(flakePos - camPos, camK);
              float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);
              float dist = max(testUV.x, testUV.y);

              if (dist < flakeSize) {
                float flakeSizeRatio = uFlakeSize / flakeSize;
                float intensity = exp2(-(t + toIntersection) * invDepthFade) *
                                 min(1.0, flakeSizeRatio * flakeSizeRatio) * 0.85;
                gl_FragColor = vec4(uColor * pow(intensity, 0.5), clamp(intensity * 1.1, 0.0, 1.0));
                return;
              }
            }
          }

          float nextStep = min(min(phase.x, phase.y), phase.z);
          vec3 sel = step(phase, vec3(nextStep));
          phase = phase - nextStep + strides * sel;
          t += nextStep;
          pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel);
        }

        gl_FragColor = vec4(0.0);
      }
    `;

    const snowFs = createShader(gl.FRAGMENT_SHADER, snowFsSource);
    if (snowFs) {
      const snowProgram = gl.createProgram();
      gl.attachShader(snowProgram, vs);
      gl.attachShader(snowProgram, snowFs);
      gl.linkProgram(snowProgram);
      if (gl.getProgramParameter(snowProgram, gl.LINK_STATUS)) {
        this.snowShader = {
          program: snowProgram,
          pos: gl.getAttribLocation(snowProgram, 'position'),
          res: gl.getUniformLocation(snowProgram, 'u_resolution'),
          time: gl.getUniformLocation(snowProgram, 'u_time')
        };
      }
    }

    // Compile CRT FaultyTerminal Shader Program
    const crtFsSource = `
      precision mediump float;

      uniform float iTime;
      uniform vec3  iResolution;
      uniform float uScale;

      uniform vec2  uGridMul;
      uniform float uDigitSize;
      uniform float uScanlineIntensity;
      uniform float uGlitchAmount;
      uniform float uFlickerAmount;
      uniform float uNoiseAmp;
      uniform float uChromaticAberration;
      uniform float uDither;
      uniform float uCurvature;
      uniform vec3  uTint;
      uniform vec2  uMouse;
      uniform float uMouseStrength;
      uniform float uUseMouse;
      uniform float uPageLoadProgress;
      uniform float uUsePageLoadAnimation;
      uniform float uBrightness;
      uniform float uLightMode;

      float time;

      float hash21(vec2 p){
        p = fract(p * 234.56);
        p += dot(p, p + 34.56);
        return fract(p.x * p.y);
      }

      float noise(vec2 p)
      {
        return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2; 
      }

      mat2 rotate(float angle)
      {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
      }

      float fbm(vec2 p)
      {
        p *= 1.1;
        float f = 0.0;
        float amp = 0.5 * uNoiseAmp;
        
        mat2 modify0 = rotate(time * 0.02);
        f += amp * noise(p);
        p = modify0 * p * 2.0;
        amp *= 0.454545;
        
        mat2 modify1 = rotate(time * 0.02);
        f += amp * noise(p);
        p = modify1 * p * 2.0;
        amp *= 0.454545;
        
        mat2 modify2 = rotate(time * 0.08);
        f += amp * noise(p);
        
        return f;
      }

      float pattern(vec2 p, out vec2 q, out vec2 r) {
        vec2 offset1 = vec2(1.0);
        vec2 offset0 = vec2(0.0);
        mat2 rot01 = rotate(0.1 * time);
        mat2 rot1 = rotate(0.1);
        
        q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
        r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
        return fbm(p + r);
      }

      float digit(vec2 p){
          vec2 grid = uGridMul * 15.0;
          vec2 s = floor(p * grid) / grid;
          p = p * grid;
          vec2 q, r;
          float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;
          
          if(uUseMouse > 0.5){
              vec2 mouseWorld = uMouse * uScale;
              float distToMouse = distance(s, mouseWorld);
              float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
              intensity += mouseInfluence;
              
              float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
              intensity += ripple;
          }
          
          if(uUsePageLoadAnimation > 0.5){
              float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
              float cellDelay = cellRandom * 0.8;
              float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
              
              float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
              intensity *= fadeAlpha;
          }
          
          p = fract(p);
          p *= uDigitSize;
          
          float px5 = p.x * 5.0;
          float py5 = (1.0 - p.y) * 5.0;
          float x = fract(px5);
          float y = fract(py5);
          
          float i = floor(py5) - 2.0;
          float j = floor(px5) - 2.0;
          float n = i * i + j * j;
          float f = n * 0.0625;
          
          float isOn = step(0.1, intensity - f);
          float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);
          
          return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
      }

      float onOff(float a, float b, float c)
      {
        return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
      }

      float displace(vec2 look)
      {
          float y = look.y - mod(iTime * 0.25, 1.0);
          float window = 1.0 / (1.0 + 50.0 * y * y);
          return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
      }

      vec3 getColor(vec2 p){
          
          float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
          bar *= uScanlineIntensity;
          
          float displacement = displace(p);
          p.x += displacement;

          if (uGlitchAmount != 1.0) {
            float extra = displacement * (uGlitchAmount - 1.0);
            p.x += extra;
          }

          float middle = digit(p);
          
          const float off = 0.002;
          float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
                      digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
                      digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));
          
          vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
          return baseColor;
      }

      vec2 barrel(vec2 uv){
        vec2 c = uv * 2.0 - 1.0;
        float r2 = dot(c, c);
        c *= 1.0 + uCurvature * r2;
        return c * 0.5 + 0.5;
      }

      void main() {
          time = iTime * 0.333333;
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          uv.y = 1.0 - uv.y;

          if(uCurvature != 0.0){
            uv = barrel(uv);
          }
          
          vec2 p = uv * uScale;
          vec3 col = getColor(p);

          if(uChromaticAberration != 0.0){
            vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
            col.r = getColor(p + ca).r;
            col.b = getColor(p - ca).b;
          }

          col *= uTint;
          col *= uBrightness;

          if(uDither > 0.0){
            float rnd = hash21(gl_FragCoord.xy);
            col += (rnd - 0.5) * (uDither * 0.003922);
          }

          if (uLightMode > 0.5) {
            float energy = max(max(col.r, col.g), col.b);
            float coverage = clamp(smoothstep(0.0, 0.72, energy) * 0.9, 0.0, 0.9);
            vec3 ink = clamp(col * 0.42, 0.0, 0.76);
            col = mix(vec3(1.0), ink, coverage);
          }

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    const crtFs = createShader(gl.FRAGMENT_SHADER, crtFsSource);
    if (crtFs) {
      const crtProgram = gl.createProgram();
      gl.attachShader(crtProgram, vs);
      gl.attachShader(crtProgram, crtFs);
      gl.linkProgram(crtProgram);
      if (gl.getProgramParameter(crtProgram, gl.LINK_STATUS)) {
        this.crtShader = {
          program: crtProgram,
          pos: gl.getAttribLocation(crtProgram, 'position'),
          iTime: gl.getUniformLocation(crtProgram, 'iTime'),
          iResolution: gl.getUniformLocation(crtProgram, 'iResolution'),
          uScale: gl.getUniformLocation(crtProgram, 'uScale'),
          uGridMul: gl.getUniformLocation(crtProgram, 'uGridMul'),
          uDigitSize: gl.getUniformLocation(crtProgram, 'uDigitSize'),
          uScanlineIntensity: gl.getUniformLocation(crtProgram, 'uScanlineIntensity'),
          uGlitchAmount: gl.getUniformLocation(crtProgram, 'uGlitchAmount'),
          uFlickerAmount: gl.getUniformLocation(crtProgram, 'uFlickerAmount'),
          uNoiseAmp: gl.getUniformLocation(crtProgram, 'uNoiseAmp'),
          uChromaticAberration: gl.getUniformLocation(crtProgram, 'uChromaticAberration'),
          uDither: gl.getUniformLocation(crtProgram, 'uDither'),
          uCurvature: gl.getUniformLocation(crtProgram, 'uCurvature'),
          uTint: gl.getUniformLocation(crtProgram, 'uTint'),
          uMouse: gl.getUniformLocation(crtProgram, 'uMouse'),
          uMouseStrength: gl.getUniformLocation(crtProgram, 'uMouseStrength'),
          uUseMouse: gl.getUniformLocation(crtProgram, 'uUseMouse'),
          uPageLoadProgress: gl.getUniformLocation(crtProgram, 'uPageLoadProgress'),
          uUsePageLoadAnimation: gl.getUniformLocation(crtProgram, 'uUsePageLoadAnimation'),
          uBrightness: gl.getUniformLocation(crtProgram, 'uBrightness'),
          uLightMode: gl.getUniformLocation(crtProgram, 'uLightMode')
        };
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
    this.positionBuffer = positionBuffer;

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
        const darkStyle = (typeof appStore !== 'undefined' && appStore.state?.darkAmbientStyle) || localStorage.getItem('collab_dark_ambient') || 'aurora';
        if (darkStyle === 'aurora') targetMode = 'dark_aurora';
        else if (darkStyle === 'snow') targetMode = 'dark_snow';
        else if (darkStyle === 'stars') targetMode = 'dark_stars';
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
      if (this.gl && this.saasShader) {
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
    } else if (targetMode === 'dark_aurora') {
      if (this.gl && this.auroraShader && this.webglCanvas) {
        this.webglCanvas.style.display = 'block';
        this.webglCanvas.style.opacity = '1';
        if (this.canvas) this.canvas.style.display = 'none';
      }
      this.start();
    } else if (targetMode === 'dark_snow') {
      if (this.gl && this.snowShader && this.webglCanvas) {
        this.webglCanvas.style.display = 'block';
        this.webglCanvas.style.opacity = '1';
        if (this.canvas) this.canvas.style.display = 'none';
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
        if (this.gl && this.crtShader && this.webglCanvas) {
          this.webglCanvas.style.display = 'block';
          this.webglCanvas.style.opacity = '1';
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
        ctx.bezierCurveTo(s * 0.20, -s * 0.98, 0, s, 0, s);
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

      if (this.currentMode === 'saas_aurora' && this.gl && this.saasShader) {
        // --- GPU WebGL AeroShards Instanced 3D Diamond Shards Stream ---
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        const gl = this.gl;
        const s = this.saasShader;
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(s.program);

        if (this.vao) gl.bindVertexArray(this.vao);

        const aspect = this.width / Math.max(this.height, 1);
        const t = time * 0.001;
        const flowDistance = t * 0.12; // Slower, graceful motion
        const pathLength = aspect < 0.82 ? Math.hypot(2.56 * aspect, 1) : Math.hypot(2.44 * aspect, Math.sqrt(5));
        const travelPhase = (flowDistance / pathLength) % 1.0;

        const pointerNormX = (this.mouseX / this.width) * 2.0 - 1.0;
        const pointerNormY = 1.0 - (this.mouseY / this.height) * 2.0;

        gl.uniform4f(s.u_viewport, aspect, 0.012, 1.0, flowDistance);
        gl.uniform4f(s.u_shape, 1.45, 1.2, 0.42, 0.0); // Increased spread
        gl.uniform4f(s.u_effects, 1.0, 1.6, 1.0, 1.12);
        gl.uniform4f(s.u_composition, 0.0, 0.0, 0.0, 1.0); // full placement stream
        gl.uniform4f(s.u_transport, travelPhase, 0.0, 0.0, 0.0);
        gl.uniform4f(s.u_formation, 1.0, 0.0, 0.0, 0.0); // stream flow
        gl.uniform4f(s.u_gather, 0.0, 0.0, 0.0, 0.0);
        gl.uniform4f(s.u_pointer, pointerNormX * aspect, pointerNormY, 0.54, 0.25);
        gl.uniform4f(s.u_material, 0.46, 0.0, 0.92, 0.54); // pearl preset
        gl.uniform4f(s.u_light, -0.321, 0.49, 0.845, 0.0);
        gl.uniform4f(s.u_environment, 0.0, 0.0, 0.0, 0.0);

        // SaaS Theme: Brand Royal Indigo + Indigo Violet with Pure Crisp White Highlights
        gl.uniform4f(s.u_baseColor, 49 / 255, 94 / 255, 255 / 255, 1.0); // #315EFF Royal Indigo
        gl.uniform4f(s.u_highlightColor, 1.0, 1.0, 1.0, 1.0); // Crisp Pure White
        gl.uniform4f(s.u_accentColor, 99 / 255, 102 / 255, 241 / 255, 1.0); // #6366F1 Indigo Violet

        if (gl.drawArraysInstanced) {
          gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, s.instanceCount);
        } else if (this.instancedExt) {
          this.instancedExt.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, s.instanceCount);
        }

        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (this.currentMode === 'dark_aurora' && this.gl && this.auroraShader) {
        // --- GPU WebGL Celestial Aurora SideRays ---
        const gl = this.gl;
        const s = this.auroraShader;
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(s.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(s.pos);
        gl.vertexAttribPointer(s.pos, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(s.res, this.width, this.height);
        gl.uniform1f(s.time, time * 0.001);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (this.currentMode === 'dark_snow' && this.gl && this.snowShader) {
        // --- GPU WebGL Pixel Snow 3D Voxel Flakes ---
        const gl = this.gl;
        const s = this.snowShader;
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(s.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(s.pos);
        gl.vertexAttribPointer(s.pos, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(s.res, this.width, this.height);
        gl.uniform1f(s.time, time * 0.001);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      // If CRT mode, render FaultyTerminal WebGL Shader under 2D canvas
      if (this.currentMode === 'crt_raster' && this.gl && this.crtShader) {
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

        const gl = this.gl;
        const s = this.crtShader;
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(s.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(s.pos);
        gl.vertexAttribPointer(s.pos, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(s.iTime, time * 0.001);
        gl.uniform3f(s.iResolution, this.width, this.height, this.width / this.height);
        gl.uniform1f(s.uScale, 1.0);
        gl.uniform2f(s.uGridMul, 2.0, 1.0);
        gl.uniform1f(s.uDigitSize, 1.5);
        gl.uniform1f(s.uScanlineIntensity, 0.16);
        gl.uniform1f(s.uGlitchAmount, 0.0);
        gl.uniform1f(s.uFlickerAmount, 0.08);
        gl.uniform1f(s.uNoiseAmp, 0.60);
        gl.uniform1f(s.uChromaticAberration, 0.0);
        gl.uniform1f(s.uDither, 0.0);
        gl.uniform1f(s.uCurvature, 0.08);
        gl.uniform3f(s.uTint, 0.20, 1.0, 0.40); // Phosphor green #33FF66
        gl.uniform2f(s.uMouse, this.mouseX / this.width, 1.0 - (this.mouseY / this.height));
        gl.uniform1f(s.uMouseStrength, 0.08);
        gl.uniform1f(s.uUseMouse, 1.0);
        gl.uniform1f(s.uPageLoadProgress, 1.0);
        gl.uniform1f(s.uUsePageLoadAnimation, 0.0);
        gl.uniform1f(s.uBrightness, 0.24);
        gl.uniform1f(s.uLightMode, 0.0);

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