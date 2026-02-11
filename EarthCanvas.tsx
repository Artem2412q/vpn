"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ExitCountry } from "@/lib/countries";
import { RUSSIA_ANCHOR } from "@/lib/countries";
import type { PerfTier } from "@/hooks/usePerfTier";

/**
 * Тут — главная 3D сцена.
 * Править:
 * - подсветку “России” (RUSSIA_ANCHOR)
 * - список стран и координаты (src/lib/countries.ts)
 * - “настроение” при ON — см. globals.css (data-vpn="on")
 */

function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function latLonToVec3(lat: number, lon: number, radius: number) {
  // lat: -90..90, lon: -180..180
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function makeArc(from: THREE.Vector3, to: THREE.Vector3) {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.35);
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  return { curve, mid };
}

function EarthSurface({ vpnOn }: { vpnOn: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  const uniforms = useMemo(() => {
    const r = latLonToVec3(RUSSIA_ANCHOR.lat, RUSSIA_ANCHOR.lon, 1.0).normalize();
    return {
      uTime: { value: 0 },
      uRussia: { value: r },
      uOn: { value: vpnOn ? 1 : 0 }
    };
  }, [vpnOn]);

  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uOn.value = vpnOn ? 1 : 0;
  }, [vpnOn]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.06; // медленное вращение
    if (matRef.current) matRef.current.uniforms.uTime.value += dt;
  });

  // Процедурная “земля”: море/суша шумом + мягкая подсветка “России”.
  // Без внешних текстур.
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec3 vN;
        varying vec3 vP;
        void main() {
          vN = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vP = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vN;
        varying vec3 vP;
        uniform float uTime;
        uniform vec3 uRussia;
        uniform float uOn;

        float hash(vec3 p){
          p = fract(p*0.3183099 + vec3(.1,.2,.3));
          p *= 17.0;
          return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
        }

        float noise(vec3 p){
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f*f*(3.0-2.0*f);

          float n000 = hash(i + vec3(0,0,0));
          float n100 = hash(i + vec3(1,0,0));
          float n010 = hash(i + vec3(0,1,0));
          float n110 = hash(i + vec3(1,1,0));
          float n001 = hash(i + vec3(0,0,1));
          float n101 = hash(i + vec3(1,0,1));
          float n011 = hash(i + vec3(0,1,1));
          float n111 = hash(i + vec3(1,1,1));

          float nx00 = mix(n000, n100, f.x);
          float nx10 = mix(n010, n110, f.x);
          float nx01 = mix(n001, n101, f.x);
          float nx11 = mix(n011, n111, f.x);
          float nxy0 = mix(nx00, nx10, f.y);
          float nxy1 = mix(nx01, nx11, f.y);
          return mix(nxy0, nxy1, f.z);
        }

        void main(){
          vec3 n = normalize(vN);
          float fres = pow(1.0 - max(dot(n, normalize(vec3(0.2,0.5,1.0))), 0.0), 3.0);

          // “континенты”
          vec3 p = normalize(vP);
          float t = uTime * 0.08;
          float n1 = noise(p*3.5 + vec3(t,0.0,-t));
          float n2 = noise(p*8.0 + vec3(0.0,-t,t));
          float land = smoothstep(0.52, 0.64, n1*0.65 + n2*0.35);

          vec3 seaCol  = vec3(0.05, 0.10, 0.20);
          vec3 landCol = vec3(0.12, 0.22, 0.16);

          // мягкий дневной свет
          vec3 lightDir = normalize(vec3(0.7, 0.2, 0.6));
          float diff = clamp(dot(n, lightDir)*0.6 + 0.4, 0.0, 1.0);

          vec3 base = mix(seaCol, landCol, land) * (0.55 + 0.7*diff);

          // “Россия подсвечена” — мягкий пятно‑акцент
          float rDot = dot(p, normalize(uRussia));
          float rMask = smoothstep(0.88, 0.98, rDot);
          vec3 rCol = vec3(0.65, 0.78, 1.0);
          base += rCol * rMask * (0.10 + 0.08*uOn);

          // атмосфера/обводка
          base += vec3(0.35,0.55,0.75) * fres * 0.22;

          gl_FragColor = vec4(base, 1.0);
        }
      `
    });
  }, [uniforms]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} ref={matRef as any} attach="material" />
    </mesh>
  );
}

function Atmosphere() {
  const ref = useRef<THREE.Mesh | null>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <mesh ref={ref} scale={1.03}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        color={new THREE.Color("white")}
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function ScanRing({ on }: { on: boolean }) {
  const ring = useRef<THREE.Mesh | null>(null);
  const state = useRef({ p: 0 });

  useFrame((_, dt) => {
    state.current.p = damp(state.current.p, on ? 1 : 0, 5, dt);
    if (ring.current) {
      ring.current.rotation.y += dt * 0.9;
      ring.current.rotation.x += dt * 0.15;
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + 0.14 * state.current.p;
      ring.current.scale.setScalar(1.18 + 0.06 * state.current.p);
    }
  });

  return (
    <mesh ref={ring} rotation={[Math.PI / 2.5, 0, 0]}>
      <torusGeometry args={[1.12, 0.008, 8, 180]} />
      <meshBasicMaterial
        color={new THREE.Color("#a5d2ff")}
        transparent
        opacity={0.0}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function LockOverRussia({ on }: { on: boolean }) {
  const group = useRef<THREE.Group | null>(null);
  const left = useRef<THREE.Mesh | null>(null);
  const right = useRef<THREE.Mesh | null>(null);
  const shackle = useRef<THREE.Mesh | null>(null);
  const s = useRef({ p: 0 });

  const pos = useMemo(() => {
    const v = latLonToVec3(RUSSIA_ANCHOR.lat, RUSSIA_ANCHOR.lon, 1.0).normalize().multiplyScalar(1.18);
    return v;
  }, []);

  useFrame((_, dt) => {
    s.current.p = damp(s.current.p, on ? 1 : 0, 6, dt);

    if (group.current) group.current.position.copy(pos);

    // “раскол” — стилизованный: две половинки + дужка улетает и тает
    const p = s.current.p;
    if (left.current) {
      left.current.position.x = -0.06 * p;
      left.current.rotation.z = -0.9 * p;
      (left.current.material as THREE.MeshStandardMaterial).opacity = 1 - 0.9 * p;
    }
    if (right.current) {
      right.current.position.x = 0.06 * p;
      right.current.rotation.z = 0.9 * p;
      (right.current.material as THREE.MeshStandardMaterial).opacity = 1 - 0.9 * p;
    }
    if (shackle.current) {
      shackle.current.position.y = 0.10 * p;
      shackle.current.rotation.x = 1.4 * p;
      (shackle.current.material as THREE.MeshStandardMaterial).opacity = 1 - 0.95 * p;
    }
    if (group.current) group.current.lookAt(0, 0, 0);
  });

  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95
    });
    return m;
  }, []);

  return (
    <group ref={group} scale={0.18}>
      <mesh ref={left} material={mat}>
        <boxGeometry args={[0.22, 0.24, 0.12]} />
      </mesh>
      <mesh ref={right} material={mat}>
        <boxGeometry args={[0.22, 0.24, 0.12]} />
      </mesh>
      <mesh ref={shackle} position={[0, 0.18, 0]} material={mat}>
        <torusGeometry args={[0.16, 0.04, 10, 28, Math.PI]} />
      </mesh>
    </group>
  );
}

function Tunnel({
  from,
  to,
  on,
  reducedMotion
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  on: boolean;
  reducedMotion: boolean;
}) {
  const { curve, mid } = useMemo(() => makeArc(from, to), [from, to]);
  const pts = useMemo(() => curve.getPoints(140), [curve]);

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 140, 0.018, 10, false), [curve]);
  const shellGeo = useMemo(() => new THREE.TubeGeometry(curve, 140, 0.032, 10, false), [curve]);
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints(pts);
    return g;
  }, [pts]);

  const dashRef = useRef<THREE.Line | null>(null);
  const shellRef = useRef<THREE.Mesh | null>(null);
  const s = useRef({ p: 0 });

  useEffect(() => {
    // dashed line needs distances
    if (dashRef.current) {
      dashRef.current.computeLineDistances();
    }
  }, [lineGeo]);

  // крипто-частицы
  const N = reducedMotion ? 0 : 42;
  const instRef = useRef<THREE.InstancedMesh | null>(null);
  const seeds = useMemo(() => {
    return Array.from({ length: N }, () => ({
      t: Math.random(),
      speed: 0.10 + Math.random() * 0.22,
      s: 0.5 + Math.random() * 1.2
    }));
  }, [N]);

  useFrame((_, dt) => {
    s.current.p = damp(s.current.p, on ? 1 : 0, 5, dt);
    const p = s.current.p;

    if (shellRef.current) {
      (shellRef.current.material as THREE.MeshBasicMaterial).opacity = 0.02 + 0.10 * p;
      shellRef.current.visible = p > 0.01;
    }

    if (dashRef.current) {
      const m = dashRef.current.material as THREE.LineDashedMaterial;
      m.opacity = 0.15 + 0.65 * p;
      m.dashSize = 0.08;
      m.gapSize = 0.07;
      if (!reducedMotion && on) dashRef.current.rotation.y += dt * 0.15;
    }

    if (!instRef.current) return;
    const dummy = new THREE.Object3D();
    seeds.forEach((it, i) => {
      it.t = (it.t + dt * it.speed * (0.35 + 0.9 * p)) % 1;
      const v = curve.getPointAt(it.t);
      dummy.position.copy(v);

      const v2 = curve.getPointAt((it.t + 0.01) % 1);
      dummy.lookAt(v2);
      dummy.rotateZ(i * 0.37);

      const sc = 0.012 * it.s * (0.35 + 0.9 * p);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      instRef.current!.setMatrixAt(i, dummy.matrix);
    });
    instRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* маска подсети — полупрозрачная оболочка вокруг маршрута */}
      <mesh ref={shellRef} geometry={shellGeo} visible={false}>
        <meshBasicMaterial
          color={new THREE.Color("#a7f3dc")}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* основной “туннель” */}
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial
          color={new THREE.Color("#a5d2ff")}
          transparent
          opacity={on ? 0.12 : 0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* “cipher stream” — пунктир */}
      <line ref={dashRef}>
        <primitive object={lineGeo} attach="geometry" />
        <lineDashedMaterial
          color={new THREE.Color("#ffffff")}
          transparent
          opacity={0.0}
          dashSize={0.08}
          gapSize={0.07}
        />
      </line>

      {/* крипто-частицы по каналу */}
      {N > 0 && (
        <instancedMesh ref={instRef} args={[null as any, null as any, N]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={new THREE.Color("#a7f3dc")}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      )}

      {/* подпись */}
      <Html position={mid.clone().multiplyScalar(1.02)} center>
        <div className="pointer-events-none select-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[rgb(var(--muted))] backdrop-blur-md">
          <div className="text-white/80">Маска подсети</div>
          <div className="opacity-70">(Masked Subnet)</div>
        </div>
      </Html>
    </group>
  );
}

function Scene({
  vpnOn,
  country,
  tier,
  reducedMotion
}: {
  vpnOn: boolean;
  country: ExitCountry;
  tier: PerfTier;
  reducedMotion: boolean;
}) {
  const from = useMemo(
    () => latLonToVec3(RUSSIA_ANCHOR.lat, RUSSIA_ANCHOR.lon, 1.0).normalize().multiplyScalar(1.02),
    []
  );
  const to = useMemo(
    () => latLonToVec3(country.lat, country.lon, 1.0).normalize().multiplyScalar(1.02),
    [country]
  );

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 2, 2]} intensity={1.1} />

      <Stars radius={40} depth={20} count={tier === "low" ? 1200 : 2200} factor={2} saturation={0} fade />

      <EarthSurface vpnOn={vpnOn} />
      <Atmosphere />

      <ScanRing on={vpnOn && !reducedMotion} />
      <LockOverRussia on={vpnOn} />

      {/* Туннель/маршрут показываем при ON */}
      <group visible={vpnOn}>
        <Tunnel from={from} to={to} on={vpnOn} reducedMotion={reducedMotion || tier === "low"} />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.35}
        maxPolarAngle={Math.PI * 0.75}
        rotateSpeed={0.6}
      />

      <Html position={[0, -1.35, 0]} center>
        <div className="pointer-events-none select-none text-center text-sm text-[rgb(var(--muted))]">
          {vpnOn ? (
            <span className="text-white/80">
              Теперь вы как будто в другой стране: трафик идёт через защищённый туннель.
            </span>
          ) : (
            <span>Включите VPN, чтобы увидеть “туннель” и маску подсети.</span>
          )}
        </div>
      </Html>
    </>
  );
}

export default function EarthCanvas({
  vpnOn,
  country,
  tier,
  reducedMotion
}: {
  vpnOn: boolean;
  country: ExitCountry;
  tier: PerfTier;
  reducedMotion: boolean;
}) {
  const dpr = tier === "low" ? 1 : tier === "mid" ? 1.5 : 2;

  return (
    <div className="relative h-[420px] w-full md:h-[520px]">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        gl={{
          antialias: tier !== "low",
          alpha: true,
          powerPreference: tier === "low" ? "low-power" : "high-performance"
        }}
      >
        <Scene vpnOn={vpnOn} country={country} tier={tier} reducedMotion={reducedMotion} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
