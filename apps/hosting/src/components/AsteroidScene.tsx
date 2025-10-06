import { Suspense, useMemo, useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  shaderMaterial,
  Sphere,
  Stars,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/models/bennu.glb");
useGLTF.preload("/models/eros.glb");
useGLTF.preload("/models/vesta.glb");
useGLTF.preload("/models/ceres.glb");

interface SimulationData {
  asteroidType: string;
  diameter: number;
  velocity: number;
  angle: number;
  composition: string;
  distance?: number;
}

interface AsteroidSceneProps {
  simData: SimulationData;
}

const EarthBlendMaterial = shaderMaterial(
  {
    dayMap: null as unknown as THREE.Texture,
    nightMap: null as unknown as THREE.Texture,
    lightDir: new THREE.Vector3(1, 0.1, 0.2),
    nightBoost: 1.15,
    soft: 0.35,
  },
  `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 lightDir;
  uniform float nightBoost;
  uniform float soft;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float ndl = dot(normalize(vNormal), normalize(lightDir));
    float blend = smoothstep(-soft, soft, ndl);

    vec3 dayCol   = texture2D(dayMap,   vUv).rgb;
    vec3 nightCol = texture2D(nightMap, vUv).rgb * nightBoost;

    vec3 color = mix(nightCol, dayCol, blend);
    gl_FragColor = vec4(color, 1.0);
  }`,
);

extend({ EarthBlendMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      earthBlendMaterial: any;
    }
  }
}

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<any>(null);

  const [dayMap, nightMap, cloudsMap] = useTexture([
    "/textures/earth_day.jpg",
    "/textures/earth_night.jpg",
    "/textures/earth_clouds.png",
  ]);

  dayMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (earthRef.current) earthRef.current.rotation.y += 0.001;
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0015;

    if (matRef.current) {
      const t = state.clock.getElapsedTime() * 0.1;
      const radius = 1.0;
      const lx = Math.cos(t) * radius;
      const lz = Math.sin(t) * radius;
      const ly = 0.25;
      matRef.current.uniforms.lightDir.value.set(lx, ly, lz);
    }
  });

  return (
    <>
      <Sphere ref={earthRef} args={[2, 128, 128]} position={[0, 0, 0]}>
        <earthBlendMaterial
          ref={matRef}
          dayMap={dayMap}
          nightMap={nightMap}
          soft={0.35}
          nightBoost={1.4}
        />
      </Sphere>

      <Sphere ref={cloudsRef} args={[2.03, 96, 96]} position={[0, 0, 0]}>
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          depthWrite={false}
          opacity={0.85}
        />
      </Sphere>

      <Sphere args={[2.08, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#7ec8ff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </>
  );
};

// Mapeo de IDs a archivos GLB
const ASTEROID_MODELS: Record<string, string> = {
  "2101955": "/models/bennu.glb",
  "2000433": "/models/eros.glb",
  "2000004": "/models/vesta.glb",
  "2000001": "/models/ceres.glb",
};

const AsteroidModel = ({
  modelPath,
  scale,
  simData,
  meteorId,
}: {
  modelPath: string;
  scale: number;
  simData: SimulationData;
  meteorId: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  const orbitRadius = simData.distance || 8;

  const shouldUseColor = meteorId === "2000004" || meteorId === "2000433";

  useMemo(() => {
    if (shouldUseColor) {
      const color = meteorId === "2000004" ? "#c4a574" : "#8b8b8b";

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.9,
            metalness: meteorId === "2000433" ? 0.6 : 0.1,
          });
        }
      });
    }
  }, [scene, meteorId, shouldUseColor]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const speed = simData.velocity / 50;
      const a = orbitRadius;
      const b = orbitRadius * 0.8;
      const angle = time * speed;

      groupRef.current.position.x = a * Math.cos(angle);
      groupRef.current.position.z = b * Math.sin(angle);

      const inclinationRad = (simData.angle * Math.PI) / 180;
      groupRef.current.position.y =
        Math.sin(angle) * 2 * Math.sin(inclinationRad);

      groupRef.current.rotation.x += 0.01;
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  );
};

const Asteroid = ({
  simData,
  meteorId,
}: {
  simData: SimulationData;
  meteorId: string;
}) => {
  const asteroidRef = useRef<THREE.Mesh>(null);
  const orbitRadius = simData.distance || 8;

  // Si hay un modelo GLB disponible, usarlo
  const modelPath = ASTEROID_MODELS[meteorId];

  // Función de escala mejorada según el tamaño real
  const getOptimalScale = () => {
    const diameter = simData.diameter;

    // Escala diferente según el tamaño del asteroide
    if (diameter < 1000) {
      // Asteroides pequeños como Bennu (490m)
      return 0.5;
    } else if (diameter < 50000) {
      // Asteroides medianos como Eros (16,840m)
      return 0.3;
    } else if (diameter < 600000) {
      // Asteroides grandes como Vesta (525,000m)
      return 0.15;
    } else {
      // Muy grandes como Ceres (939,400m)
      return 0.1;
    }
  };

  const scale = getOptimalScale();

  const color = useMemo(() => {
    switch (simData.asteroidType) {
      case "metallic":
        return "#8b8b8b";
      case "icy":
        return "#b0d4e3";
      default:
        return "#6b4423";
    }
  }, [simData.asteroidType]);

  useFrame((state) => {
    if (asteroidRef.current) {
      const time = state.clock.getElapsedTime();
      const speed = simData.velocity / 50;
      const a = orbitRadius;
      const b = orbitRadius * 0.8;
      const angle = time * speed;

      asteroidRef.current.position.x = a * Math.cos(angle);
      asteroidRef.current.position.z = b * Math.sin(angle);

      const inclinationRad = (simData.angle * Math.PI) / 180;
      asteroidRef.current.position.y =
        Math.sin(angle) * 2 * Math.sin(inclinationRad);

      asteroidRef.current.rotation.x += 0.02;
      asteroidRef.current.rotation.y += 0.01;
    }
  });

  // Si existe modelo 3D, usarlo
  if (modelPath) {
    return (
      <AsteroidModel
        modelPath={modelPath}
        scale={scale}
        simData={simData}
        meteorId={meteorId}
      />
    );
  }

  // Fallback: esfera simple para "custom"
  return (
    <Sphere
      ref={asteroidRef}
      args={[scale, 32, 32]}
      position={[orbitRadius, 0, 0]}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={simData.asteroidType === "metallic" ? 0.8 : 0.1}
      />
    </Sphere>
  );
};

const OrbitPath = ({ simData }: { simData: SimulationData }) => {
  const orbitRadius = simData.distance || 8;

  const points = useMemo(() => {
    const pts = [];
    const a = orbitRadius;
    const b = orbitRadius * 0.8;
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const inclinationRad = (simData.angle * Math.PI) / 180;

      pts.push(
        new THREE.Vector3(
          a * Math.cos(t),
          Math.sin(t) * 2 * Math.sin(inclinationRad),
          b * Math.sin(t),
        ),
      );
    }
    return pts;
  }, [orbitRadius, simData.angle]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color="#f25c05"
        transparent
        opacity={0.3}
        linewidth={2}
      />
    </line>
  );
};

// En AsteroidScene.tsx
export const AsteroidScene = ({
  simData,
  meteorId = "2101955",
}: AsteroidSceneProps & { meteorId?: string }) => {
  const controlsRef = useRef();

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-black to-secondary/20 relative">
      <button
        onClick={resetCamera}
        className="absolute top-4 right-4 z-10 px-3 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-black/50 transition-all text-xs"
      >
        Reset View
      </button>
      <Canvas
        camera={{ position: [0, 8, 15], fov: 50 }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
        }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[10, 10, 10]} intensity={1} distance={50} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#f25c05"
        />

        <Environment preset="sunset" />
        <Stars radius={300} depth={60} count={5000} factor={7} fade speed={1} />

        <Suspense fallback={<LoadingPlaceholder />}>
          <Earth />
          <Asteroid simData={simData} meteorId={meteorId} />
          <OrbitPath simData={simData} />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={25}
        />
      </Canvas>
    </div>
  );
};

const LoadingPlaceholder = () => (
  <Sphere args={[0.5, 16, 16]} position={[0, 0, 0]}>
    <meshBasicMaterial color="#ff6600" wireframe />
  </Sphere>
);
