"use client";
// components/MapaPastagem.tsx


import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";

// Ícone simples (evita bug do ícone padrão no Next)
const icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) { setPosition(e.latlng); },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}>
      <Popup>
        📍 Coordenadas:<br />
        {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
      </Popup>
    </Marker>
  );
}

export default function MapaPastagem() {
  return (
    <MapContainer
      center={[-20.4697, -54.6201]} // Campo Grande - MS
      zoom={13}
      className=" min-h-[100vh] flex flex-col"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}





