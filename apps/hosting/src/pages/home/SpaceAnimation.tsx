import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {Object3D} from "three";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export const SpaceAnimation = () => {

  const mountRef = useRef(null);
  const asteroidRef = useRef(null);
  const earthRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.3,
      1000,
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const textureLoader = new THREE.TextureLoader();
    const earthDay = textureLoader.load("/textures/planet/earth_day_4096.jpg");
    const earthNight = textureLoader.load(
      "/textures/planet/earth_night_4096.jpg",
    );
    const earthBump = textureLoader.load(
      "/textures/planet/earth_bump_roughness_clouds_4096.jpg",
    );
    const earthNormal = textureLoader.load(
      "/textures/planet/earth_normal_2048.jpg",
    );
    const earthClouds = textureLoader.load(
      "/textures/planet/earth_clouds_1024.png",
    );
    const earthLights = textureLoader.load(
      "/textures/planet/earth_lights_2048.png",
    );

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthDay,
      bumpMap: earthBump,
      bumpScale: 0.08,
      normalMap: earthNormal,
      roughness: 0.7,
      metalness: 0.1,
      emissive: new THREE.Color(0x222244),
      emissiveMap: earthNight,
      emissiveIntensity: 0.7,
    });

    const geometry = new THREE.SphereGeometry(3, 128, 128);
    const earth = new THREE.Mesh(geometry, earthMaterial);
    earth.position.set(0, -2.5, 0);
    scene.add(earth);
    earthRef.current = earth;

    // Capa de nubes (opcional, visual extra)
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
    scene.add(clouds);

    // Atmósfera (opcional, visual extra)
    const atmosphereGeometry = new THREE.SphereGeometry(3.1, 128, 128);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.copy(earth.position);
    scene.add(atmosphere);

    // Asteroide
    const baseColor = textureLoader.load(
      "/textures/asteroid/textures/material_0_baseColor.png",
    );
    const normalMap = textureLoader.load(
      "/textures/asteroid/textures/material_0_normal.png",
    );
    const metallicRoughness = textureLoader.load(
      "/textures/asteroid/textures/material_0_metallicRoughness.png",
    );

    const loader = new GLTFLoader();
    let asteroid: Object3D | null = null;
    loader.load(
      "/textures/asteroid/scene.gltf",
      (gltf) => {
        asteroid = gltf.scene;
        asteroid.scale.set(1, 1, 1);
        // Posición inicial: al fondo, arriba a la derecha
        asteroid.position.set(0, 30, -100);
        asteroid.rotation.set(0, 0, 0);
        asteroid.traverse(({isObject3D,customDistanceMaterial}) => {
          if (isObject3D) {
              customDistanceMaterial = new THREE.MeshStandardMaterial({
              map: baseColor,
              normalMap: normalMap,
              metalnessMap: metallicRoughness,
              roughnessMap: metallicRoughness,
              metalness: 1.0,
              roughness: 1.0,
            });
          }
        });
        scene.add(asteroid!);
        asteroidRef.current = asteroid;
        // Inicia animaciones GSAP cuando el asteroide está cargado
        setupGSAP();
      },
      undefined,
      (error) => {
        console.error('Error cargando el modelo GLTF:', error);
      }
    );

    // Luces para el asteroide
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animación
    let frameId: number;
    const animate = () => {
      // Rotación continua de la tierra
      if (earthRef.current && 'rotation' in earthRef.current && earthRef.current.rotation) {
        earthRef.current.rotation.y += 0.00005;
      }
      // Animación simple de rotación del asteroide
      if (asteroidRef.current && 'rotation' in asteroidRef.current && asteroidRef.current.rotation) {
        asteroidRef.current.rotation.y += 0.01;
        asteroidRef.current.rotation.x += 0.005;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // GSAP para scroll y animaciones sincronizadas
    function setupGSAP() {
      if (!earthRef.current || !asteroidRef.current) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#banner-key",
          start: "top top",
          end: "+=3000",
          scrub: 10,
        },
      });
      // Tierra: igual que antes
      if ('position' in earthRef.current && 'rotation' in earthRef.current) {
        tl.to(earthRef.current.position, {
          x: 0,
          z: 3,
        })
          .to(
            earthRef.current.rotation,
            {
              y: Math.PI * 0.2,
            },
            "<",
          );
      }
      // Asteroide: se mueve al lado contrario y se acerca
      if ('position' in asteroidRef.current && 'rotation' in asteroidRef.current) {
        tl.to(
          asteroidRef.current.position,
          {
            x: 0, // lado opuesto
            y: -5, // baja
            z: 5, // se acerca
          },
          "<",
        )
        // Asteroide: rota más rápido
        .to(
          asteroidRef.current.rotation,
          {
            y: Math.PI * 4,
            x: Math.PI * 2,
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
