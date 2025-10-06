import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Object3D } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const AsteroidsAnimation = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const bennuRef = useRef<Object3D | null>(null);
  const vestaRef = useRef<Object3D | null>(null);
  const ceresRef = useRef<Object3D | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Guardar el elemento de montaje localmente para evitar acceder a ref en cleanup
    const mount = mountRef.current;

    // Crear el manager para cargar todos los asteroides
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      console.log("Asteroides cargados correctamente");
      if (mount && renderer) {
        mount.appendChild(renderer.domElement);
        animate();
        setupGSAP();
      }
    };
    manager.onError = (url) => {
      console.error(`Error cargando asteroide: ${url}`);
    };

    // Crear loaders con el manager
    const textureLoader = new THREE.TextureLoader(manager);
    const gltfLoader = new GLTFLoader(manager);

    // Crear escena y cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight, // Aspect ratio de la ventana completa
      0.3,
      1000,
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // Inicializar el renderer para toda la pantalla
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;

    // Fondo de estrellas (mismo que SpaceAnimation)
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
    darkPlane.position.set(0, 0, -50);
    scene.add(darkPlane);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Materiales base para asteroides (valores ajustables)
    const asteroidBennuMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Ceres: ligeramente más oscuro por defecto
    const asteroidCeresMaterial = new THREE.MeshStandardMaterial({
      color: 0x545454, // más oscuro que 0x404040
      metalness: 0.15,
      roughness: 0.15,
    });

    const asteroidVestaMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Cargar asteroide Bennu (esquina superior izquierda) - MÁS GRANDE
    gltfLoader.load(
      "/textures/asteroid/bennu/asteroid_bennu.glb",
      (gltf) => {
        const bennu = gltf.scene;
        bennu.scale.set(1, 1, 1); // Aumentado a 2x para que se vea más grande
        bennu.position.set(-1.7, 0.5, 97); // Más cerca para mejor acercamiento
        bennu.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = asteroidBennuMaterial.clone();
          }
        });
        scene.add(bennu);
        bennuRef.current = bennu;
      },
      undefined,
      (error) => console.error("Error cargando Bennu:", error),
    );

    // Cargar asteroide Vesta (esquina inferior izquierda)
    gltfLoader.load(
      "/textures/asteroid/vesta/vesta.glb",
      (gltf) => {
        const vesta = gltf.scene;
        vesta.scale.set(1, 1, 1);
        vesta.position.set(-70, -30, -15);
        vesta.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = asteroidVestaMaterial.clone();
          }
        });
        scene.add(vesta);
        vestaRef.current = vesta;
      },
      undefined,
      (error) => console.error("Error cargando Vesta:", error),
    );

    // Cargar asteroide Ceres (esquina inferior derecha) - MÁS GRANDE
    gltfLoader.load(
      "/textures/asteroid/ceres/asteroid_ceres.glb",
      (gltf) => {
        const ceres = gltf.scene;
        ceres.scale.set(1, 1, 1); // Aumentado a 2x para que se vea más grande
        ceres.position.set(15, 1, 78); // Ajustado para mejor acercamiento
        // Reutilizar el material/textura embebida en el GLTF si existe
        ceres.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            const mesh = child as THREE.Mesh;
            // Si el material del GLTF tiene un mapa (textura), clonarlo y ajustarlo
            const currentMat = mesh.material;
            if (
              currentMat instanceof THREE.MeshStandardMaterial &&
              currentMat.map
            ) {
              const newMat = currentMat.clone();
              // Oscurecer ligeramente la textura y hacerla más mate
              newMat.color = new THREE.Color(0x343434);
              newMat.metalness = 0.15;
              newMat.roughness = 0.95;
              newMat.envMapIntensity = 0.6;
              mesh.material = newMat;
            } else {
              // Si no hay textura embebida, usar el material por defecto más oscuro
              mesh.material = asteroidCeresMaterial.clone();
            }
          }
        });
        scene.add(ceres);
        ceresRef.current = ceres;
      },
      undefined,
      (error) => console.error("Error cargando Ceres:", error),
    );

    // Loop de animación
    let frameId: number;
    const animate = () => {
      // Rotar cada asteroide lentamente
      if (bennuRef.current) {
        bennuRef.current.rotation.y += 0.0005;
        bennuRef.current.rotation.x += 0.0005;
      }
      if (vestaRef.current) {
        vestaRef.current.rotation.y += 0.0005;
        vestaRef.current.rotation.x += 0.0005;
      }
      if (ceresRef.current) {
        ceresRef.current.rotation.y += 0.0005;
        ceresRef.current.rotation.x += 0.0005;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    // Función para configurar animaciones GSAP
    function setupGSAP() {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "2500px top", // Coincide con el timeline 3 de BannerAnimation
          end: "3500px top", // Coincide con el final de asteroids en BannerAnimation
          scrub: 1,
          invalidateOnRefresh: true, // Añadido para mejor manejo de resize
        },
      });

      //Esquina superior izquierda
      if (bennuRef.current) {
        tl.to(
          bennuRef.current.position,
          {
            x: -1.7,
            y: 0.5,
            z: 97.3,
            duration: 1,
          },
          0,
        );
      }
      //Esquina inferior izquierda
      if (vestaRef.current) {
        tl.to(
          vestaRef.current.position,
          {
            x: -70,
            y: -30,
            z: -5,
            duration: 1,
          },
          0,
        );
      }
      //Esquina superior derecha
      if (ceresRef.current) {
        tl.to(
          ceresRef.current.position,
          {
            x: 15,
            y: 1,
            z: 80,
            duration: 1,
          },
          0,
        );
      }
    }

    // Limpieza
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
};
