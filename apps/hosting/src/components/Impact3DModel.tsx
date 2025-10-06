import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface SimulationData {
  asteroidType: string;
  diameter: number;
  velocity: number;
  angle: number;
  composition: string;
}

interface Impact3DModelProps {
  simData: SimulationData;
  onComplete?: () => void;
}

const AsteroidApproach = ({
  simData,
  onComplete,
}: {
  simData: SimulationData;
  onComplete?: () => void;
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const asteroidRef = useRef<THREE.Mesh>(null);
  const trajectoryRef = useRef<THREE.Line>(null);

  useEffect(() => {
    // Crear línea de trayectoria
    const points = [];
    for (let i = 0; i <= 50; i++) {
      const progress = i / 50;
      points.push(
        new THREE.Vector3(
          20 - progress * 20,
          10 - progress * 10,
          10 - progress * 10,
        ),
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: "#f25c05",
      transparent: true,
      opacity: 0.3,
    });
    const line = new THREE.Line(geometry, material);

    if (trajectoryRef.current) {
      trajectoryRef.current.geometry = geometry;
    }
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const duration = 8; // 8 segundos para la animación

    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }

    if (asteroidRef.current && time < duration) {
      // Asteroide aproximándose
      const progress = time / duration;
      asteroidRef.current.position.x = 20 - progress * 20;
      asteroidRef.current.position.y = 10 - progress * 10;
      asteroidRef.current.position.z = 10 - progress * 10;
      asteroidRef.current.rotation.x += 0.03;
      asteroidRef.current.rotation.y += 0.02;

      // Fade out de la trayectoria
      if (trajectoryRef.current) {
        const material = trajectoryRef.current
          .material as THREE.LineBasicMaterial;
        material.opacity = 0.3 * (1 - progress);
      }
    } else if (time >= duration && onComplete) {
      // Animación completada
      onComplete();
    }
  });

  const asteroidColor =
    simData.asteroidType === "metallic"
      ? "#8b8b8b"
      : simData.asteroidType === "icy"
        ? "#b0d4e3"
        : "#6b4423";

  return (
    <>
      {/* Tierra */}
      <Sphere ref={earthRef} args={[3, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#112237" roughness={0.7} metalness={0.2} />
      </Sphere>

      {/* Asteroide */}
      <Sphere
        ref={asteroidRef}
        args={[simData.diameter / 80, 32, 32]}
        position={[20, 10, 10]}
      >
        <meshStandardMaterial
          color={asteroidColor}
          roughness={0.9}
          metalness={simData.asteroidType === "metallic" ? 0.8 : 0.1}
        />
      </Sphere>

      {/* Línea de trayectoria */}
      <primitive ref={trajectoryRef} object={new THREE.Line()} />
    </>
  );
};

export const Impact3DModel = ({ simData, onComplete }: Impact3DModelProps) => {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-black via-secondary/20 to-black relative">
      <Canvas camera={{ position: [0, 8, 18], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#f25c05" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Stars
          radius={300}
          depth={60}
          count={10000}
          factor={8}
          fade
          speed={1}
        />

        <AsteroidApproach simData={simData} onComplete={onComplete} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={30}
        />
      </Canvas>

      {/* Overlay Text */}
      <div className="absolute top-24 left-8 bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm p-6 rounded-xl max-w-md">
        <h2 className="text-2xl font-bold mb-3 text-white">
          Approach Trajectory
        </h2>
        <p className="text-white/80 text-sm leading-relaxed">
          <span className="text-primary font-semibold">
            {simData.asteroidType}
          </span>{" "}
          type asteroid of{" "}
          <span className="text-primary font-semibold">
            {simData.diameter}m
          </span>{" "}
          approaching at{" "}
          <span className="text-primary font-semibold">
            {simData.velocity} km/s
          </span>
          .
        </p>
        <p className="text-white/60 text-xs mt-3">
          You can rotate the view with your mouse to observe the trajectory from
          different angles.
        </p>
      </div>
    </div>
  );
};
