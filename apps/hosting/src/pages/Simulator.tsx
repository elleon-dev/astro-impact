import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AsteroidScene } from "@/components/AsteroidScene";
import { Rocket, Flame, Gauge, Target, Ruler, Palette, Zap, MapPin } from "lucide-react";

interface SimulationData {
  asteroidType: string;
  diameter: number;
  velocity: number;
  angle: number;
  composition: string;
}

const Simulator = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [simData, setSimData] = useState<SimulationData>({
    asteroidType: "rocky",
    diameter: 100,
    velocity: 20,
    angle: 45,
    composition: "stone",
  });

  const calculateImpactEnergy = () => {
    const mass = (4/3) * Math.PI * Math.pow(simData.diameter/2, 3) * 2500;
    const energy = 0.5 * mass * Math.pow(simData.velocity * 1000, 2);
    return (energy / 4.184e15).toFixed(2);
  };

  const calculateCraterDiameter = () => {
    return (simData.diameter * 20 * Math.pow(simData.velocity / 20, 0.44)).toFixed(2);
  };

  const getComparison = () => {
    const energy = parseFloat(calculateImpactEnergy());
    if (energy < 1) return { event: "Explosión de un edificio", equivalent: "~0.5 megatones" };
    if (energy < 10) return { event: "Evento de Tunguska (1908)", equivalent: "~15 megatones - devastó 2,000 km²" };
    if (energy < 100) return { event: "Bomba del Zar", equivalent: "~50 megatones - la más potente detonada" };
    if (energy < 1000) return { event: "Impacto de Chicxulub", equivalent: "~100 millones de megatones - extinción dinosaurios" };
    return { event: "Evento de extinción masiva", equivalent: "Catástrofe planetaria" };
  };

  const getAsteroidColor = () => {
    switch (simData.asteroidType) {
      case "metallic": return "#8b8b8b - Gris metálico";
      case "icy": return "#b0d4e3 - Azul hielo";
      default: return "#6b4423 - Marrón rocoso";
    }
  };

  const handleGenerateResult = () => {
    navigate("/results", { state: { simData } });
  };

  const comparison = getComparison();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header Controls - Absolute Position */}
      <header className="absolute top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-b from-black/40 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h1 className="text-base sm:text-lg font-bold text-white">
                  AstroImpact
                </h1>
              </div>
              <Input
                placeholder="Tu nombre"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-32 sm:w-40 lg:w-48 h-8 sm:h-9 bg-black/30 backdrop-blur-sm text-white placeholder:text-white/50 text-sm"
              />
            </div>
            
            {/* Controls - Mobile: Full width, Desktop: Flex */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full lg:flex-1 lg:max-w-4xl">
              {/* Row 1: Asteroid Type & Composition */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:min-w-[140px]">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <Select value={simData.asteroidType} onValueChange={(value) => setSimData({...simData, asteroidType: value})}>
                    <SelectTrigger className="h-8 sm:h-9 bg-black/30 backdrop-blur-sm text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rocky">Rocoso (C-type)</SelectItem>
                      <SelectItem value="metallic">Metálico (M-type)</SelectItem>
                      <SelectItem value="icy">Helado (P-type)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={simData.composition} onValueChange={(value) => setSimData({...simData, composition: value})}>
                  <SelectTrigger className="h-8 sm:h-9 w-24 sm:w-[120px] bg-black/30 backdrop-blur-sm text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stone">Piedra</SelectItem>
                    <SelectItem value="iron">Hierro</SelectItem>
                    <SelectItem value="ice">Hielo</SelectItem>
                    <SelectItem value="mixed">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                {/* Diameter */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap text-white">Ø {simData.diameter}m</Label>
                  <Slider
                    value={[simData.diameter]}
                    onValueChange={([value]) => setSimData({...simData, diameter: value})}
                    min={10}
                    max={1000}
                    step={10}
                    className="flex-1"
                  />
                </div>

                {/* Velocity */}
                <div className="flex items-center gap-2">
                  <Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                  <Label className="text-xs whitespace-nowrap text-white">{simData.velocity} km/s</Label>
                  <Slider
                    value={[simData.velocity]}
                    onValueChange={([value]) => setSimData({...simData, velocity: value})}
                    min={11}
                    max={72}
                    step={1}
                    className="flex-1"
                  />
                </div>

                {/* Angle */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap text-white">{simData.angle}°</Label>
                  <Slider
                    value={[simData.angle]}
                    onValueChange={([value]) => setSimData({...simData, angle: value})}
                    min={0}
                    max={90}
                    step={5}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen 3D Scene */}
      <div className="absolute inset-0 w-full h-full">
        <AsteroidScene simData={simData} />
      </div>

      {/* Left Card - Asteroid Data - Mobile: Bottom drawer, Desktop: Side panel */}
      <Card className="absolute left-2 sm:left-4 lg:left-6 top-32 sm:top-28 lg:top-24 w-[calc(100vw-1rem)] sm:w-80 lg:w-80 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-lg z-40 max-h-[calc(100vh-20rem)] sm:max-h-none overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Datos del Meteorito
          </h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
              <Ruler className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground">Tamaño</p>
                <p className="font-semibold text-foreground">{simData.diameter}m de diámetro</p>
                <p className="text-xs text-muted-foreground">
                  {simData.diameter < 50 ? "Pequeño" : simData.diameter < 200 ? "Mediano" : simData.diameter < 500 ? "Grande" : "Masivo"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
              <Palette className="w-4 h-4 text-secondary mt-0.5" />
              <div>
                <p className="text-muted-foreground">Color y Tipo</p>
                <p className="font-semibold text-foreground">{getAsteroidColor()}</p>
                <p className="text-xs text-muted-foreground">{simData.composition}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
              <Zap className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground">Velocidad</p>
                <p className="font-semibold text-foreground">{simData.velocity} km/s</p>
                <p className="text-xs text-muted-foreground">
                  {(simData.velocity * 3600).toFixed(0)} km/h
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
              <MapPin className="w-4 h-4 text-destructive mt-0.5" />
              <div>
                <p className="text-muted-foreground">Ángulo de Impacto</p>
                <p className="font-semibold text-foreground">{simData.angle}°</p>
                <p className="text-xs text-muted-foreground">
                  {simData.angle < 30 ? "Rasante" : simData.angle < 60 ? "Oblicuo" : "Vertical"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer with Results Summary and Comparisons */}
      <footer className="absolute bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-t from-black/50 to-transparent">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Results Grid - Mobile: 2 cols, Desktop: 4 cols */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent">
                <p className="text-xs text-muted-foreground">Energía de Impacto</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{calculateImpactEnergy()}</p>
                <p className="text-xs text-muted-foreground">Megatones</p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent">
                <p className="text-xs text-muted-foreground">Diámetro del Cráter</p>
                <p className="text-lg sm:text-xl font-bold text-secondary">{calculateCraterDiameter()}</p>
                <p className="text-xs text-muted-foreground">Metros</p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent col-span-2 lg:col-span-1">
                <p className="text-xs text-muted-foreground">Evento Comparable</p>
                <p className="text-xs sm:text-sm font-bold text-primary line-clamp-2">{comparison.event}</p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent col-span-2 lg:col-span-1">
                <p className="text-xs text-muted-foreground">Equivalencia</p>
                <p className="text-xs font-semibold text-foreground line-clamp-2">{comparison.equivalent}</p>
              </div>
            </div>
            
            {/* Generate Button - Full width on mobile */}
            <div className="flex justify-center">
              <Button
                onClick={handleGenerateResult}
                size="lg"
                className="gap-2 shadow-impact hover:shadow-glow transition-all duration-300 bg-primary/90 backdrop-blur w-full sm:w-auto"
              >
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Generar Resultado</span>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Simulator;
