import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Object3D } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
interface Props {
  setLoading: (loading: boolean) => void;
}

export const SpaceAnimation = ({ setLoading }: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const asteroidRef = useRef<Object3D | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Crear el manager ANTES de cualquier loader
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      setLoading(false);
      if (mountRef.current && renderer) {
        mountRef.current.appendChild(renderer.domElement);
        animate();
      }
      console.log("Recursos cargados correctamente");
    };
    manager.onError = (url) => {
      setLoading(false);
      console.error(`Error cargando ${url}`);
    };

    // 2. Crear loaders con el manager
    const textureLoader = new THREE.TextureLoader(manager);
    const gltfLoader = new GLTFLoader(manager);

    // 3. Cargar recursos (texturas y modelos)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.3,
      1000,
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Inicializar el renderer aquí, pero NO montar el canvas aún
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Fondo de estrellas para la escena
    scene.background = textureLoader.load("/textures/background/stars.jpg");

    // Plano negro semitransparente para oscurecer el fondo
    const darkPlaneGeometry = new THREE.PlaneGeometry(2000, 2000);
    const darkPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const darkPlane = new THREE.Mesh(darkPlaneGeometry, darkPlaneMaterial);
    darkPlane.position.set(0, 0, -900);
    scene.add(darkPlane);

    const earthDay = textureLoader.load("/textures/planet/8k_earth_daymap.jpg");
    const earthNight = textureLoader.load(
      "/textures/planet/8k_earth_nightmap.jpg",
    );
    const earthBump = textureLoader.load(
      "/textures/planet/earth_bump_roughness_clouds_4096.jpg",
    );
    const earthNormal = textureLoader.load(
      "/textures/planet/8k_earth_normal_map.jpg",
    );
    const earthClouds = textureLoader.load(
      "/textures/planet/8k_earth_clouds.jpg",
    );
    const earthLights = textureLoader.load(
      "/textures/planet/earth_lights_2048.png",
    );
    const earthSpecular = textureLoader.load(
      "/textures/planet/8k_earth_specular_map.jpg",
    );
    const atmosphereTexture = textureLoader.load(
      "/textures/planet/earth_atmos_2048.jpg",
    );

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthDay,
      bumpMap: earthBump,
      bumpScale: 0.08,
      normalMap: earthNormal,
      metalnessMap: earthClouds,
      metalness: 0.1,
      emissive: new THREE.Color(0x222244),
      emissiveMap: earthNight,
      emissiveIntensity: 0.7,
    });

    const geometry = new THREE.SphereGeometry(3, 128, 128);
    const earth = new THREE.Mesh(geometry, earthMaterial);
    earth.position.set(0, -2.5, 0);
    earth.castShadow = false;
    earth.receiveShadow = true;
    scene.add(earth);
    earthRef.current = earth;

    const cloudsGeometry = new THREE.SphereGeometry(3.03, 128, 128);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    clouds.position.copy(earth.position);
    cloudsRef.current = clouds;
    scene.add(clouds);

    const atmosphereGeometry = new THREE.SphereGeometry(0.5, 128, 128);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map: atmosphereTexture,
      color: 0x000000,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.copy(earth.position);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);

    let asteroid: Object3D | null = null;
    gltfLoader.load(
      "/textures/asteroid/ceres/asteroid_ceres.glb",
      (gltf) => {
        asteroid = gltf.scene;
        asteroid.scale.set(1, 1, 1);
        asteroid.position.set(3, 0, -60);
        asteroid.rotation.set(0, 0, 0);
        scene.add(asteroid);
        asteroidRef.current = asteroid;
        setupGSAP();
      },
      undefined,
      (error) => {
        console.error("Error cargando el modelo GLTF:", error);
      },
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    let frameId: number;
    const animate = () => {
      if (earthRef.current) {
        if (cloudsRef.current) {
          cloudsRef.current.position.copy(earthRef.current.position);
          cloudsRef.current.rotation.copy(earthRef.current.rotation);
        }
        if (atmosphereRef.current) {
          atmosphereRef.current.position.copy(earthRef.current.position);
          atmosphereRef.current.rotation.copy(earthRef.current.rotation);
        }
        earthRef.current.rotation.y += 0.00005;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    function setupGSAP() {
      if (!earthRef.current || !asteroidRef.current) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#banner-key",
          start: "top top",
          end: "+=3000",
          scrub: 3,
        },
      });
      if (
        earthRef.current &&
        cloudsRef.current &&
        atmosphereRef.current &&
        "position" in earthRef.current &&
        "rotation" in earthRef.current
      ) {
        tl.to(earthRef.current.position, { x: 0, y: -4, z: 4 })
          .to(earthRef.current.rotation, { y: Math.PI * 0.2 }, "<")
          .to(cloudsRef.current.position, { x: 0, y: -4, z: 4 }, "<")
          .to(cloudsRef.current.rotation, { y: Math.PI * 0.2 }, "<")
          .to(atmosphereRef.current.position, { x: 0, y: -4, z: 4 }, "<")
          .to(atmosphereRef.current.rotation, { y: Math.PI * 0.2 }, "<");
      }
      if (
        "position" in asteroidRef.current &&
        "rotation" in asteroidRef.current
      ) {
        tl.to(
          asteroidRef.current.position,
          {
            x: 2,
            y: 0,
            z: 10,
          },
          "<",
        ).to(
          asteroidRef.current.rotation,
          {
            y: Math.PI * 0.5,
            x: Math.PI * 0.2,
          },
          "<",
        );
      }
    }

    // Limpieza
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    />
  );
};
