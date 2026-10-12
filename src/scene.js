import * as THREE from 'three';

// Ashima 3D simplex noise (MIT)
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export function initScene(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.innerWidth < 760;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    canvas.style.background = 'radial-gradient(circle at 70% 40%, #2a1b5c 0%, #07080d 60%)';
    return { setEnergy() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x07080d, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07080d, 0.045);
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const uniforms = {
    uTime: { value: 0 },
    uEnergy: { value: 0 },
    uPixel: { value: renderer.getPixelRatio() },
    uFade: { value: 1 },
  };

  // Orb: point cloud on a noisy sphere
  const orb = new THREE.Group();
  scene.add(orb);
  const geo = new THREE.IcosahedronGeometry(1.9, small ? 40 : 64);
  const pointsMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uEnergy; uniform float uPixel; uniform float uFade;
      varying float vMix; varying float vAlpha;
      ${NOISE}
      void main(){
        vec3 p = position;
        float n = snoise(p * 0.75 + vec3(uTime * 0.18));
        float n2 = snoise(p * 2.4 - vec3(uTime * 0.35)) * 0.25;
        float d = (n + n2) * (0.2 + uEnergy * 0.5);
        p += normalize(position) * d;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.2 + uEnergy * 1.6) * uPixel * (7.0 / -mv.z);
        vMix = clamp(position.y * 0.3 + 0.5 + n * 0.3, 0.0, 1.0);
        vAlpha = (0.45 + n * 0.35 + uEnergy * 0.3) * uFade;
      }`,
    fragmentShader: /* glsl */ `
      varying float vMix; varying float vAlpha;
      void main(){
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, r);
        vec3 violet = vec3(0.62, 0.48, 1.0);
        vec3 cyan = vec3(0.13, 0.83, 0.93);
        gl_FragColor = vec4(mix(cyan, violet, vMix), soft * vAlpha);
      }`,
  });
  orb.add(new THREE.Points(geo, pointsMat));

  // Inner glow with fresnel rim
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 64, 64),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `
        uniform float uEnergy; uniform float uFade; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); vec3 c = mix(vec3(0.35,0.2,0.9), vec3(0.1,0.75,0.95), f); gl_FragColor = vec4(c, f * (0.55 + uEnergy * 0.6) * uFade); }`,
    }),
  );
  orb.add(core);

  // Orbit ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.006, 8, 220),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.35 }),
  );
  ring.rotation.set(1.2, 0.2, 0);
  orb.add(ring);

  // Starfield
  const starCount = small ? 900 : 2200;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 2] = -Math.random() * 40 + 4;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xbfc6e0, size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  scene.add(stars);

  // Interaction state
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollP = 0;
  let energy = 0, energyTarget = 0;
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  const onScroll = () => { scrollP = Math.min(window.scrollY / window.innerHeight, 3); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const layout = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', layout);

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); requestAnimationFrame(tick); }
  });

  let first = true;
  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    uniforms.uTime.value = reduced ? 0 : t;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    energy += (energyTarget - energy) * 0.08;
    uniforms.uEnergy.value = energy;

    const wide = window.innerWidth > 960;
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    const baseX = wide ? halfW * 0.5 : 0;
    const baseY = wide ? 0 : 2.05;
    // Hero: orb on the right. Scrolling: it drifts back and becomes ambient.
    const s = Math.min(scrollP, 1);
    // Past the hero the orb recedes to the edge and dims, unless the assistant is talking.
    const fadeTarget = Math.max(1 - s * 0.95, 0.1) + energy * 0.6;
    const k = first ? 1 : 1 - Math.exp(-dt * 4.5); // frame-rate independent easing
    uniforms.uFade.value += (Math.min(fadeTarget, 1) - uniforms.uFade.value) * k;
    ring.material.opacity = 0.35 * uniforms.uFade.value;
    const edgeX = wide ? halfW * 0.95 : halfW * 0.7;
    orb.position.x += ((baseX + (edgeX - baseX) * s) - orb.position.x) * k;
    orb.position.y += ((baseY + s * 0.6) - orb.position.y) * k;
    orb.position.z += ((-s * 3.5) - orb.position.z) * k;
    const scale = (wide ? 0.74 : 0.48) * (1 + energy * 0.12);
    orb.scale.setScalar(first ? scale : orb.scale.x + (scale - orb.scale.x) * Math.min(1, k * 2));

    if (!reduced) {
      orb.rotation.y += dt * (0.12 + energy * 0.6);
      orb.rotation.x += (mouse.y * 0.35 - orb.rotation.x) * 0.04;
      ring.rotation.z += dt * 0.15;
      stars.rotation.y = mouse.x * 0.04 + t * 0.006;
      stars.rotation.x = mouse.y * 0.03;
      stars.position.y = scrollP * 1.4;
    }
    camera.position.x += (mouse.x * 0.35 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 0.25 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    first = false;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    setEnergy(v) { energyTarget = Math.max(0, Math.min(1, v)); },
  };
}
