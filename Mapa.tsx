"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const center: [number, number] = [-15.7801, -47.9292];

const cowIcon = new L.Icon({
  iconUrl: "/cow-marker.png",
  iconSize: [45, 45],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

export default function Mapa() {
  return (
    <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>
      <h2 className=" min-h-[100vh]">🌾 Mapa das Pastagens</h2>

      <MapContainer center={center} zoom={6} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center} icon={cowIcon}>
          <Popup>PecuariaTech — Centro de Operações</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}


