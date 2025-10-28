<meta charSet='UTF-8' />
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PecuariaTech',
  description: 'GestÃ£o inteligente do campo â€” Rebanho, Pastagem e FinanÃ§as',
}

export default function RootLayout({ children }) {
  return (
    <html lang='pt-BR'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}


