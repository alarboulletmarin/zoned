const STORAGE_KEY = "zoned-race-simulations";
const MAX_SIMULATIONS = 10;

export interface SavedSimulation {
  id: string;
  createdAt: string;
  label: string;
  input: {
    distanceKm: number;
    targetTimeSeconds: number;
    startTime: string;
    strategy: "even" | "negative" | "positive";
    bodyWeightKg?: number;
  };
}

export function getAllSimulations(): SavedSimulation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sims = JSON.parse(raw) as SavedSimulation[];
    return sims.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

export function saveSimulation(sim: SavedSimulation): void {
  const sims = getAllSimulations();
  const existing = sims.findIndex(s => s.id === sim.id);
  if (existing >= 0) {
    sims[existing] = sim;
  } else {
    if (sims.length >= MAX_SIMULATIONS) {
      throw new Error(`Maximum ${MAX_SIMULATIONS} simulations. Supprimez une simulation existante.`);
    }
    sims.push(sim);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sims));
}

export function deleteSimulation(id: string): void {
  const sims = getAllSimulations().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sims));
}
