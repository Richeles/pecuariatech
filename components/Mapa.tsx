'use client'

import dynamic from 'next/dynamic'

const MapNoSSR = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Popup } =
      await import('react-leaflet')

    return function Map() {
      return (
        <MapContainer
          center={[-15.7801, -47.9292]}
          zoom={6}
          style={{
            height: '500px',
            width: '100%',
            borderRadius: '12px',
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[-15.7801, -47.9292]}>
            <Popup>
              PecuariaTech
            </Popup>
          </Marker>
        </MapContainer>
      )
    }
  },
  {
    ssr: false,
  }
)

export default function Mapa() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        🌾 Mapa das Pastagens
      </h2>

      <div className="overflow-hidden rounded-xl border">
        <MapNoSSR />
      </div>
    </div>
  )
}