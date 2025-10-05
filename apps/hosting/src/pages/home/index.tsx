import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {Rocket, SquareMenu} from "lucide-react";
import React from "react";
import {BannerAnimation} from "@/pages/home/BannerAnimation.tsx";

const Home = () => {
  const navigate = useNavigate();

  const handleStartSimulation = () => {
    navigate("/start");
  };

  return (
      <>
          <BannerAnimation />
          <div className="fixed flex flex-col items-center justify-between w-full h-screen">
              <header className="flex justify-between w-full p-16">
                  <img
                      src="./logo.svg"
                      alt="main-logo"
                      width={1000}
                      height={1000}
                      className="w-full h-full max-w-16 object-cover brightness-0 invert"
                  />
                  <SquareMenu className="size-12 h-full" />
              </header>
          </div>
          <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
              <Button
                  onClick={handleStartSimulation}
                  size="lg"
                  className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                  Iniciar Simulación
              </Button>
          </div>          <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
          <Button
              onClick={handleStartSimulation}
              size="lg"
              className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
              Iniciar Simulación
          </Button>
      </div>          <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
          <Button
              onClick={handleStartSimulation}
              size="lg"
              className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
              Iniciar Simulación
          </Button>
      </div>          <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
          <Button
              onClick={handleStartSimulation}
              size="lg"
              className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
              Iniciar Simulación
          </Button>
      </div>

      </>

  );
};

export default Home;