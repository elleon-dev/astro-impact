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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-gradient-to-br from-background to-muted/20 shadow-2xl">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Rocket className="w-12 h-12" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              AstroImpact
            </h1>
            <p className="text-muted-foreground">
              Simulador de Impactos de Asteroides
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Explora los efectos devastadores de impactos de asteroides en la Tierra. 
            Ajusta parámetros como tamaño, velocidad y composición para ver las consecuencias.
          </p>
        </div>

        <Button 
          onClick={handleStartSimulation}
          size="lg"
          className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Rocket className="w-5 h-5" />
          Iniciar Simulación
        </Button>
      </Card>
    </div>
  );
};

export default Home;