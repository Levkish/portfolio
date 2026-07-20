(() => {
  var Ce = Object.defineProperty;
  var Ge = (c, l, F) =>
    l in c
      ? Ce(c, l, { enumerable: !0, configurable: !0, writable: !0, value: F })
      : (c[l] = F);
  var A = (c, l, F) => Ge(c, typeof l != "symbol" ? l + "" : l, F);
  (() => {
    const c = document.getElementById("fluid-cursor");
    if (
      !c ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !matchMedia("(pointer:fine)").matches
    )
      return;
    const l = Object.freeze({
        simResolution: 128,
        dyeResolution: 1440,
        captureResolution: 512,
        densityDissipation: 3.5,
        velocityDissipation: 2,
        pressure: 0.1,
        pressureIterations: 20,
        curl: 3,
        splatRadius: 0.2,
        splatForce: 6e3,
        shading: !0,
        colorUpdateSpeed: 10,
        backColor: { r: 0.5, g: 0, b: 0 },
        transparent: !0,
      }),
      F = () => {},
      S = [
        {
          id: -1,
          texcoordX: 0,
          texcoordY: 0,
          prevTexcoordX: 0,
          prevTexcoordY: 0,
          deltaX: 0,
          deltaY: 0,
          down: !1,
          moved: !1,
          color: { r: 0, g: 0, b: 0 },
        },
      ],
      m = {
        SIM_RESOLUTION: l.simResolution,
        DYE_RESOLUTION: l.dyeResolution,
        CAPTURE_RESOLUTION: l.captureResolution,
        DENSITY_DISSIPATION: l.densityDissipation,
        VELOCITY_DISSIPATION: l.velocityDissipation,
        PRESSURE: l.pressure,
        PRESSURE_ITERATIONS: l.pressureIterations,
        CURL: l.curl,
        SPLAT_RADIUS: l.splatRadius,
        SPLAT_FORCE: l.splatForce,
        SHADING: l.shading,
        COLOR_UPDATE_SPEED: l.colorUpdateSpeed,
        PAUSED: !1,
        BACK_COLOR: l.backColor,
        TRANSPARENT: l.transparent,
      },
      { gl: r, ext: b } = ie(c);
    if (!r || !b) return;
    b.supportLinearFiltering || ((m.DYE_RESOLUTION = 256), (m.SHADING = !1));
    function ie(e) {
      const t = {
        alpha: !0,
        depth: !1,
        stencil: !1,
        antialias: !1,
        preserveDrawingBuffer: !1,
      };
      let i = e.getContext("webgl2", t);
      if (
        (i ||
          (i =
            e.getContext("webgl", t) || e.getContext("experimental-webgl", t)),
        !i)
      )
        throw new Error("Unable to initialize WebGL.");
      const o = "drawBuffers" in i;
      let n = !1,
        u = null;
      (o
        ? (i.getExtension("EXT_color_buffer_float"),
          (n = !!i.getExtension("OES_texture_float_linear")))
        : ((u = i.getExtension("OES_texture_half_float")),
          (n = !!i.getExtension("OES_texture_half_float_linear"))),
        i.clearColor(0, 0, 0, 1));
      const s = o ? i.HALF_FLOAT : (u && u.HALF_FLOAT_OES) || 0;
      let h, x, y;
      return (
        o
          ? ((h = L(i, i.RGBA16F, i.RGBA, s)),
            (x = L(i, i.RG16F, i.RG, s)),
            (y = L(i, i.R16F, i.RED, s)))
          : ((h = L(i, i.RGBA, i.RGBA, s)),
            (x = L(i, i.RGBA, i.RGBA, s)),
            (y = L(i, i.RGBA, i.RGBA, s))),
        {
          gl: i,
          ext: {
            formatRGBA: h,
            formatRG: x,
            formatR: y,
            halfFloatTexType: s,
            supportLinearFiltering: n,
          },
        }
      );
    }
    function L(e, t, i, o) {
      if (!oe(e, t, i, o)) {
        if ("drawBuffers" in e) {
          const n = e;
          switch (t) {
            case n.R16F:
              return L(n, n.RG16F, n.RG, o);
            case n.RG16F:
              return L(n, n.RGBA16F, n.RGBA, o);
            default:
              return null;
          }
        }
        return null;
      }
      return { internalFormat: t, format: i };
    }
    function oe(e, t, i, o) {
      const n = e.createTexture();
      if (!n) return !1;
      (e.bindTexture(e.TEXTURE_2D, n),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE),
        e.texImage2D(e.TEXTURE_2D, 0, t, 4, 4, 0, i, o, null));
      const u = e.createFramebuffer();
      return u
        ? (e.bindFramebuffer(e.FRAMEBUFFER, u),
          e.framebufferTexture2D(
            e.FRAMEBUFFER,
            e.COLOR_ATTACHMENT0,
            e.TEXTURE_2D,
            n,
            0,
          ),
          e.checkFramebufferStatus(e.FRAMEBUFFER) === e.FRAMEBUFFER_COMPLETE)
        : !1;
    }
    function ne(e) {
      if (!e.length) return 0;
      let t = 0;
      for (let i = 0; i < e.length; i++)
        ((t = (t << 5) - t + e.charCodeAt(i)), (t |= 0));
      return t;
    }
    function ue(e, t) {
      if (!t) return e;
      let i = "";
      for (const o of t)
        i += `#define ${o}
`;
      return i + e;
    }
    function p(e, t, i = null) {
      const o = ue(t, i),
        n = r.createShader(e);
      return n ? (r.shaderSource(n, o), r.compileShader(n), n) : null;
    }
    function K(e, t) {
      if (!e || !t) return null;
      const i = r.createProgram();
      return i
        ? (r.attachShader(i, e), r.attachShader(i, t), r.linkProgram(i), i)
        : null;
    }
    function q(e) {
      const t = {},
        i = r.getProgramParameter(e, r.ACTIVE_UNIFORMS);
      for (let o = 0; o < i; o++) {
        const n = r.getActiveUniform(e, o);
        n && (t[n.name] = r.getUniformLocation(e, n.name));
      }
      return t;
    }
    class D {
      constructor(t, i) {
        A(this, "program");
        A(this, "uniforms");
        ((this.program = K(t, i)),
          (this.uniforms = this.program ? q(this.program) : {}));
      }
      bind() {
        this.program && r.useProgram(this.program);
      }
    }
    class ae {
      constructor(t, i) {
        A(this, "vertexShader");
        A(this, "fragmentShaderSource");
        A(this, "programs");
        A(this, "activeProgram");
        A(this, "uniforms");
        ((this.vertexShader = t),
          (this.fragmentShaderSource = i),
          (this.programs = {}),
          (this.activeProgram = null),
          (this.uniforms = {}));
      }
      setKeywords(t) {
        let i = 0;
        for (const n of t) i += ne(n);
        let o = this.programs[i];
        if (o == null) {
          const n = p(r.FRAGMENT_SHADER, this.fragmentShaderSource, t);
          ((o = K(this.vertexShader, n)), (this.programs[i] = o));
        }
        o !== this.activeProgram &&
          (o && (this.uniforms = q(o)), (this.activeProgram = o));
      }
      bind() {
        this.activeProgram && r.useProgram(this.activeProgram);
      }
    }
    const E = p(
        r.VERTEX_SHADER,
        `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;
    
        void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `,
      ),
      se = p(
        r.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
    
        void main () {
          gl_FragColor = texture2D(uTexture, vUv);
        }
      `,
      ),
      ce = p(
        r.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;
    
        void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `,
      ),
      le = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform sampler2D uDithering;
        uniform vec2 ditherScale;
        uniform vec2 texelSize;
    
        vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
        }
    
        void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
            vec3 lc = texture2D(uTexture, vL).rgb;
            vec3 rc = texture2D(uTexture, vR).rgb;
            vec3 tc = texture2D(uTexture, vT).rgb;
            vec3 bc = texture2D(uTexture, vB).rgb;
    
            float dx = length(rc) - length(lc);
            float dy = length(tc) - length(bc);
    
            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);
    
            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            c *= diffuse;
          #endif
    
          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
        }
      `,
      fe = p(
        r.FRAGMENT_SHADER,
        `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
    
        void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
        }
      `,
      ),
      me = p(
        r.FRAGMENT_SHADER,
        `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
    
        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);
    
          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    
          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }
    
        void main () {
          #ifdef MANUAL_FILTERING
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            vec4 result = bilerp(uSource, coord, dyeTexelSize);
          #else
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            vec4 result = texture2D(uSource, coord);
          #endif
          float decay = 1.0 + dissipation * dt;
          gl_FragColor = result / decay;
        }
      `,
        b.supportLinearFiltering ? null : ["MANUAL_FILTERING"],
      ),
      ve = p(
        r.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
    
        void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;
    
          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }
    
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `,
      ),
      de = p(
        r.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
    
        void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `,
      ),
      he = p(
        r.FRAGMENT_SHADER,
        `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
    
        void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;
    
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;
    
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `,
      ),
      xe = p(
        r.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
    
        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float C = texture2D(uPressure, vUv).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `,
      ),
      Re = p(
        r.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
    
        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `,
      ),
      g = (() => {
        const e = r.createBuffer();
        (r.bindBuffer(r.ARRAY_BUFFER, e),
          r.bufferData(
            r.ARRAY_BUFFER,
            new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
            r.STATIC_DRAW,
          ));
        const t = r.createBuffer();
        return (
          r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, t),
          r.bufferData(
            r.ELEMENT_ARRAY_BUFFER,
            new Uint16Array([0, 1, 2, 0, 2, 3]),
            r.STATIC_DRAW,
          ),
          r.vertexAttribPointer(0, 2, r.FLOAT, !1, 0, 0),
          r.enableVertexAttribArray(0),
          (i, o = !1) => {
            r &&
              (i
                ? (r.viewport(0, 0, i.width, i.height),
                  r.bindFramebuffer(r.FRAMEBUFFER, i.fbo))
                : (r.viewport(
                    0,
                    0,
                    r.drawingBufferWidth,
                    r.drawingBufferHeight,
                  ),
                  r.bindFramebuffer(r.FRAMEBUFFER, null)),
              o && (r.clearColor(0, 0, 0, 1), r.clear(r.COLOR_BUFFER_BIT)),
              r.drawElements(r.TRIANGLES, 6, r.UNSIGNED_SHORT, 0));
          }
        );
      })();
    let R, a, M, Y, _;
    const W = new D(E, se),
      G = new D(E, ce),
      v = new D(E, fe),
      f = new D(E, me),
      O = new D(E, ve),
      z = new D(E, de),
      T = new D(E, he),
      w = new D(E, xe),
      U = new D(E, Re),
      B = new ae(E, le);
    function P(e, t, i, o, n, u) {
      r.activeTexture(r.TEXTURE0);
      const s = r.createTexture();
      (r.bindTexture(r.TEXTURE_2D, s),
        r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, u),
        r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, u),
        r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE),
        r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE),
        r.texImage2D(r.TEXTURE_2D, 0, i, e, t, 0, o, n, null));
      const h = r.createFramebuffer();
      (r.bindFramebuffer(r.FRAMEBUFFER, h),
        r.framebufferTexture2D(
          r.FRAMEBUFFER,
          r.COLOR_ATTACHMENT0,
          r.TEXTURE_2D,
          s,
          0,
        ),
        r.viewport(0, 0, e, t),
        r.clear(r.COLOR_BUFFER_BIT));
      const x = 1 / e,
        y = 1 / t;
      return {
        texture: s,
        fbo: h,
        width: e,
        height: t,
        texelSizeX: x,
        texelSizeY: y,
        attach(C) {
          return (
            r.activeTexture(r.TEXTURE0 + C),
            r.bindTexture(r.TEXTURE_2D, s),
            C
          );
        },
      };
    }
    function V(e, t, i, o, n, u) {
      const s = P(e, t, i, o, n, u),
        h = P(e, t, i, o, n, u);
      return {
        width: e,
        height: t,
        texelSizeX: s.texelSizeX,
        texelSizeY: s.texelSizeY,
        read: s,
        write: h,
        swap() {
          const x = this.read;
          ((this.read = this.write), (this.write = x));
        },
      };
    }
    function ge(e, t, i, o, n, u, s) {
      const h = P(t, i, o, n, u, s);
      return (
        W.bind(),
        W.uniforms.uTexture && r.uniform1i(W.uniforms.uTexture, e.attach(0)),
        g(h, !1),
        h
      );
    }
    function j(e, t, i, o, n, u, s) {
      return (
        (e.width === t && e.height === i) ||
          ((e.read = ge(e.read, t, i, o, n, u, s)),
          (e.write = P(t, i, o, n, u, s)),
          (e.width = t),
          (e.height = i),
          (e.texelSizeX = 1 / t),
          (e.texelSizeY = 1 / i)),
        e
      );
    }
    function X() {
      const e = J(m.SIM_RESOLUTION),
        t = J(m.DYE_RESOLUTION),
        i = b.halfFloatTexType,
        o = b.formatRGBA,
        n = b.formatRG,
        u = b.formatR,
        s = b.supportLinearFiltering ? r.LINEAR : r.NEAREST;
      (r.disable(r.BLEND),
        R
          ? (R = j(R, t.width, t.height, o.internalFormat, o.format, i, s))
          : (R = V(t.width, t.height, o.internalFormat, o.format, i, s)),
        a
          ? (a = j(a, e.width, e.height, n.internalFormat, n.format, i, s))
          : (a = V(e.width, e.height, n.internalFormat, n.format, i, s)),
        (M = P(e.width, e.height, u.internalFormat, u.format, i, r.NEAREST)),
        (Y = P(e.width, e.height, u.internalFormat, u.format, i, r.NEAREST)),
        (_ = V(e.width, e.height, u.internalFormat, u.format, i, r.NEAREST)));
    }
    function $() {
      const e = [];
      (m.SHADING && e.push("SHADING"), B.setKeywords(e));
    }
    function J(e) {
      const t = r.drawingBufferWidth,
        i = r.drawingBufferHeight,
        o = t / i,
        n = o < 1 ? 1 / o : o,
        u = Math.round(e),
        s = Math.round(e * n);
      return t > i ? { width: s, height: u } : { width: u, height: s };
    }
    function d(e) {
      const t = window.devicePixelRatio || 1;
      return Math.floor(e * t);
    }
    ($(), X());
    let Q = Date.now(),
      I = 0;
    function Z() {
      const e = pe();
      (Te() && X(), be(e), Ee(), Se(e), De(null), requestAnimationFrame(Z));
    }
    function pe() {
      const e = Date.now();
      let t = (e - Q) / 1e3;
      return ((t = Math.min(t, 0.016666)), (Q = e), t);
    }
    function Te() {
      const e = d(c.clientWidth),
        t = d(c.clientHeight);
      return c.width !== e || c.height !== t
        ? ((c.width = e), (c.height = t), !0)
        : !1;
    }
    function be(e) {
      ((I += e * m.COLOR_UPDATE_SPEED),
        I >= 1 &&
          ((I = Pe(I, 0, 1)),
          S.forEach((t) => {
            t.color = N();
          })));
    }
    function Ee() {
      for (const e of S) e.moved && ((e.moved = !1), Fe(e));
    }
    function Se(e) {
      (r.disable(r.BLEND),
        z.bind(),
        z.uniforms.texelSize &&
          r.uniform2f(z.uniforms.texelSize, a.texelSizeX, a.texelSizeY),
        z.uniforms.uVelocity &&
          r.uniform1i(z.uniforms.uVelocity, a.read.attach(0)),
        g(Y),
        T.bind(),
        T.uniforms.texelSize &&
          r.uniform2f(T.uniforms.texelSize, a.texelSizeX, a.texelSizeY),
        T.uniforms.uVelocity &&
          r.uniform1i(T.uniforms.uVelocity, a.read.attach(0)),
        T.uniforms.uCurl && r.uniform1i(T.uniforms.uCurl, Y.attach(1)),
        T.uniforms.curl && r.uniform1f(T.uniforms.curl, m.CURL),
        T.uniforms.dt && r.uniform1f(T.uniforms.dt, e),
        g(a.write),
        a.swap(),
        O.bind(),
        O.uniforms.texelSize &&
          r.uniform2f(O.uniforms.texelSize, a.texelSizeX, a.texelSizeY),
        O.uniforms.uVelocity &&
          r.uniform1i(O.uniforms.uVelocity, a.read.attach(0)),
        g(M),
        G.bind(),
        G.uniforms.uTexture &&
          r.uniform1i(G.uniforms.uTexture, _.read.attach(0)),
        G.uniforms.value && r.uniform1f(G.uniforms.value, m.PRESSURE),
        g(_.write),
        _.swap(),
        w.bind(),
        w.uniforms.texelSize &&
          r.uniform2f(w.uniforms.texelSize, a.texelSizeX, a.texelSizeY),
        w.uniforms.uDivergence &&
          r.uniform1i(w.uniforms.uDivergence, M.attach(0)));
      for (let i = 0; i < m.PRESSURE_ITERATIONS; i++)
        (w.uniforms.uPressure &&
          r.uniform1i(w.uniforms.uPressure, _.read.attach(1)),
          g(_.write),
          _.swap());
      (U.bind(),
        U.uniforms.texelSize &&
          r.uniform2f(U.uniforms.texelSize, a.texelSizeX, a.texelSizeY),
        U.uniforms.uPressure &&
          r.uniform1i(U.uniforms.uPressure, _.read.attach(0)),
        U.uniforms.uVelocity &&
          r.uniform1i(U.uniforms.uVelocity, a.read.attach(1)),
        g(a.write),
        a.swap(),
        f.bind(),
        f.uniforms.texelSize &&
          r.uniform2f(f.uniforms.texelSize, a.texelSizeX, a.texelSizeY),
        !b.supportLinearFiltering &&
          f.uniforms.dyeTexelSize &&
          r.uniform2f(f.uniforms.dyeTexelSize, a.texelSizeX, a.texelSizeY));
      const t = a.read.attach(0);
      (f.uniforms.uVelocity && r.uniform1i(f.uniforms.uVelocity, t),
        f.uniforms.uSource && r.uniform1i(f.uniforms.uSource, t),
        f.uniforms.dt && r.uniform1f(f.uniforms.dt, e),
        f.uniforms.dissipation &&
          r.uniform1f(f.uniforms.dissipation, m.VELOCITY_DISSIPATION),
        g(a.write),
        a.swap(),
        !b.supportLinearFiltering &&
          f.uniforms.dyeTexelSize &&
          r.uniform2f(f.uniforms.dyeTexelSize, R.texelSizeX, R.texelSizeY),
        f.uniforms.uVelocity &&
          r.uniform1i(f.uniforms.uVelocity, a.read.attach(0)),
        f.uniforms.uSource && r.uniform1i(f.uniforms.uSource, R.read.attach(1)),
        f.uniforms.dissipation &&
          r.uniform1f(f.uniforms.dissipation, m.DENSITY_DISSIPATION),
        g(R.write),
        R.swap());
    }
    function De(e) {
      (r.blendFunc(r.ONE, r.ONE_MINUS_SRC_ALPHA), r.enable(r.BLEND), ye(e));
    }
    function ye(e) {
      const t = e ? e.width : r.drawingBufferWidth,
        i = e ? e.height : r.drawingBufferHeight;
      (B.bind(),
        m.SHADING &&
          B.uniforms.texelSize &&
          r.uniform2f(B.uniforms.texelSize, 1 / t, 1 / i),
        B.uniforms.uTexture &&
          r.uniform1i(B.uniforms.uTexture, R.read.attach(0)),
        g(e, !1));
    }
    function Fe(e) {
      const t = e.deltaX * m.SPLAT_FORCE,
        i = e.deltaY * m.SPLAT_FORCE;
      ee(e.texcoordX, e.texcoordY, t, i, e.color);
    }
    function Le(e) {
      const t = N();
      ((t.r *= 10), (t.g *= 10), (t.b *= 10));
      const i = 10 * (Math.random() - 0.5),
        o = 30 * (Math.random() - 0.5);
      ee(e.texcoordX, e.texcoordY, i, o, t);
    }
    function ee(e, t, i, o, n) {
      (v.bind(),
        v.uniforms.uTarget && r.uniform1i(v.uniforms.uTarget, a.read.attach(0)),
        v.uniforms.aspectRatio &&
          r.uniform1f(v.uniforms.aspectRatio, c.width / c.height),
        v.uniforms.point && r.uniform2f(v.uniforms.point, e, t),
        v.uniforms.color && r.uniform3f(v.uniforms.color, i, o, 0),
        v.uniforms.radius &&
          r.uniform1f(v.uniforms.radius, _e(m.SPLAT_RADIUS / 100)),
        g(a.write),
        a.swap(),
        v.uniforms.uTarget && r.uniform1i(v.uniforms.uTarget, R.read.attach(0)),
        v.uniforms.color && r.uniform3f(v.uniforms.color, n.r, n.g, n.b),
        g(R.write),
        R.swap());
    }
    function _e(e) {
      const t = c.width / c.height;
      return (t > 1 && (e *= t), e);
    }
    function H(e, t, i, o) {
      ((e.id = t),
        (e.down = !0),
        (e.moved = !1),
        (e.texcoordX = i / c.width),
        (e.texcoordY = 1 - o / c.height),
        (e.prevTexcoordX = e.texcoordX),
        (e.prevTexcoordY = e.texcoordY),
        (e.deltaX = 0),
        (e.deltaY = 0),
        (e.color = N()));
    }
    function k(e, t, i, o) {
      ((e.prevTexcoordX = e.texcoordX),
        (e.prevTexcoordY = e.texcoordY),
        (e.texcoordX = t / c.width),
        (e.texcoordY = 1 - i / c.height),
        (e.deltaX = we(e.texcoordX - e.prevTexcoordX)),
        (e.deltaY = Ue(e.texcoordY - e.prevTexcoordY)),
        (e.moved = Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0),
        (e.color = o));
    }
    function Ae(e) {
      e.down = !1;
    }
    function we(e) {
      const t = c.width / c.height;
      return (t < 1 && (e *= t), e);
    }
    function Ue(e) {
      const t = c.width / c.height;
      return (t > 1 && (e /= t), e);
    }
    function N() {
      const e = Be(0.4 + Math.random() * 0.12, 0.72 + Math.random() * 0.24, 1);
      return ((e.r *= 0.1), (e.g *= 0.2), (e.b *= 0.16), e);
    }
    function Be(e, t, i) {
      let o = 0,
        n = 0,
        u = 0;
      const s = Math.floor(e * 6),
        h = e * 6 - s,
        x = i * (1 - t),
        y = i * (1 - h * t),
        C = i * (1 - (1 - h) * t);
      switch (s % 6) {
        case 0:
          ((o = i), (n = C), (u = x));
          break;
        case 1:
          ((o = y), (n = i), (u = x));
          break;
        case 2:
          ((o = x), (n = i), (u = C));
          break;
        case 3:
          ((o = x), (n = y), (u = i));
          break;
        case 4:
          ((o = C), (n = x), (u = i));
          break;
        case 5:
          ((o = i), (n = x), (u = y));
          break;
      }
      return { r: o, g: n, b: u };
    }
    function Pe(e, t, i) {
      const o = i - t;
      return o === 0 ? t : ((e - t) % o) + t;
    }
    window.addEventListener("mousedown", (e) => {
      const t = S[0],
        i = d(e.clientX),
        o = d(e.clientY);
      (H(t, -1, i, o), Le(t));
    });
    function re(e) {
      const t = S[0],
        i = d(e.clientX),
        o = d(e.clientY),
        n = N();
      (k(t, i, o, n), document.body.removeEventListener("mousemove", re));
    }
    (document.body.addEventListener("mousemove", re),
      window.addEventListener("mousemove", (e) => {
        const t = S[0],
          i = d(e.clientX),
          o = d(e.clientY),
          n = t.color;
        k(t, i, o, n);
      }));
    function te(e) {
      const t = e.targetTouches,
        i = S[0];
      for (let o = 0; o < t.length; o++) {
        const n = d(t[o].clientX),
          u = d(t[o].clientY);
        H(i, t[o].identifier, n, u);
      }
      document.body.removeEventListener("touchstart", te);
    }
    (document.body.addEventListener("touchstart", te),
      window.addEventListener(
        "touchstart",
        (e) => {
          const t = e.targetTouches,
            i = S[0];
          for (let o = 0; o < t.length; o++) {
            const n = d(t[o].clientX),
              u = d(t[o].clientY);
            H(i, t[o].identifier, n, u);
          }
        },
        !1,
      ),
      window.addEventListener(
        "touchmove",
        (e) => {
          const t = e.targetTouches,
            i = S[0];
          for (let o = 0; o < t.length; o++) {
            const n = d(t[o].clientX),
              u = d(t[o].clientY);
            k(i, n, u, i.color);
          }
        },
        !1,
      ),
      window.addEventListener("touchend", (e) => {
        const t = e.changedTouches,
          i = S[0];
        for (let o = 0; o < t.length; o++) Ae(i);
      }),
      F(
        () => l.simResolution,
        (e) => {
          ((m.SIM_RESOLUTION = e), X());
        },
      ),
      F(
        () => l.dyeResolution,
        (e) => {
          ((m.DYE_RESOLUTION = e), X());
        },
      ),
      F(
        () => l.shading,
        (e) => {
          ((m.SHADING = e), $());
        },
      ),
      Z());
  })();
})();
