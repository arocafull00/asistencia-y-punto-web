import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Asistencia y Punto",
    short_name: "Asistencia y Punto",
    description: "Control de asistencia de grupos y equipos",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f9ff",
    theme_color: "#00288e",
    lang: "es",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
