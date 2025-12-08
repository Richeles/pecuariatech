"use client"
import React, { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        () => console.log('✅ Service Worker registrado com sucesso'),
        (err) => console.warn('⚠️ Falha ao registrar o Service Worker', err)
      )
    }
  }, [])

  return (
    <div style={{ display: 'none' }} style={{ minHeight: "300px" }}>
      {/* SWRegister ativo */}
    </div>
  )
}








