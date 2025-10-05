import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

interface SimulationData {
  asteroidType: string;
  diameter: number;
  velocity: number;
  angle: number;
  composition: string;
}

interface ImpactVideoProps {
  simData: SimulationData;
}

const ImpactAnimation = ({ simData }: { simData: SimulationData }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const asteroidRef = useRef<THREE.Mesh>(null);
  const explosionRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
    
    if (asteroidRef.current && time < 5) {
      // Asteroid approaching
      const progress = time / 5;
      asteroidRef.current.position.x = 15 - (progress * 15);
      asteroidRef.current.position.y = 8 - (progress * 8);
      asteroidRef.current.position.z = 8 - (progress * 8);
      asteroidRef.current.rotation.x += 0.05;
      asteroidRef.current.rotation.y += 0.03;
    } else if (asteroidRef.current) {
      asteroidRef.current.visible = false;
    }
    
    if (explosionRef.current && time > 5) {
      // Impact explosion
      const explosionTime = time - 5;
      const explosionScale = Math.min(explosionTime * 2, 3);
      explosionRef.current.scale.set(explosionScale, explosionScale, explosionScale);
      const material = explosionRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(1 - explosionTime / 3, 0);
    }
  });

  const asteroidColor = simData.asteroidType === "metallic" ? "#8b8b8b" : 
                        simData.asteroidType === "icy" ? "#b0d4e3" : "#6b4423";

  return (
    <>
      {/* Earth */}
      <Sphere ref={earthRef} args={[3, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2563eb"
          roughness={0.7}
          metalness={0.2}
        />
      </Sphere>

      {/* Asteroid */}
      <Sphere 
        ref={asteroidRef} 
        args={[simData.diameter / 100, 32, 32]} 
        position={[15, 8, 8]}
      >
        <meshStandardMaterial
          color={asteroidColor}
          roughness={0.9}
          metalness={simData.asteroidType === "metallic" ? 0.8 : 0.1}
        />
      </Sphere>

      {/* Explosion */}
      <Sphere ref={explosionRef} args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ff6b35"
          transparent
          opacity={1}
        />
      </Sphere>
    </>
  );
};

export const ImpactVideo = ({ simData }: ImpactVideoProps) => {
  return (
    <div className="w-full h-[calc(100vh-13rem)] bg-gradient-to-b from-background via-background/90 to-background relative">
      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#ff6b35" />
        
        <Stars radius={300} depth={60} count={8000} factor={7} fade speed={2} />
        
        <ImpactAnimation simData={simData} />
      </Canvas>
      
      {/* Overlay Text */}
      <div className="absolute top-8 left-8 bg-background/80 backdrop-blur-sm p-6 rounded-lg border border-border max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-primary">Secuencia de Impacto</h2>
        <p className="text-muted-foreground">
          Asteroide de {simData.diameter}m aproximándose a la Tierra a {simData.velocity} km/s.
          El impacto generará una explosión catastrófica con efectos devastadores en la región de impacto.
        </p>
      </div>
    </div>
  );
};
