import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SpaceAnimation } from "./SpaceAnimation.tsx";
import { AsteroidsAnimation } from "./AsteroidsAnimation.tsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader } from "@/components/ui/loader.tsx";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";

export const BannerAnimation = () => {
  const navigate = useNavigate();
  const handleStartSimulation = () => {
    navigate("/start");
    window.scrollTo(0, 0);
  };
  const [loading, setLoading] = useState(true);

  // useLayoutEffect se ejecuta ANTES del render visual
  useLayoutEffect(() => {
    // Resetear scroll al cargar la página (antes del primer render)
    window.scrollTo(0, 0);

    // Resetear todos los estilos inline que GSAP pudo haber dejado
    gsap.set("#astro-impact", { clearProps: "all" });
    gsap.set("#banner-key", { clearProps: "all" });
    gsap.set("#info-banner", { clearProps: "all" });
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Estados iniciales
    gsap.set("#astro-impact", { scale: 1.25, opacity: 1 });
    gsap.set("#banner-key", { opacity: 1, pointerEvents: "auto" });
    gsap.set("#info-banner", { opacity: 0, pointerEvents: "none" });
    gsap.set("#you-know", { opacity: 0 });
    gsap.set("#asteroids-key", { opacity: 0, pointerEvents: "none" });
    gsap.set("#asteroids-text", { opacity: 0 });
    gsap.set("#simulation-key", { opacity: 0, pointerEvents: "none" });

    // Timeline 1: Banner fade out
    const bannerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "+=1200",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    bannerTimeline
      .to("#astro-impact", { scale: 1, opacity: 0, duration: 0.5 })
      .to(
        "#banner-key",
        { opacity: 0, pointerEvents: "none", duration: 0.3 },
        "-=0.2",
      )
      .set("#info-banner", { pointerEvents: "auto" });

    // Timeline 2: Info appears and fades
    const infoTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "1200px top",
        end: "2500px top", // Ajustado para enlazar con timeline 3
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    infoTimeline
      .to("#info-banner", { opacity: 1, duration: 0.4 })
      .to("#you-know", { opacity: 1, duration: 0.4 }, "<")
      .to("#info-banner", { opacity: 0, duration: 0.4 }, "+=0.5")
      .to("#you-know", { opacity: 0, duration: 0.4 }, "<")
      .set("#info-banner", { pointerEvents: "none" })
      .set("#asteroids-key", { pointerEvents: "auto" });

    // Timeline 3: Asteroids appear and fade
    const asteroidsTimeLine = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "2500px top",
        end: "3500px top",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    asteroidsTimeLine
      .to("#asteroids-key", { opacity: 1, duration: 0.4 })
      .to("#asteroids-text", { opacity: 1, duration: 0.4 }, "<")
      .to("#asteroids-key", { opacity: 0, duration: 0.4 }, "+=0.5")
      .to("#asteroids-text", { opacity: 0, duration: 0.4 }, "<")
      .set("#asteroids-key", { pointerEvents: "none" })
      .set("#simulation-key", { pointerEvents: "auto" });

    // Timeline 4: Simulation appears
    const simulationTimeLine = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "3500px top",
        end: "4500px top", // Aumentado para dar más espacio
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    simulationTimeLine.to("#simulation-key", { opacity: 1, duration: 0.5 });

    // Crear un div espaciador para asegurar que hay suficiente scroll
    const spacer = document.createElement("div");
    spacer.style.height = "5000px"; // Un poco más que el último end
    document.body.appendChild(spacer);

    ScrollTrigger.refresh();

    // Cleanup mejorado
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (spacer && spacer.parentNode) {
        spacer.parentNode.removeChild(spacer);
      }
    };
  }, []);

  return (
    <>
      <section
        id="banner-key"
        className="overflow-hidden fixed w-full flex justify-center h-screen z-[10]"
      >
        <img
          id="astro-impact"
          src="./images/astro-impact.png"
          alt="background"
          width={1000}
          height={1000}
          className="scale-125 absolute max-w-7xl object-cover mt-10 "
        />
        <SpaceAnimation setLoading={setLoading} />
        {loading && <Loader text="Loading..." />}
      </section>

      <section
        id="info-banner"
        className="overflow-hidden fixed w-full h-screen flex items-center justify-center opacity-0 z-[9]"
      >
        <span
          id="you-know"
          className="w-full h-screen grid place-items-center font-venus text-6xl text-primary text-center"
        >
          WHAT WOULD AN ASTEROID COLLISION WITH EARTH LOOK LIKE?
        </span>
      </section>
      <section
        id="asteroids-key"
        className="overflow-hidden fixed w-full h-screen flex items-center justify-center opacity-0 z-[8]"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <AsteroidsAnimation />
        </div>

        <span
          id="asteroids-text"
          className="relative text-6xl text-primary font-venus opacity-0 text-center max-w-6xl "
        >
          SIMULATE THE IMPACT OF THESE ASTEROIDS
        </span>
      </section>

      <section
        id="simulation-key"
        className="overflow-hidden fixed w-full h-screen flex opacity-0 z-[11]"
      >
        {/* Columna izquierda: texto */}
        <div className=" w-1/2 h-full flex flex-col items-center justify-center gap-6 bg-black px-12">
          <h2 className="text-4xl text-primary font-venus text-center">
            VISUALIZE THE IMPACT OF YOUR ASTEROID AND SEE FOR YOURSELF
          </h2>
          <p className="text-xs text-primary font-venus text-center max-w-md">
            THIS APPLICATION HAS BEEN DEVELOPED FOR EDUCATIONAL PURPOSES AND IS
            NOT INTENDED TO REPLACE INFORMATION FROM NASA.
          </p>
          <Button
            onClick={handleStartSimulation}
            size="lg"
            className="cursor-pointer hover:scale-110 transition-all duration-300 relative z-20"
          >
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Simulation
          </Button>

          {/* Overlay difuminado (borde derecho) */}
          <div
            className="absolute top-0 right-0 h-full w pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.9), transparent)",
              filter: "blur(8px)",
            }}
          />
        </div>

        {/* Columna derecha: video */}
        <div className="w-1/2 h-full">
          <video
            src="/videos/simulation-video.webm"
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </>
  );
};
