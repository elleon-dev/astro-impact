import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

interface SimulationData {
  asteroidType: string;
  diameter: number;
  velocity: number;
  angle: number;
  composition: string;
}

interface AsteroidSceneProps {
  simData: SimulationData;
}

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={earthRef} args={[2, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#112237"
        roughness={0.7}
        metalness={0.2}
      />
    </Sphere>
  );
};

const Asteroid = ({ simData }: { simData: SimulationData }) => {
  const asteroidRef = useRef<THREE.Mesh>(null);
  const scale = simData.diameter / 100;
  
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
      const speed = simData.velocity / 30;
      
      // Real elliptical orbit (Kepler's laws approximation)
      const a = 8; // semi-major axis
      const b = 5; // semi-minor axis
      const e = Math.sqrt(1 - (b * b) / (a * a)); // eccentricity
      
      // Parametric equation for ellipse
      const angle = time * speed;
      asteroidRef.current.position.x = a * Math.cos(angle);
      asteroidRef.current.position.z = b * Math.sin(angle);
      
      // Inclination based on impact angle
      const inclinationRad = (simData.angle * Math.PI) / 180;
      asteroidRef.current.position.y = Math.sin(angle) * 2 * Math.sin(inclinationRad);
      
      asteroidRef.current.rotation.x += 0.02;
      asteroidRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={asteroidRef} args={[scale, 32, 32]} position={[8, 2, 0]}>
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={simData.asteroidType === "metallic" ? 0.8 : 0.1}
      />
    </Sphere>
  );
};

const ImpactTrail = ({ simData }: { simData: SimulationData }) => {
  const points = useMemo(() => {
    const pts = [];
    const a = 8;
    const b = 5;
    for (let i = 0; i < 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      const inclinationRad = (simData.angle * Math.PI) / 180;
      pts.push(
        new THREE.Vector3(
          a * Math.cos(t),
          Math.sin(t) * 2 * Math.sin(inclinationRad),
          b * Math.sin(t)
        )
      );
    }
    return pts;
  }, [simData.angle]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: "#f25c05", linewidth: 2, transparent: true, opacity: 0.2 }))} />
  );
};

export const AsteroidScene = ({ simData }: AsteroidSceneProps) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-black to-secondary/20">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f25c05" />
        
        <Stars radius={300} depth={60} count={5000} factor={7} fade speed={1} />
        
        <Earth />
        <Asteroid simData={simData} />
        <ImpactTrail simData={simData} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};
