const DEFAULT_DETOUR_BASE = "https://classic-car-iq.godetour.link/3q71unrtJq";

function normalizeBase(rawBase?: string | null) {
  const trimmed = (rawBase ?? DEFAULT_DETOUR_BASE).trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/3q71unrtJq")) {
    return trimmed;
  }

  return `${trimmed}/3q71unrtJq`;
}

export function getDetourBase() {
  return normalizeBase(process.env.DETOUR_BASE_URL);
}

export function buildDetourTarget(path: string) {
  const base = getDetourBase();
  const cleanedPath = path.replace(/^\/+/, "");
  return `${base}/${cleanedPath}`;
}

export { DEFAULT_DETOUR_BASE };
