"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapComponent = dynamic(() => import("./mapa-client"), { ssr: false });

export default function MapaPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">🗺️ Mapa das Pastagens</h1>
      <MapComponent />
    </main>
  );
}
