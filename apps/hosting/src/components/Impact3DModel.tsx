import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/models/bennu.glb");
useGLTF.preload("/models/eros.glb");
useGLTF.preload("/models/vesta.glb");
useGLTF.preload("/models/ceres.glb");

const ASTEROID_MODELS: Record<string, string> = {
  "2101955": "/models/bennu.glb",
  "2000433": "/models/eros.glb",
  "2000004": "/models/vesta.glb",
  "2000001": "/models/ceres.glb",
};

interface Impact3DModelProps {
  simData: any;
  onComplete?: () => void;
}

const AsteroidModel = ({
  meteorId,
  simData,
  asteroidRef,
  position,
}: {
  meteorId: string;
  simData: any;
  asteroidRef: React.RefObject<THREE.Group>;
  position: [number, number, number];
}) => {
  const modelPath = ASTEROID_MODELS[meteorId];

  if (!modelPath) {
    const asteroidRadius = Math.max(
      0.05,
      (simData.simulation?.diameter || 490) / 400,
    );
    const color =
      simData.simulation?.asteroidType === "metallic"
        ? "#8b8b8b"
        : simData.simulation?.asteroidType === "icy"
          ? "#b0d4e3"
          : "#6b4423";

    return (
      <Sphere
        ref={asteroidRef as any}
        args={[asteroidRadius, 32, 32]}
        position={position}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={
            simData.simulation?.asteroidType === "metallic" ? 0.8 : 0.1
          }
        />
      </Sphere>
    );
  }

  const { scene } = useGLTF(modelPath);

  const getOptimalScale = () => {
    const diameter = simData.simulation?.diameter || 490;
    if (diameter < 1000) return 0.3;
    else if (diameter < 50000) return 0.2;
    else if (diameter < 600000) return 0.1;
    else return 0.05;
  };

  const scale = getOptimalScale();

  const shouldUseColor = meteorId === "2000004" || meteorId === "2000433";

  React.useMemo(() => {
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

  return (
    <group ref={asteroidRef} scale={scale} position={position}>
      <primitive object={scene.clone()} />
    </group>
  );
};

const AsteroidApproach = ({
  simData,
  onComplete,
}: {
  simData: any;
  onComplete?: () => void;
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const asteroidRef = useRef<THREE.Group>(null);
  const trajectoryRef = useRef<THREE.Line>(null);
  const craterRef = useRef<THREE.Mesh>(null);
  const explosionRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const debrisGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphericFragmentsRef = useRef<THREE.Group>(null);

  const [hasImpacted, setHasImpacted] = useState(false);
  const [impactTime, setImpactTime] = useState(0);

  const earthDayTexture = useLoader(
    THREE.TextureLoader,
    "/textures/earth_day.jpg",
  );
  const earthNormalTexture = useLoader(
    THREE.TextureLoader,
    "/textures/earth_normal.jpg",
  );
  const earthSpecularTexture = useLoader(
    THREE.TextureLoader,
    "/textures/earth_specular.jpg",
  );
  const earthCloudsTexture = useLoader(
    THREE.TextureLoader,
    "/textures/earth_clouds.png",
  );

  useEffect(() => {
    earthDayTexture.wrapS = earthDayTexture.wrapT = THREE.RepeatWrapping;
    earthNormalTexture.wrapS = earthNormalTexture.wrapT = THREE.RepeatWrapping;
    earthSpecularTexture.wrapS = earthSpecularTexture.wrapT =
      THREE.RepeatWrapping;
    earthCloudsTexture.wrapS = earthCloudsTexture.wrapT = THREE.RepeatWrapping;

    const points = [];
    const impactAngle = (simData.simulation?.angle || 45) * (Math.PI / 180);
    const distance = simData.simulation?.distance || 20;
    const earthRadius = 3;

    for (let i = 0; i <= 50; i++) {
      const progress = i / 50;

      const finalX = earthRadius * Math.cos(impactAngle) * 0.8;
      const finalY = earthRadius * Math.sin(impactAngle) * 0.8;
      const finalZ = 0;

      const startX = distance;
      const startY = distance * Math.sin(impactAngle);
      const startZ = distance * Math.cos(impactAngle);

      points.push(
        new THREE.Vector3(
          startX - progress * (startX - finalX),
          startY - progress * (startY - finalY),
          startZ - progress * (startZ - finalZ),
        ),
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    if (trajectoryRef.current) {
      trajectoryRef.current.geometry = geometry;
      trajectoryRef.current.material = new THREE.LineBasicMaterial({
        color: "#f25c05",
        transparent: true,
        opacity: 0.3,
      });
    }

    if (debrisGroupRef.current) {
      for (let i = 0; i < 20; i++) {
        const debris = new THREE.Mesh(
          new THREE.SphereGeometry(0.1 + Math.random() * 0.3, 8, 8),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(
              0.1,
              0.7,
              0.3 + Math.random() * 0.4,
            ),
            emissive: new THREE.Color().setHSL(0.1, 0.5, 0.1),
          }),
        );
        debris.visible = false;
        debrisGroupRef.current.add(debris);
      }
    }

    if (atmosphericFragmentsRef.current) {
      for (let i = 0; i < 15; i++) {
        const fragment = new THREE.Mesh(
          new THREE.SphereGeometry(0.02 + Math.random() * 0.05, 6, 6),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(
              0.1,
              0.8,
              0.4 + Math.random() * 0.3,
            ),
            emissive: new THREE.Color().setHSL(0.1, 0.6, 0.2),
            emissiveIntensity: 0.5,
          }),
        );
        fragment.visible = false;

        (fragment as any).velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
        );
        (fragment as any).lifespan = 0;
        (fragment as any).maxLifespan = 2 + Math.random() * 3;

        atmosphericFragmentsRef.current.add(fragment);
      }
    }
  }, [simData]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const approachDuration = 6;
    const impactDuration = 4;
    const atmosphereEntry = 0.4;

    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0015;
    }

    if (!hasImpacted && time < approachDuration) {
      const progress = time / approachDuration;
      const impactAngle = (simData.simulation?.angle || 45) * (Math.PI / 180);
      const distance = simData.simulation?.distance || 20;
      const earthRadius = 3;

      if (asteroidRef.current) {
        const finalX = earthRadius * Math.cos(impactAngle) * 0.8;
        const finalY = earthRadius * Math.sin(impactAngle) * 0.8;
        const finalZ = 0;

        const startX = distance;
        const startY = distance * Math.sin(impactAngle);
        const startZ = distance * Math.cos(impactAngle);

        asteroidRef.current.position.x = startX - progress * (startX - finalX);
        asteroidRef.current.position.y = startY - progress * (startY - finalY);
        asteroidRef.current.position.z = startZ - progress * (startZ - finalZ);

        asteroidRef.current.rotation.x += 0.03;
        asteroidRef.current.rotation.y += 0.02;

        const scale = 1 + progress * 0.5;
        asteroidRef.current.scale.setScalar(scale);

        if (progress > atmosphereEntry && atmosphericFragmentsRef.current) {
          const fragmentationIntensity =
            (progress - atmosphereEntry) / (1 - atmosphereEntry);

          atmosphericFragmentsRef.current.children.forEach(
            (fragment, index) => {
              const fragmentMesh = fragment as THREE.Mesh & {
                velocity: THREE.Vector3;
                lifespan: number;
                maxLifespan: number;
              };

              if (fragmentationIntensity > index * 0.1) {
                fragmentMesh.visible = true;

                if (fragmentMesh.lifespan === 0) {
                  fragmentMesh.position.copy(asteroidRef.current.position);
                  fragmentMesh.position.add(
                    new THREE.Vector3(
                      (Math.random() - 0.5) * 0.5,
                      (Math.random() - 0.5) * 0.5,
                      (Math.random() - 0.5) * 0.5,
                    ),
                  );
                }

                fragmentMesh.lifespan += 0.02;
                fragmentMesh.position.add(fragmentMesh.velocity);

                fragmentMesh.velocity.y -= 0.001;
                fragmentMesh.velocity.multiplyScalar(0.98);

                fragmentMesh.rotation.x += 0.1;
                fragmentMesh.rotation.y += 0.15;

                const fadeProgress =
                  fragmentMesh.lifespan / fragmentMesh.maxLifespan;
                const material =
                  fragmentMesh.material as THREE.MeshStandardMaterial;
                material.opacity = Math.max(0, 1 - fadeProgress);
                material.transparent = true;

                if (fragmentMesh.lifespan > fragmentMesh.maxLifespan) {
                  fragmentMesh.visible = false;
                  fragmentMesh.lifespan = 0;
                }
              }
            },
          );
        }
      }

      if (trajectoryRef.current) {
        const material = trajectoryRef.current
          .material as THREE.LineBasicMaterial;
        material.opacity = 0.3 * (1 - progress);
      }
    } else if (!hasImpacted && time >= approachDuration) {
      setHasImpacted(true);
      setImpactTime(time);

      if (asteroidRef.current) {
        asteroidRef.current.visible = false;
      }
      if (atmosphericFragmentsRef.current) {
        atmosphericFragmentsRef.current.children.forEach((fragment) => {
          fragment.visible = false;
        });
      }
    } else if (hasImpacted) {
      const impactProgress = (time - impactTime) / impactDuration;

      if (impactProgress <= 1) {
        if (explosionRef.current) {
          explosionRef.current.visible = true;
          const explosionScale = impactProgress * 3;
          explosionRef.current.scale.setScalar(explosionScale);

          const material = explosionRef.current
            .material as THREE.MeshStandardMaterial;
          material.opacity = Math.max(0, 1 - impactProgress);
        }

        if (shockwaveRef.current) {
          shockwaveRef.current.visible = true;
          const shockScale = impactProgress * 8;
          shockwaveRef.current.scale.setScalar(shockScale);

          const material = shockwaveRef.current
            .material as THREE.MeshBasicMaterial;
          material.opacity = Math.max(0, 0.3 * (1 - impactProgress));
        }

        if (craterRef.current && impactProgress > 0.3) {
          craterRef.current.visible = true;
          const craterScale = Math.min(1, (impactProgress - 0.3) / 0.7);
          craterRef.current.scale.setScalar(craterScale);
        }

        if (debrisGroupRef.current) {
          debrisGroupRef.current.children.forEach((debris, index) => {
            debris.visible = true;
            const angle =
              (index / debrisGroupRef.current!.children.length) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const height = Math.sin(impactProgress * Math.PI) * 5;

            debris.position.x = Math.cos(angle) * speed * impactProgress;
            debris.position.y = height;
            debris.position.z = Math.sin(angle) * speed * impactProgress;

            debris.rotation.x += 0.1;
            debris.rotation.y += 0.1;
            debris.rotation.z += 0.1;
          });
        }
      } else if (onComplete) {
        onComplete();
      }
    }
  });

  const craterDiameter = simData.impact?.craterDiameter || 1000;
  const craterScale = Math.min(craterDiameter / 1000, 6);

  return (
    <>
      <Sphere ref={earthRef} args={[3, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          map={earthDayTexture}
          normalMap={earthNormalTexture}
          roughnessMap={earthSpecularTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>

      <Sphere ref={cloudsRef} args={[3.05, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          map={earthCloudsTexture}
          transparent={true}
          opacity={0.4}
          alphaMap={earthCloudsTexture}
        />
      </Sphere>

      <AsteroidModel
        meteorId={simData.meteor?.id || "2101955"}
        simData={simData}
        asteroidRef={asteroidRef}
        position={[simData.simulation?.distance || 20, 10, 10]}
      />

      <Sphere
        ref={craterRef}
        args={[craterScale * 0.5, 32, 32]}
        position={[0, -3, 0]}
        visible={false}
      >
        <meshStandardMaterial
          color="#4a2c2a"
          roughness={1}
          transparent={true}
          opacity={0.8}
        />
      </Sphere>

      <Sphere
        ref={explosionRef}
        args={[1, 16, 16]}
        position={[0, 0, 0]}
        visible={false}
      >
        <meshStandardMaterial
          color="#ff4500"
          emissive="#ff6600"
          emissiveIntensity={2}
          transparent={true}
          opacity={0.8}
        />
      </Sphere>

      <Sphere
        ref={shockwaveRef}
        args={[1, 32, 32]}
        position={[0, 0, 0]}
        visible={false}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent={true}
          opacity={0.3}
          side={THREE.DoubleSide}
          wireframe={true}
        />
      </Sphere>

      <group ref={debrisGroupRef} position={[0, 0, 0]} />

      <group ref={atmosphericFragmentsRef} />

      <primitive ref={trajectoryRef} object={new THREE.Line()} />
    </>
  );
};

export const Impact3DModel = ({ simData, onComplete }: Impact3DModelProps) => {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-black via-secondary/20 to-black relative">
      <Canvas camera={{ position: [0, 8, 18], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={2}
          color="#ffffff"
        />
        <pointLight position={[10, 10, 10]} intensity={2} color="#f25c05" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={1.2}
          color="#ffffff"
        />
        <pointLight position={[0, 15, 0]} intensity={1.5} color="#ffffff" />

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

      <div className="absolute top-24 left-8 bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm p-6 rounded-xl max-w-md">
        <h2 className="text-2xl font-bold mb-3 text-white">
          Simulación de Impacto
        </h2>
        <div className="text-white/80 text-sm leading-relaxed space-y-2">
          <p>
            Asteroide{" "}
            <span className="text-primary font-semibold">
              {simData.meteor?.name || "Desconocido"}
            </span>
          </p>
          <p>
            Tipo:{" "}
            <span className="text-primary font-semibold">
              {simData.simulation?.asteroidType || "rocky"}
            </span>
            , Diámetro:{" "}
            <span className="text-primary font-semibold">
              {simData.simulation?.diameter || 490}m
            </span>
          </p>
          <p>
            Velocidad:{" "}
            <span className="text-primary font-semibold">
              {simData.simulation?.velocity || 28} km/s
            </span>
            , Ángulo:{" "}
            <span className="text-primary font-semibold">
              {simData.simulation?.angle || 45}°
            </span>
          </p>
          <p>
            Energía de impacto:{" "}
            <span className="text-destructive font-semibold">
              {simData.impact?.energy || 14400} megatones
            </span>
          </p>
          <p>
            Diámetro del cráter:{" "}
            <span className="text-destructive font-semibold">
              {Math.round(simData.impact?.craterDiameter || 11364)}m
            </span>
          </p>
        </div>
        <p className="text-white/60 text-xs mt-3">
          Equivalente al evento de extinción{" "}
          {simData.impact?.comparison?.event || "Chicxulub"}
        </p>
      </div>
    </div>
  );
};
