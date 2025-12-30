import { getDetourBase } from "@/lib/detour";

export const runtime = "edge";

export default function DebugPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Debug</h1>
      <pre>DETOUR_BASE_URL={process.env.DETOUR_BASE_URL ?? "(not set)"}</pre>
      <pre>Computed detour base: {getDetourBase()}</pre>
    </main>
  );
}
