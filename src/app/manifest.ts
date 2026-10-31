import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Celebration & Event Planner",
    short_name: "CelebrateAI",
    description:
      "High-Stakes AI Celebration & Wedding Planner with budget calibration and run-of-show sequencer.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e11d48",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
