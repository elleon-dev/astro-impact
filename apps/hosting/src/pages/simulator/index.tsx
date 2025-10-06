import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { AsteroidScene } from "@/components/AsteroidScene.tsx";
import { Flame, MapPin, Palette, Ruler, Target, User, Zap } from "lucide-react";
import meteors from "../../data-list/meteors.json";
import { addSimulation, getSimulationId } from "@/firebase/collections";
import { useDefaultFirestoreProps } from "@/hooks/useDefaultFirestoreProps.ts";
import { ScrollTop } from "@/ScrollTop.ts";

interface SimulationData {
  asteroidType: string;
  diameter: number;
  velocity: number;
  angle: number;
  composition: string;
  distance?: number;
}

export const SimulatorPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [selectedMeteorId, setSelectedMeteorId] = useState("2101955");
  const [isCustom, setIsCustom] = useState(false);
  const [simData, setSimData] = useState<SimulationData>({
    asteroidType: "rocky",
    diameter: 490,
    velocity: 28,
    angle: 45,
    composition: "stone",
    distance: 12,
  });
  const [isValid, setIsValid] = useState(false);
  const selectedMeteor = meteors.find((m: any) => m.id === selectedMeteorId);

  useEffect(() => {
    setIsValid(userName.trim().length > 0);
  }, [userName]);

  useEffect(() => {
    const selectedMeteor = meteors.find((m: any) => m.id === selectedMeteorId);
    if (selectedMeteor && selectedMeteorId !== "custom") {
      setSimData({
        asteroidType: selectedMeteor.asteroidType || "rocky",
        diameter: selectedMeteor.diameter || 100,
        velocity: selectedMeteor.velocity || 20,
        angle: selectedMeteor.angle || 45,
        composition: selectedMeteor.composition || "stone",
        distance: selectedMeteor.distance || 10,
      });
      setIsCustom(false);
    } else if (selectedMeteorId === "custom") {
      setIsCustom(true);
    }
  }, [selectedMeteorId]);

  const handleSliderChange = (field: keyof SimulationData, value: number) => {
    if (!isCustom) return; // Block changes if not in custom mode

    setSimData((prev) => ({ ...prev, [field]: value }));
    if (selectedMeteorId !== "custom") {
      setSelectedMeteorId("custom");
      setIsCustom(true);
    }
  };

  const handleCompositionChange = (value: string) => {
    if (!isCustom) return; // Block changes if not in custom mode

    setSimData((prev) => ({ ...prev, composition: value }));
    if (selectedMeteorId !== "custom") {
      setSelectedMeteorId("custom");
      setIsCustom(true);
    }
  };

  const calculateImpactEnergy = () => {
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

    const density = getDensity(simData.composition);
    const radius = simData.diameter / 2; // meters
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m³
    const mass = volume * density; // kg
    const velocityMs = simData.velocity * 1000; // convert km/s to m/s
    const kineticEnergy = 0.5 * mass * Math.pow(velocityMs, 2); // joules

    // Convert to megatons TNT (1 megaton = 4.184 × 10^15 joules)
    const energyMegatons = kineticEnergy / 4.184e15;

    // Return with appropriate precision based on size
    if (energyMegatons < 0.001) {
      return energyMegatons.toExponential(2);
    } else if (energyMegatons < 1) {
      return energyMegatons.toFixed(4);
    } else if (energyMegatons < 1000) {
      return energyMegatons.toFixed(2);
    } else {
      return energyMegatons.toExponential(2);
    }
  };

  const calculateCraterDiameter = () => {
    return (
      simData.diameter *
      20 *
      Math.pow(simData.velocity / 20, 0.44)
    ).toFixed(2);
  };

  const getComparison = () => {
    const energy = parseFloat(calculateImpactEnergy());
    if (energy < 0.01)
      return {
        event: "Small Building Explosion",
        equivalent: "~0.01 megatons - local damage",
      };
    if (energy < 0.1)
      return {
        event: "City Block Destruction",
        equivalent: "~0.1 megatons - several blocks",
      };
    if (energy < 1)
      return {
        event: "Small Nuclear Bomb",
        equivalent: "~1 megaton - city district",
      };
    if (energy < 15)
      return {
        event: "Tunguska Event (1908)",
        equivalent: "~15 megatons - devastated 2,000 km²",
      };
    if (energy < 100)
      return {
        event: "Large Nuclear Bomb",
        equivalent: "~50-100 megatons - major city destruction",
      };
    if (energy < 10000)
      return {
        event: "Regional Catastrophe",
        equivalent: "~1,000-10,000 megatons - country-sized impact",
      };
    if (energy < 100000000)
      return {
        event: "Chicxulub Impact",
        equivalent: "~100 million megatons - dinosaur extinction",
      };
    return {
      event: "Mass Extinction Event",
      equivalent: "Planetary catastrophe",
    };
  };

  const getAsteroidColor = () => {
    switch (simData.asteroidType) {
      case "metallic":
        return "#8b8b8b - Metallic gray";
      case "icy":
        return "#b0d4e3 - Ice blue";
      default:
        return "#6b4423 - Rocky brown";
    }
  };

  const comparison = getComparison();

  const { assignCreateProps } = useDefaultFirestoreProps();

  const onSubmitSimulationData = async () => {
    // Validate that user has entered their name
    if (!userName.trim()) {
      alert("Please enter your name before generating the simulation results.");
      return;
    }

    const simulationId = getSimulationId();

    const meteorOfDataList = meteors.find(
      (meteor) => meteor.id === selectedMeteorId,
    );

    console.log("meteorOfDataList:", meteorOfDataList);

    const simulationData = {
      id: simulationId,
      userName: userName.trim(),
      meteor: {
        id: selectedMeteorId,
        name: selectedMeteor?.name || "Custom Meteor",
        isCustom: isCustom,
        neoReferenceId: selectedMeteor?.neo_reference_id || null,
        nasaUrl: selectedMeteor?.nasa_jpl_url || null,
      },
      simulation: {
        diameter: simData.diameter,
        velocity: simData.velocity,
        angle: simData.angle,
        composition: simData.composition,
        asteroidType: simData.asteroidType,
        distance: simData.distance || 10,
      },
      impact: {
        energy: parseFloat(calculateImpactEnergy()),
        energyUnit: "megatons",
        craterDiameter: parseFloat(calculateCraterDiameter()),
        craterUnit: "meters",
        comparison: {
          event: comparison.event,
          equivalent: comparison.equivalent,
        },
      },
      scientificData:
        !isCustom && selectedMeteor
          ? {
              absoluteMagnitude: selectedMeteor.absolute_magnitude_h || null,
              isPotentiallyHazardous:
                selectedMeteor.is_potentially_hazardous_asteroid || false,
              orbitalData: {
                period: selectedMeteor.orbital_data?.orbital_period || null,
                eccentricity: selectedMeteor.orbital_data?.eccentricity || null,
                inclination: selectedMeteor.orbital_data?.inclination || null,
                semiMajorAxis:
                  selectedMeteor.orbital_data?.semi_major_axis || null,
              },
              orbitClass: {
                type: selectedMeteor.orbit_class?.orbit_class_type || null,
                description:
                  selectedMeteor.orbit_class?.orbit_class_description || null,
              },
              estimatedDiameter: {
                min:
                  selectedMeteor.estimated_diameter?.meters
                    ?.estimated_diameter_min || null,
                max:
                  selectedMeteor.estimated_diameter?.meters
                    ?.estimated_diameter_max || null,
                unit: "meters",
              },
            }
          : null,
      videoUrl: meteorOfDataList?.videoUrl || null,
      images: {
        full_view: meteorOfDataList?.images?.full_view || null,
        surface: meteorOfDataList?.images?.surface || null,
        view_from_space: meteorOfDataList?.images?.view_from_space || null,
      },
    };

    try {
      await addSimulation(assignCreateProps(simulationData));

      navigate(`/results?id=${simulationId}`, {
        state: {
          simData,
          userName,
          simulationId,
          calculatedData: {
            impactEnergy: parseFloat(calculateImpactEnergy()),
            craterDiameter: parseFloat(calculateCraterDiameter()),
            comparison,
          },
          meteorData: selectedMeteor,
        },
      });
    } catch (error) {
      console.error("Error saving simulation:", error);
    }
  };

  return (
    <ScrollTop>
      <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Header Controls - ALL IN ENGLISH */}
        <header className="absolute top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-b from-black/40 to-transparent">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <h1 className="text-lg font-bold text-white whitespace-nowrap">
                  AstroImpact
                </h1>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Label className="text-xs text-white/70">Full Name</Label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <Input
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-32 h-9 bg-black/30 backdrop-blur-sm text-white placeholder:text-white/50 border-white/20 text-sm"
                  />
                </div>
              </div>

              {/* Separator */}
              <div className="h-10 w-px bg-white/20 flex-shrink-0" />

              {/* Meteor */}
              <div className="flex flex-col gap-1 min-w-[180px]">
                <Label className="text-xs text-white/70">Asteroid</Label>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary flex-shrink-0" />
                  <Select
                    value={selectedMeteorId}
                    onValueChange={setSelectedMeteorId}
                  >
                    <SelectTrigger className="h-9 bg-black/30 backdrop-blur-sm text-white border-white/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meteors.map((meteor: any) => (
                        <SelectItem key={meteor.id} value={meteor.id}>
                          {meteor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Composition */}
              <div className="flex flex-col gap-1 min-w-[140px]">
                <Label className="text-xs text-white/70">Composition</Label>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-secondary flex-shrink-0" />
                  <Select
                    value={simData.composition}
                    onValueChange={handleCompositionChange}
                    disabled={!isCustom}
                  >
                    <SelectTrigger
                      className={`h-9 bg-black/30 backdrop-blur-sm text-white border-white/20 text-sm ${!isCustom ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stone">Stone</SelectItem>
                      <SelectItem value="iron">Iron</SelectItem>
                      <SelectItem value="ice">Ice</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Separator */}
              <div className="h-10 w-px bg-white/20 flex-shrink-0" />

              {/* Diameter */}
              <div className="flex flex-col gap-1 min-w-[200px]">
                <Label className="text-xs text-white/70">Diameter</Label>
                <div className="flex items-center gap-3">
                  <Ruler className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/80 whitespace-nowrap min-w-[60px]">
                        Ø {simData.diameter}m
                      </span>
                      <Slider
                        value={[simData.diameter]}
                        onValueChange={([value]) =>
                          handleSliderChange("diameter", value)
                        }
                        min={10}
                        max={1000}
                        step={10}
                        className={`flex-1 ${!isCustom ? "opacity-50 pointer-events-none" : ""}`}
                        disabled={!isCustom}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Velocity */}
              <div className="flex flex-col gap-1 min-w-[200px]">
                <Label className="text-xs text-white/70">Velocity</Label>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/80 whitespace-nowrap min-w-[60px]">
                        {simData.velocity} km/s
                      </span>
                      <Slider
                        value={[simData.velocity]}
                        onValueChange={([value]) =>
                          handleSliderChange("velocity", value)
                        }
                        min={11}
                        max={72}
                        step={1}
                        className={`flex-1 ${!isCustom ? "opacity-50 pointer-events-none" : ""}`}
                        disabled={!isCustom}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Angle */}
              <div className="flex flex-col gap-1 min-w-[180px]">
                <Label className="text-xs text-white/70">Impact Angle</Label>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/80 whitespace-nowrap min-w-[50px]">
                        {simData.angle}°
                      </span>
                      <Slider
                        value={[simData.angle]}
                        onValueChange={([value]) =>
                          handleSliderChange("angle", value)
                        }
                        min={0}
                        max={90}
                        step={5}
                        className={`flex-1 ${!isCustom ? "opacity-50 pointer-events-none" : ""}`}
                        disabled={!isCustom}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Mode Badge */}
            {isCustom && (
              <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-medium border border-orange-500/30">
                  Custom Mode Active
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Fullscreen 3D Scene */}
        <div className="absolute inset-0 w-full h-full">
          <AsteroidScene simData={simData} meteorId={selectedMeteorId} />
        </div>

        {/* Left Card - Meteor Data */}
        <Card className="absolute left-4 lg:left-6 top-28 lg:top-24 w-80 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-lg z-40 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Meteor Data
            </h2>
            {selectedMeteor?.is_potentially_hazardous_asteroid && (
              <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">
                ⚠️ PHA
              </span>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <Ruler className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-semibold text-foreground">
                    {simData.diameter}m diameter
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {simData.diameter < 50
                      ? "Small"
                      : simData.diameter < 200
                        ? "Medium"
                        : simData.diameter < 500
                          ? "Large"
                          : "Massive"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <Palette className="w-4 h-4 text-secondary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Color & Type</p>
                  <p className="font-semibold text-foreground">
                    {getAsteroidColor()}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {simData.composition}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <Zap className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Velocity</p>
                  <p className="font-semibold text-foreground">
                    {simData.velocity} km/s
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(simData.velocity * 3600).toFixed(0)} km/h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <MapPin className="w-4 h-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Impact Angle</p>
                  <p className="font-semibold text-foreground">
                    {simData.angle}°
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {simData.angle < 30
                      ? "Grazing"
                      : simData.angle < 60
                        ? "Oblique"
                        : "Vertical"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <svg
                  className="w-4 h-4 text-blue-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path
                    strokeWidth="2"
                    d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
                  />
                </svg>
                <div>
                  <p className="text-muted-foreground">Orbital Distance</p>
                  <p className="font-semibold text-foreground">
                    {simData.distance} AU (simulated)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ~{(simData.distance * 149.6).toFixed(1)} million km
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <svg
                  className="w-4 h-4 text-yellow-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-muted-foreground">Hazard Status</p>
                  <p className="font-semibold text-foreground">
                    {selectedMeteor?.is_potentially_hazardous_asteroid
                      ? "Potentially Hazardous"
                      : "Not Hazardous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on NASA classification
                  </p>
                </div>
              </div>

              {/* Absolute Magnitude */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <svg
                  className="w-4 h-4 text-purple-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <div>
                  <p className="text-muted-foreground">Magnitude</p>
                  <p className="font-semibold text-foreground">
                    H = {selectedMeteor?.absolute_magnitude_h || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Absolute magnitude (brightness)
                  </p>
                </div>
              </div>

              {/* Orbital Period */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <svg
                  className="w-4 h-4 text-green-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <div>
                  <p className="text-muted-foreground">Orbital Period</p>
                  <p className="font-semibold text-foreground">
                    {selectedMeteor?.orbital_data?.orbital_period
                      ? `${parseFloat(selectedMeteor.orbital_data.orbital_period).toFixed(0)} days`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMeteor?.orbital_data?.orbital_period
                      ? `~${(parseFloat(selectedMeteor.orbital_data.orbital_period) / 365).toFixed(1)} years`
                      : "Time to orbit the Sun"}
                  </p>
                </div>
              </div>

              {/* Eccentricity */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <svg
                  className="w-4 h-4 text-cyan-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                </svg>
                <div>
                  <p className="text-muted-foreground">Orbit Shape</p>
                  <p className="font-semibold text-foreground">
                    e = {selectedMeteor?.orbital_data?.eccentricity || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMeteor?.orbital_data?.eccentricity
                      ? parseFloat(selectedMeteor.orbital_data.eccentricity) <
                        0.1
                        ? "Nearly circular"
                        : parseFloat(selectedMeteor.orbital_data.eccentricity) <
                            0.3
                          ? "Slightly elliptical"
                          : "Highly elliptical"
                      : "Orbital eccentricity"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-black/40 to-transparent">
                <svg
                  className="w-4 h-4 text-orange-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <div>
                  <p className="text-muted-foreground">Orbit Class</p>
                  <p className="font-semibold text-foreground">
                    {selectedMeteor?.orbit_class?.orbit_class_type || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMeteor?.orbit_class?.orbit_class_description ||
                      "NASA classification"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer - translated */}
        <footer className="absolute bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-t from-black/50 to-transparent">
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent">
                  <p className="text-xs text-muted-foreground">Impact Energy</p>
                  <p className="text-lg sm:text-xl font-bold text-primary">
                    {calculateImpactEnergy()}
                  </p>
                  <p className="text-xs text-muted-foreground">Megatons</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent">
                  <p className="text-xs text-muted-foreground">
                    Crater Diameter
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-secondary">
                    {calculateCraterDiameter()}
                  </p>
                  <p className="text-xs text-muted-foreground">Meters</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent col-span-2 lg:col-span-1">
                  <p className="text-xs text-muted-foreground">
                    Comparable Event
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-primary line-clamp-2">
                    {comparison.event}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-black/40 to-transparent col-span-2 lg:col-span-1">
                  <p className="text-xs text-muted-foreground">Equivalent</p>
                  <p className="text-xs font-semibold text-foreground line-clamp-2">
                    {comparison.equivalent}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={onSubmitSimulationData}
                  size="lg"
                  className="gap-2 shadow-impact hover:shadow-glow transition-all duration-300 bg-primary/90 backdrop-blur w-full sm:w-auto"
                >
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Generate Result</span>
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ScrollTop>
  );
};
