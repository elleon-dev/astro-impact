import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleStartSimulation = () => {
    navigate("/start");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <Card className="max-w-sm sm:max-w-md w-full p-6 sm:p-8 text-center space-y-4 sm:space-y-6 bg-gradient-to-br from-background to-muted/20 shadow-2xl">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="p-3 sm:p-4 rounded-full bg-primary/10 text-primary">
              <Rocket className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              AstroImpact
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Simulador de Impactos de Asteroides
            </p>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2 sm:px-0">
            Explora los efectos devastadores de impactos de asteroides en la Tierra.
            Ajusta parámetros como tamaño, velocidad y composición para ver las consecuencias.
          </p>
        </div>

        <Button
          onClick={handleStartSimulation}
          size="lg"
          className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
        >
          <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
          Iniciar Simulación
        </Button>
      </Card>
    </div>
  );
};

export default Home;