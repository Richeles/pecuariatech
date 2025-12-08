"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapaClient() {
  return (
    <MapContainer
      center={[-15.78, -47.93]}
      zoom={5}
      style={{ height: "600px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[-15.78, -47.93]}>
        <Popup>Fazenda Central — PecuariaTech</Popup>
      </Marker>
    </MapContainer>
  );
}

