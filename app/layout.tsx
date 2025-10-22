ï»¿<meta charSet='UTF-8' />
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PecuariaTech',
  description: 'GestÃƒÂ£o inteligente do campo Ã¢â‚¬â€ Rebanho, Pastagem e FinanÃƒÂ§as',
}

export default function RootLayout({ children }) {
  return (
    <html lang='pt-BR'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}


