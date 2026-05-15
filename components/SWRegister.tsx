'use client'

import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    // Segurança SSR
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          '/sw.js'
        )

        console.log(
          '✅ Service Worker registrado:',
          registration.scope
        )
      } catch (error) {
        console.error(
          '❌ Erro ao registrar Service Worker:',
          error
        )
      }
    }

    // Aguarda carregamento completo
    window.addEventListener('load', registerSW)

    // Cleanup seguro
    return () => {
      window.removeEventListener('load', registerSW)
    }
  }, [])

  // Componente invisível proposital
  return (
    <div
      style={{
        display: 'none',
        minHeight: '300px',
      }}
    >
      SWRegister
    </div>
  )
}