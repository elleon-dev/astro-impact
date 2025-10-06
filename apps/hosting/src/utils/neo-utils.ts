// neo-utils.ts
export type AsteroidKind = "stone" | "metallic" | "icy";

const DENSITIES: Record<AsteroidKind, number> = {
    stone: 3000,     // kg/m³
    metallic: 7800,
    icy: 900,
};

export type OrbitConfig = {
    a_AU: number;
    e: number;
    b_AU: number;        // calculado
    incDeg: number;
    periodDays: number;
};

export type DerivedMetrics = {
    mass_kg: number;
    energy_megatons: number;
    crater_diameter_m: number;
    comparable_event: string;
};

export type SimData = {
    name: string;
    designation?: string;
    hazardous: boolean;

    diameter_m: number;     // único valor (promedio o máx)
    velocity_kms: number;   // km/s
    angle_deg: number;      // semilla (puedes sobrescribir con slider)
    kind: AsteroidKind;     // tu selector (stone/metallic/icy)

    orbit: OrbitConfig;     // para tu elipse
    derived: DerivedMetrics;// para UI (energía, cráter, etc.)
};

export function pickDiameterMeters(
    neo: any,
    mode: "avg" | "max" = "avg"
): number {
    const dmin = neo?.estimated_diameter?.meters?.estimated_diameter_min ?? 0;
    const dmax = neo?.estimated_diameter?.meters?.estimated_diameter_max ?? 0;
    if (!dmin && !dmax) return 0;
    return mode === "max" ? Math.max(dmin, dmax) : (dmin + dmax) / 2;
}

export function velocityKms(neo: any): number {
    const ca = neo?.close_approach_data?.[0];
    return ca ? parseFloat(ca.relative_velocity.kilometers_per_second) : 0;
}

export function toOrbitConfig(neo: any): OrbitConfig {
    const a_AU = parseFloat(neo?.orbital_data?.semi_major_axis ?? "0"); // a
    const e    = parseFloat(neo?.orbital_data?.eccentricity ?? "0");    // e
    const b_AU = a_AU * Math.sqrt(Math.max(0, 1 - e * e));              // b
    const incDeg = parseFloat(neo?.orbital_data?.inclination ?? "0");
    const periodDays = parseFloat(neo?.orbital_data?.orbital_period ?? "0");
    return { a_AU, e, b_AU, incDeg, periodDays };
}

export function classifySize(d_m: number): "Pequeño" | "Mediano" | "Grande" {
    if (d_m < 50) return "Pequeño";
    if (d_m < 140) return "Mediano";
    return "Grande";
}

export function energyMegatons(d_m: number, v_kms: number, kind: AsteroidKind): number {
    const rho = DENSITIES[kind];
    const v = v_kms * 1000; // m/s
    const volume = (Math.PI / 6) * Math.pow(d_m, 3);
    const mass = rho * volume;
    const E = 0.5 * mass * v * v;     // Joules
    return E / 4.184e15;              // a megatones TNT
}

export function massKg(d_m: number, kind: AsteroidKind): number {
    const rho = DENSITIES[kind];
    const volume = (Math.PI / 6) * Math.pow(d_m, 3);
    return rho * volume;
}

export function craterDiameterMeters(
    d_m: number,
    v_kms: number,
    kind: AsteroidKind,
    angleDeg: number,
    C = 1.2,            // coeficiente empírico
    rhoTarget = 2500,   // kg/m³ terreno
    g = 9.81
) {
    const rho_i = DENSITIES[kind];
    const v = v_kms * 1000; // m/s
    // Atenúa por ángulo: rasantes generan cráter menor
    const angle = Math.max(Math.sin((angleDeg * Math.PI) / 180), 0.05);
    const angleFactor = Math.pow(angle, 1 / 3);

    return (
        C *
        Math.pow(g, -0.17) *
        Math.pow(rho_i / rhoTarget, 0.33) *
        Math.pow(d_m, 0.78) *
        Math.pow(v, 0.44) *
        angleFactor
    );
}

export function comparableEvent(mt: number): string {
    if (mt < 0.1) return "Hiroshima (~0.015 Mt)";
    if (mt < 1)   return "Chelyabinsk (~0.5 Mt, airburst)";
    if (mt < 20)  return "Tunguska (5–15 Mt)";
    if (mt < 80)  return "Bomba del Zar (50 Mt)";
    return "Mayor que Zar Bomba";
}

/**
 * Construye SimData desde un JSON de NeoWs.
 * - kind: viene de tu selector de UI; por defecto "stone".
 * - diameterMode: "avg" o "max"
 */
export function buildSimFromNeo(
    neo: any,
    opts?: { kind?: AsteroidKind; diameterMode?: "avg" | "max" }
): SimData {
    const kind = opts?.kind ?? "stone";
    const d_m = pickDiameterMeters(neo, opts?.diameterMode ?? "avg");
    const v_kms = velocityKms(neo);
    const orbit = toOrbitConfig(neo);
    const angle_deg = orbit.incDeg; // semilla inicial

    const energy_mt = energyMegatons(d_m, v_kms, kind);
    const crater_m  = craterDiameterMeters(d_m, v_kms, kind, angle_deg);

    return {
        name: neo?.name ?? neo?.designation ?? neo?.id,
        designation: neo?.designation,
        hazardous: Boolean(neo?.is_potentially_hazardous_asteroid),
        diameter_m: d_m,
        velocity_kms: v_kms,
        angle_deg,
        kind,
        orbit,
        derived: {
            mass_kg: massKg(d_m, kind),
            energy_megatons: energy_mt,
            crater_diameter_m: crater_m,
            comparable_event: comparableEvent(energy_mt),
        },
    };
}
