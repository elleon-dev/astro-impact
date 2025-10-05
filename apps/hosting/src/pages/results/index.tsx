import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Facebook,
  Link2,
  Linkedin,
  MapPin,
  Pause,
  Play,
  Rocket,
  RotateCcw,
  Share2,
  Twitter,
  Users,
} from "lucide-react";
import { ImpactVideo } from "@/components/ImpactVideo.tsx";
import { Impact3DModel } from "@/components/Impact3DModel.tsx";
import { toast } from "sonner";
import { currentConfig } from "@/config";
import { twMerge } from "tailwind-merge";

type Phase = "3d" | "video" | "results";

export const ResultsPage = () => {
  const location = useLocation();
  const { simData } = location.state || {};
  const [userName, setUserName] = useState("");
  const [resultUrl] = useState(
    `${currentConfig.hostingUrl}/result/${Math.random().toString(36).substr(2, 9)}`,
  );
  const [currentPhase, setCurrentPhase] = useState<Phase>("3d");
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || currentPhase === "results") return;

    let timer: NodeJS.Timeout;

    if (currentPhase === "3d") {
      // Después de 8 segundos, pasar al video
      timer = setTimeout(() => {
        setCurrentPhase("video");
      }, 8000);
    } else if (currentPhase === "video") {
      // Después de 8 segundos, mostrar resultados
      timer = setTimeout(() => {
        setCurrentPhase("results");
        setIsPlaying(false);
      }, 8000);
    }

    return () => clearTimeout(timer);
  }, [currentPhase, isPlaying]);

  const handleRestart = () => {
    setCurrentPhase("3d");
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (currentPhase === "results") {
      // Si estamos en results, reiniciar desde el principio
      setCurrentPhase("3d");
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePhaseChange = (phase: Phase) => {
    setCurrentPhase(phase);
    if (phase !== "results") {
      setIsPlaying(true);
    }
  };

  if (!simData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-8 text-center bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">
            No hay datos de simulación
          </h2>
          <p className="text-white/60 mb-4">Por favor, regresa al simulador</p>
          <Button
            onClick={() => (window.location.href = "/start")}
            className="border-white/10"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Volver al Simulador
          </Button>
        </div>
      </div>
    );
  }

  const calculateImpactData = () => {
    const diameter = simData.diameter;
    const velocity = simData.velocity;

    const mass = (4 / 3) * Math.PI * Math.pow(diameter / 2, 3) * 2500;
    const energy = 0.5 * mass * Math.pow(velocity * 1000, 2);
    const energyMegatons = (energy / 4.184e15).toFixed(2);
    const craterDiameter = (
      diameter *
      20 *
      Math.pow(velocity / 20, 0.44)
    ).toFixed(2);
    const affectedArea = (
      Math.PI * Math.pow(parseFloat(craterDiameter) * 10, 2)
    ).toFixed(0);
    const estimatedCasualties =
      diameter < 100
        ? "10,000 - 50,000"
        : diameter < 500
          ? "500,000 - 2M"
          : "5M - 50M";

    return {
      energyMegatons,
      craterDiameter,
      affectedArea,
      estimatedCasualties,
    };
  };

  const impactData = calculateImpactData();

  const shareOnSocial = (platform: string) => {
    const text = `Acabo de simular un impacto de asteroide de ${simData.diameter}m! Energía: ${impactData.energyMegatons} megatones. ¡Mira los resultados!`;
    const url = encodeURIComponent(resultUrl);
    const encodedText = encodeURIComponent(text);

    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resultUrl);
    toast.success("¡Link copiado al portapapeles!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-md bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                AstroImpact
              </h1>
            </div>

            {/* Controles de simulación - Mobile: Full width, Desktop: Auto */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <div className="flex bg-black/30 backdrop-blur-sm rounded-lg p-1">
                <Button
                  variant={currentPhase === "3d" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePhaseChange("3d")}
                  className="text-xs px-2 sm:px-3"
                >
                  3D
                </Button>
                <Button
                  variant={currentPhase === "video" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePhaseChange("video")}
                  className="text-xs px-2 sm:px-3"
                >
                  Video
                </Button>
                <Button
                  variant={currentPhase === "results" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePhaseChange("results")}
                  className="text-xs px-2 sm:px-3"
                >
                  Datos
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleTogglePlay}
                className="border-white/10 hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRestart}
                className="border-white/10 hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentPhase === "3d" && (
          <Impact3DModel
            simData={simData}
            onComplete={() => isPlaying && setCurrentPhase("video")}
          />
        )}
        {currentPhase === "video" && <ImpactVideo simData={simData} />}
        {currentPhase === "results" && (
          <div
            className={twMerge(
              "bg-gradient-to-b from-black via-secondary/20 to-black pt-20 sm:pt-24 px-3 sm:px-8 pb-4",
              currentPhase === "results" ? "min-h-auto" : "min-h-screen",
            )}
          >
            <div className="container mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
                Visualizaciones del Impacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12">
                {/* Preview Modelo 3D */}
                <button
                  onClick={() => handlePhaseChange("3d")}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm p-4 sm:p-6 border border-white/10 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-full h-32 sm:h-48 bg-gradient-to-br from-secondary/30 to-black/50 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                      <Rocket className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Modelo 3D Interactivo
                    </h3>
                    <p className="text-white/60 text-sm">
                      Visualiza la trayectoria del asteroide en 3D. Click para
                      reproducir.
                    </p>
                    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-primary">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Reproducir animación
                      </span>
                    </div>
                  </div>
                </button>

                {/* Preview Video */}
                <button
                  onClick={() => handlePhaseChange("video")}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm p-4 sm:p-6 border border-white/10 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-full h-32 sm:h-48 bg-gradient-to-br from-destructive/20 to-black/50 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                      <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Simulación de Impacto
                    </h3>
                    <p className="text-white/60 text-sm">
                      Observa la secuencia del impacto y explosión. Click para
                      reproducir.
                    </p>
                    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-primary">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Ver simulación
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Details - Solo visible en fase "results" */}
      {currentPhase === "results" && (
        <div className="bg-gradient-to-t from-black/60 to-transparent backdrop-blur-md mt-8">
          <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Impact Details */}
              <div className="lg:col-span-2">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-white">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                  Detalles del Impacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-white/60">
                          Energía Liberada
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-primary truncate">
                          {impactData.energyMegatons} MT
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Equiv.{" "}
                          {(parseFloat(impactData.energyMegatons) / 15).toFixed(
                            1,
                          )}{" "}
                          bombas Hiroshima
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-white/60">
                          Diámetro del Cráter
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-white truncate">
                          {impactData.craterDiameter} m
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Área: {impactData.affectedArea} km²
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-destructive/10 rounded-lg">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-white/60">
                          Víctimas Estimadas
                        </p>
                        <p className="text-sm sm:text-xl font-bold text-destructive">
                          {impactData.estimatedCasualties}
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Zona impacto directo
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-white/60">
                          Destrucción Infraestructura
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-white">
                          {simData.diameter < 100
                            ? "Local"
                            : simData.diameter < 500
                              ? "Regional"
                              : "Continental"}
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Escala devastación
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Asteroid Parameters */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-5 bg-gradient-to-br from-black/40 to-transparent rounded-xl backdrop-blur-sm">
                  <h4 className="font-semibold mb-2 sm:mb-3 text-white text-sm sm:text-base">
                    Parámetros del Asteroide
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex flex-wrap">
                      <span className="text-white/60">Tipo:</span>
                      <span className="ml-2 font-medium text-white">
                        {simData.asteroidType}
                      </span>
                    </div>
                    <div className="flex flex-wrap">
                      <span className="text-white/60">Diámetro:</span>
                      <span className="ml-2 font-medium text-white">
                        {simData.diameter}m
                      </span>
                    </div>
                    <div className="flex flex-wrap">
                      <span className="text-white/60">Velocidad:</span>
                      <span className="ml-2 font-medium text-white">
                        {simData.velocity} km/s
                      </span>
                    </div>
                    <div className="flex flex-wrap">
                      <span className="text-white/60">Ángulo:</span>
                      <span className="ml-2 font-medium text-white">
                        {simData.angle}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">
                    Compartir Resultados
                  </h3>

                  {/* User Name */}
                  <div className="space-y-2 mb-3 sm:mb-4">
                    <Label
                      htmlFor="userName"
                      className="text-xs sm:text-sm text-white/80"
                    >
                      Tu Nombre
                    </Label>
                    <Input
                      id="userName"
                      placeholder="Ingresa tu nombre"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-black/30 border-white/10 text-white text-sm"
                    />
                  </div>

                  {/* Result URL */}
                  <div className="space-y-2 mb-3 sm:mb-4">
                    <Label className="text-xs sm:text-sm text-white/80">
                      Link del Resultado
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={resultUrl}
                        readOnly
                        className="flex-1 bg-black/30 border-white/10 text-white text-xs sm:text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyLink}
                        className="border-white/10 hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-white/80">
                      Compartir en Redes
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => shareOnSocial("facebook")}
                          className="border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Facebook className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => shareOnSocial("twitter")}
                          className="border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => shareOnSocial("linkedin")}
                          className="border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Linkedin className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="flex-1 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 text-xs sm:text-sm"
                        onClick={() => shareOnSocial("facebook")}
                      >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Compartir
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => (window.location.href = "/start")}
                  variant="default"
                  className="w-full border-white/10 hover:bg-white/10 text-sm sm:text-base"
                >
                  <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Nueva Simulación
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
