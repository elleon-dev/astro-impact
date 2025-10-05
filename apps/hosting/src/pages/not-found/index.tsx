import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { AlertTriangle, Home } from "lucide-react";

export const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <Card className="max-w-sm sm:max-w-md w-full p-6 sm:p-8 text-center space-y-4 sm:space-y-6 bg-gradient-to-br from-background to-muted/20 shadow-2xl">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="p-3 sm:p-4 rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-7xl font-bold text-foreground mb-2">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Página No Encontrada
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground bg-muted/10 rounded-lg p-3 sm:p-4">
            <p className="font-mono break-all">
              Ruta intentada: <span className="text-destructive">{location.pathname}</span>
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => window.location.href = "/"}
            size="lg"
            className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Inicio
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="w-full text-sm sm:text-base"
          >
            Página Anterior
          </Button>
        </div>
      </Card>
    </div>
  );
};

