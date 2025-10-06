import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Link2,
  MapPin,
  Pause,
  Play,
  Rocket,
  RotateCcw,
  Users,
} from "lucide-react";
import { ImpactVideo } from "@/components/ImpactVideo.tsx";
import { Impact3DModel } from "@/components/Impact3DModel.tsx";
import { toast } from "sonner";
import { currentConfig } from "@/config";
import { twMerge } from "tailwind-merge";
import { useQuery } from "@/hooks/useQuery.ts";
import { fetchSimulation } from "@/firebase/collections";
import { ScrollTop } from "@/ScrollTop.ts";

type Phase = "3d" | "video" | "results";

export const ResultsPage = () => {
  const { id } = useQuery<{ id: string | undefined }>();
  const [simData, setSimData] = useState(undefined);

  useEffect(() => {
    (async () => {
      const simulationData = await fetchSimulation(id);
      console.log("simulationData: ", simulationData);
      setSimData(simulationData);
    })();
  }, []);

  const [resultUrl] = useState(
    `${currentConfig.hostingUrl}/result?id=${simData?.id || id}`,
  );
  const [currentPhase, setCurrentPhase] = useState<Phase>("3d");
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || currentPhase === "results") return;

    let timer: NodeJS.Timeout;

    if (currentPhase === "3d") {
      timer = setTimeout(() => {
        setCurrentPhase("video");
      }, 8000);
    } else if (currentPhase === "video") {
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
            No simulation data available
          </h2>
          <p className="text-white/60 mb-4">Please return to the simulator</p>
          <Button
            onClick={() => (window.location.href = "/start")}
            className="border-white/10"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Back to Simulator
          </Button>
        </div>
      </div>
    );
  }

  const calculateImpactData = () => {
    if (simData?.impact) {
      return {
        energyMegatons: (simData.impact.energy / 1e6).toFixed(2),
        craterDiameter: (simData.impact.craterDiameter / 1000).toFixed(2),
        affectedArea: (
          Math.PI * Math.pow((simData.impact.craterDiameter / 1000) * 10, 2)
        ).toFixed(0),
        estimatedCasualties: simData.impact.comparison?.equivalent || "N/A",
      };
    }

    const diameter = Number(simData?.simulation?.diameter) || 0;
    const velocity = Number(simData?.simulation?.velocity) || 0;
    const composition = simData?.simulation?.composition || "stone";

    if (diameter <= 0 || velocity <= 0) {
      return {
        energyMegatons: "0",
        craterDiameter: "0",
        affectedArea: "0",
        estimatedCasualties: "N/A",
      };
    }

    // Get density based on composition
    const getDensity = (composition: string) => {
      switch (composition) {
        case "iron":
          return 7800; // kg/m³
        case "ice":
          return 917; // kg/m³
        case "stone":
          return 2500; // kg/m³
        case "mixed":
          return 3000; // kg/m³
        default:
          return 2500;
      }
    };

    const density = getDensity(composition);
    const radius = diameter / 2; // meters
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m³
    const mass = volume * density; // kg
    const velocityMs = velocity * 1000; // convert km/s to m/s
    const kineticEnergy = 0.5 * mass * Math.pow(velocityMs, 2); // joules

    // Convert to megatons TNT (1 megaton = 4.184 × 10^15 joules)
    const energyMegatons = kineticEnergy / 4.184e15;

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
      energyMegatons:
        energyMegatons < 0.001
          ? energyMegatons.toExponential(2)
          : energyMegatons < 1
            ? energyMegatons.toFixed(4)
            : energyMegatons < 1000
              ? energyMegatons.toFixed(2)
              : energyMegatons.toExponential(2),
      craterDiameter,
      affectedArea,
      estimatedCasualties,
    };
  };

  const impactData = calculateImpactData();

  const shareOnSocial = (platform: string) => {
    const diameter = Number(simData?.simulation?.diameter) || 0;
    const text = `I just simulated an asteroid impact of ${diameter}m! Energy: ${impactData.energyMegatons} megatons. Check out the results!`;
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
    toast.success("Link copied to clipboard!");
  };

  console.log("simData: ", simData);

  return (
    <ScrollTop>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="backdrop-blur-md bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  AstroImpact
                </h1>
              </div>

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
                    Data
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

        <main className="flex-1">
          {currentPhase === "3d" && (
            <Impact3DModel
              simData={simData}
              onComplete={() => isPlaying && setCurrentPhase("video")}
            />
          )}
          {currentPhase === "video" && (
            <ImpactVideo
              simData={simData}
              handlePhaseChange={handlePhaseChange}
            />
          )}
        </main>
        {currentPhase === "results" && (
          <>
            <div className="bg-gradient-to-t mt-[7rem] from-black/60 to-transparent backdrop-blur-md">
              <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <h1 className="text-[2em] font-bold mb-4 sm:mb-6 flex items-center gap-2 text-white">
                      Asteroid:{" "}
                      <span className="text-primary">
                        {simData?.meteor?.name || simData?.name || "Unknown"}
                      </span>
                    </h1>
                    <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-white">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                      Impact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-white/60">
                              Energy Released
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-primary truncate">
                              {impactData.energyMegatons} MT
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              Equiv.{" "}
                              {(
                                parseFloat(impactData.energyMegatons) / 15
                              ).toFixed(1)}{" "}
                              Hiroshima bombs
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
                              Crater Diameter
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-white truncate">
                              {impactData.craterDiameter} m
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              Area: {impactData.affectedArea} km²
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
                              Estimated Casualties
                            </p>
                            <p className="text-sm sm:text-xl font-bold text-destructive">
                              {impactData.estimatedCasualties}
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              Direct impact zone
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
                              Infrastructure Destruction
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-white">
                              {(() => {
                                const diameter =
                                  Number(simData?.simulation?.diameter) || 0;
                                return diameter < 100000
                                  ? "Local"
                                  : diameter < 500000
                                    ? "Regional"
                                    : "Continental";
                              })()}
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              Devastation scale
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 p-3 sm:p-5 bg-gradient-to-br from-black/40 to-transparent rounded-xl backdrop-blur-sm">
                      <h4 className="font-semibold mb-2 sm:mb-3 text-white text-sm sm:text-base">
                        Asteroid Parameters
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="flex flex-wrap">
                          <span className="text-white/60">Type:</span>
                          <span className="ml-2 font-medium text-white">
                            {simData?.simulation?.asteroidType ||
                              simData?.simulation?.composition ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="text-white/60">Diameter:</span>
                          <span className="ml-2 font-medium text-white">
                            {(
                              Number(simData?.simulation?.diameter) || 0
                            ).toLocaleString()}
                            m
                          </span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="text-white/60">Velocity:</span>
                          <span className="ml-2 font-medium text-white">
                            {Number(simData?.simulation?.velocity) || 0} km/s
                          </span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="text-white/60">Angle:</span>
                          <span className="ml-2 font-medium text-white">
                            {Number(simData?.simulation?.angle) || 0}°
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm rounded-xl">
                      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">
                        Share Results
                      </h3>

                      <div className="space-y-2 mb-3 sm:mb-4">
                        <Label
                          htmlFor="userName"
                          className="text-xs sm:text-sm text-white/80"
                        >
                          Your Name
                        </Label>
                        <Input
                          id="userName"
                          disabled
                          placeholder="Enter your name"
                          value={simData?.userName || ""}
                          className="bg-black/30 border-white/10 text-white capitalize"
                        />
                      </div>

                      <div className="space-y-2 mb-3 sm:mb-4">
                        <Label className="text-xs sm:text-sm text-white/80">
                          Result Link
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
                    </div>

                    <Button
                      onClick={() => (window.location.href = "/start")}
                      variant="default"
                      className="w-full border-white/10 hover:bg-white/10 text-sm sm:text-base"
                    >
                      <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      New Simulation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={twMerge(
                "bg-gradient-to-b from-black via-secondary/20 to-black pt-20 sm:pt-24 px-3 sm:px-8 pb-4",
                currentPhase === "results" ? "min-h-auto" : "min-h-screen",
              )}
            >
              <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  Impact Results of{" "}
                  {simData?.meteor?.name || simData?.name || "Unknown Asteroid"}
                </h2>
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
                  <button
                    onClick={() => handlePhaseChange("3d")}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm p-6 border border-white/10 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                        <img
                          src="./images/3d-model-preview.jpg"
                          alt="3D model of the asteroid"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Interactive 3D Model
                      </h3>
                      <p className="text-white/60 text-sm">
                        Visualize the asteroid trajectory in 3D. Click to play.
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-primary">
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Play animation
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePhaseChange("video")}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm p-6 border border-white/10 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                        <img
                          src="./images/impact-video-preview.jpg"
                          alt="Impact video"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Impact Simulation
                      </h3>
                      <p className="text-white/60 text-sm">
                        Watch the impact and explosion sequence. Click to play.
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-primary">
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Watch simulation
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Real Forms of Asteroid{" "}
                <span className="text-primary">{simData?.meteor?.name}</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all">
                  <img
                    src={simData?.images?.full_view}
                    alt="Asteroid full view 1"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-white/80 text-sm">
                      Complete view of asteroid {simData?.meteor?.name}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all">
                  <img
                    src={simData?.images?.surface}
                    alt="Asteroid surface view 2"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-white/80 text-sm">
                      Detail of the surface with craters
                    </p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-black/60 to-transparent backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all">
                  <img
                    src={simData?.images?.view_from_space}
                    alt="Asteroid space view 3"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-white/80 text-sm">
                      Complete view from space
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollTop>
  );
};
