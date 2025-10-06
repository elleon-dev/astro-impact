import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Impact3DModelProps {
  simData: {
    diameter: number;
    velocity: number;
    angle: number;
    asteroidType: string;
  };
  onComplete?: () => void;
}

export const Impact3DModel = ({ simData, onComplete }: Impact3DModelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 8, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff4e6, 2);
    sunLight.position.set(15, 10, 10);
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0x8899ff, 0.8);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 300;
      const y = (Math.random() - 0.5) * 300;
      const z = (Math.random() - 0.5) * 300;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starsVertices, 3),
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Planeta
    const createPlanetTexture = (): HTMLCanvasElement => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#000814";
        ctx.fillRect(0, 0, 1024, 1024);

        const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        gradient.addColorStop(0, "#667788");
        gradient.addColorStop(0.5, "#445566");
        gradient.addColorStop(1, "#223344");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 1024;
          const radius = Math.random() * 60 + 20;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "rgba(100, 100, 100, 0.2)";
        for (let i = 0; i < 80; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 1024;
          const radius = Math.random() * 40 + 10;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 1024;
          const radius = Math.random() * 5 + 1;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      return canvas;
    };

    const earthTexture = new THREE.CanvasTexture(createPlanetTexture());
    const earthGeometry = new THREE.SphereGeometry(3, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 5,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const atmosphereGeometry = new THREE.SphereGeometry(3.3, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // ===== ASTEROIDE LIMPIO =====
    const asteroidSize = Math.max(0.6, simData.diameter / 60);

    const asteroidGeometry = new THREE.IcosahedronGeometry(asteroidSize, 3);
    const positions = asteroidGeometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i),
      );
      const noise = 0.85 + Math.random() * 0.3;
      vertex.normalize().multiplyScalar(asteroidSize * noise);
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    asteroidGeometry.computeVertexNormals();

    const createAsteroidTexture = (): HTMLCanvasElement => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const baseGradient = ctx.createRadialGradient(
          256,
          200,
          0,
          256,
          256,
          300,
        );
        baseGradient.addColorStop(0, "#d4a574");
        baseGradient.addColorStop(0.4, "#b8885a");
        baseGradient.addColorStop(0.7, "#9a7048");
        baseGradient.addColorStop(1, "#7a5838");
        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 35; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const radius = Math.random() * 50 + 25;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(80, 60, 40, 0.7)`);
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = 0; i < 40; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const radius = Math.random() * 20 + 10;
          ctx.fillStyle = "rgba(30, 20, 10, 0.8)";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = 0; i < 80; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const radius = Math.random() * 10 + 3;
          ctx.fillStyle = `rgba(${220 + Math.random() * 35}, ${180 + Math.random() * 40}, ${130 + Math.random() * 50}, ${0.3 + Math.random() * 0.4})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      return canvas;
    };

    const asteroidTexture = new THREE.CanvasTexture(createAsteroidTexture());

    const asteroidMaterial = new THREE.MeshPhongMaterial({
      map: asteroidTexture,
      color: 0xd4a574,
      shininess: 20,
    });

    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

    const angleRad = (simData.angle * Math.PI) / 180;
    asteroid.position.set(20, 10, -10);
    scene.add(asteroid);

    // Luces dedicadas al asteroide
    const asteroidKeyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    asteroidKeyLight.position.set(25, 15, -5);
    scene.add(asteroidKeyLight);

    const asteroidFillLight = new THREE.PointLight(0xffaa66, 1.2);
    asteroidFillLight.position.set(15, 8, -8);
    scene.add(asteroidFillLight);

    // Estela simple con esferas
    const trailMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 12; i++) {
      const trailGeometry = new THREE.SphereGeometry(
        asteroidSize * (0.7 - i * 0.04),
        16,
        16,
      );
      const hue = 0.08 - i * 0.01;
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 1, 0.5),
        transparent: true,
        opacity: 0.6 - i * 0.04,
      });
      const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
      scene.add(trailMesh);
      trailMeshes.push(trailMesh);
    }

    const explosionLight = new THREE.PointLight(0xff6600, 0, 25);
    scene.add(explosionLight);

    let time = 0;
    const impactTime = 3.5;
    let hasImpacted = false;
    const explosionParticles: THREE.Mesh[] = [];

    const targetX = Math.cos(angleRad) * 3;
    const targetY = Math.sin(angleRad) * 3;
    const targetZ = 0;

    const trailPositions: THREE.Vector3[] = [];

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      time += 0.016;

      earth.rotation.y += 0.001;
      stars.rotation.y += 0.0002;

      const targetCameraX = mouseX * 5;
      const targetCameraY = 8 + mouseY * 3;
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      if (time < impactTime) {
        const progress = time / impactTime;

        asteroid.position.x = 20 + (targetX - 20) * progress;
        asteroid.position.y = 10 + (targetY - 10) * progress;
        asteroid.position.z = -10 + (targetZ + 10) * progress;

        asteroid.rotation.x += 0.03;
        asteroid.rotation.y += 0.05;
        asteroid.rotation.z += 0.02;

        asteroidKeyLight.position.set(
          asteroid.position.x + 5,
          asteroid.position.y + 5,
          asteroid.position.z + 5,
        );

        asteroidFillLight.position.copy(asteroid.position);

        trailPositions.unshift(asteroid.position.clone());
        if (trailPositions.length > 12) trailPositions.pop();

        trailMeshes.forEach((mesh, index) => {
          if (trailPositions[index]) {
            mesh.position.copy(trailPositions[index]);
            mesh.visible = true;
          } else {
            mesh.visible = false;
          }
        });

        if (progress > 0.8) {
          const shakeAmount = (progress - 0.8) * 1;
          camera.position.x += (Math.random() - 0.5) * shakeAmount;
          camera.position.y += (Math.random() - 0.5) * shakeAmount;
        }
      } else if (!hasImpacted) {
        hasImpacted = true;
        asteroid.visible = false;
        trailMeshes.forEach((mesh) => (mesh.visible = false));
        asteroidKeyLight.visible = false;
        asteroidFillLight.visible = false;

        for (let i = 0; i < 250; i++) {
          const particleGeometry = new THREE.SphereGeometry(0.12, 8, 8);
          const hue = 0.05 + Math.random() * 0.12;
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5),
          });
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);

          particle.position.set(targetX, targetY, targetZ);

          const angle = Math.random() * Math.PI * 2;
          const angle2 = Math.random() * Math.PI;
          const speed = Math.random() * 0.5 + 0.2;

          particle.userData.velocity = new THREE.Vector3(
            Math.cos(angle) * Math.sin(angle2) * speed,
            Math.sin(angle) * Math.sin(angle2) * speed,
            Math.cos(angle2) * speed,
          );

          scene.add(particle);
          explosionParticles.push(particle);
        }

        explosionLight.position.set(targetX, targetY, targetZ);
        explosionLight.intensity = 30;

        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      } else {
        const explosionProgress = (time - impactTime) / 2;

        if (explosionProgress < 1) {
          explosionLight.intensity = 30 * (1 - explosionProgress);

          explosionParticles.forEach((particle) => {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y -= 0.01;
            particle.userData.velocity.multiplyScalar(0.96);

            const material = particle.material as THREE.MeshBasicMaterial;
            material.opacity = 1 - explosionProgress;
            material.transparent = true;
          });

          const shakeAmount = 0.6 * (1 - explosionProgress);
          camera.position.x += (Math.random() - 0.5) * shakeAmount;
          camera.position.y += (Math.random() - 0.5) * shakeAmount;
        }
      }

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [simData, onComplete]);

  return (
    <div className="relative w-full h-screen">
      <div
        ref={containerRef}
        className="w-full h-screen bg-gradient-to-b from-black via-secondary/20 to-black"
      />

      <div className="absolute top-24 left-8 bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm p-6 rounded-xl max-w-md pointer-events-none">
        <h2 className="text-2xl font-bold mb-3 text-white">
          Trayectoria de Aproximación
        </h2>
        <p className="text-white/80 text-sm leading-relaxed">
          Asteroide tipo{" "}
          <span className="text-primary font-semibold">
            {simData.asteroidType}
          </span>{" "}
          de{" "}
          <span className="text-primary font-semibold">
            {simData.diameter}m
          </span>{" "}
          aproximándose a{" "}
          <span className="text-primary font-semibold">
            {simData.velocity} km/s
          </span>
          .
        </p>
        <p className="text-white/60 text-xs mt-3">
          Mueve el mouse para cambiar el ángulo de visión de la trayectoria.
        </p>
      </div>
    </div>
  );
};
