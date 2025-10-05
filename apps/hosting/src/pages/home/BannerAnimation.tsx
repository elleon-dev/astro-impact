import React, { useEffect } from "react";
import { SpaceAnimation } from "./SpaceAnimation.tsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const BannerAnimation = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const _timeLine = gsap.timeline({
      scrollTrigger: {
        scrub: 1,
      },
    });

    _timeLine
      .to("#banner-key", { scale: 1, duration: 0.2 })
      .to("#astro-impact", { opacity: 0, duration: 0.1 }, "<");
  }, []);

  return (
    <section
      id="banner-key"
      className="overflow-hidden fixed w-full flex justify-center h-screen "
    >
      <img
        id="astro-impact"
        src="./images/astro-impact.png"
        alt="background"
        width={1000}
        height={1000}
        className="scale-125 absolute max-w-6xl object-cover mt-10"
      />
      <SpaceAnimation/>
    </section>
  );
};
