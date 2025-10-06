import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";

interface ImpactVideoProps {
  simData: any;
  handlePhaseChange: (phase: string) => void;
}

export const ImpactVideo = ({
  simData,
  handlePhaseChange,
}: ImpactVideoProps) => {
  const navigate = useNavigate();
  return (
    <div className="w-[100vw] h-[calc(100vh-13rem)] p-[3em] mt-[8rem] bg-gradient-to-b from-background via-background/90 to-background relative flex flex-col items-center justify-center">
      {/* Vesta Video */}
      <video
        src={simData.videoUrl}
        className="relative w-full min-h-[80svh] h-full object-cover rounded-xl shadow-lg border border-border z-0 flex items-center justify-center"
        autoPlay
        loop
        muted
        playsInline
        controls
      />

      {/* Overlay Text */}
      <div className="absolute top-0 left-4 md:left-20 bg-black/60 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/10 max-w-sm md:max-w-md z-10">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
          Secuencia de Impacto
        </h2>
        <p className="text-white/80 text-xs md:text-sm">
          Asteroide de {simData.diameter}m aproximándose a la Tierra a{" "}
          {simData.velocity} km/s. El impacto generará una explosión
          catastrófica con efectos devastadores en la región de impacto.
        </p>
        <br />
        <span className="font-medium text-[.8em]">
          Video generado por AI, para brindar una mejor experiencia de
          entretenimiento al usuario
        </span>
      </div>

      {/* Botón para continuar a los datos */}
      <div className="w-full flex justify-center absolute bottom-10 left-0 z-20">
        <Button
          variant="default"
          size="lg"
          onClick={() => handlePhaseChange("results")}
          className="px-8 py-3 text-lg font-semibold shadow-lg z-50 cursor-pointer"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
