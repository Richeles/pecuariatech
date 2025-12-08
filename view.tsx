"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Ícones do Leaflet corrigidos
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function ViewMapa() {
  return (
    <div style={{ width: "100%", height: "100vh" }} style={{ minHeight: "300px" }}>
      <MapContainer
        center={[-10.0, -55.0]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[-10.0, -55.0]}>
          <Popup>Mapa carregado com sucesso! 🚀</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}


