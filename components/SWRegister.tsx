'use client'
import { useEffect } from 'react';
export default function SWRegister(){
  useEffect(()=>{
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(()=>console.log('SW registered')).catch(()=>{});
    }
  },[]);
  return null;
}
