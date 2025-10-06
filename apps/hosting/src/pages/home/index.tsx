import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import React from "react";
import { BannerAnimation } from "@/pages/home/BannerAnimation.tsx";

const Home = () => {
  const navigate = useNavigate();

  const startHome = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      <BannerAnimation />
      <div className="fixed flex flex-col items-center justify-between w-full h-screen">
        <header className="flex justify-between w-full px-16 py-10">
          <button onClick={startHome} className="pointer">
            <img
              src="/logo.svg"
              alt="main-logo"
              width={1000}
              height={1000}
              className="w-full h-full max-w-16 object-cover brightness-0 invert"
            />
          </button>
        </header>
      </div>
      <ChevronDown className="fixed size-20 bottom-8 left-1/2 -translate-x-1/2 gap-2 hover:scale-105 transition-all animate-bounce duration-900 z-50 " />
    </>
  );
};

export default Home;
