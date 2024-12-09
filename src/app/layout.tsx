'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/app/components/Sidebar'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const [isLoggedIn, setIsLoggedIn] = useState(false)
 const [isLoading, setIsLoading] = useState(true)
 const router = useRouter()
 const pathname = usePathname()

 useEffect(() => {
  const token = localStorage.getItem('token')
  setIsLoggedIn(!!token)
  setIsLoading(false)

  if (!token && !['/login', '/register'].includes(pathname)) {
    router.push('/login')
  } else if (token) {
    if (pathname === '/') {
      router.push('/dashboard')
    } else if (['/login', '/register'].includes(pathname)) {
      router.push('/dashboard')
    }
  }
}, [pathname, router])

 const handleLogout = () => {
   localStorage.removeItem('token')
   localStorage.removeItem('userRole')
   setIsLoggedIn(false)
   router.push('/login')
 }

 if (isLoading) {
   return <div>Loading...</div>
 }

 return (
  <html lang="en">
    <body className={`${inter.className} bg-gray-100`}>
      <div className="flex h-screen">
        {isLoggedIn && <Sidebar />}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            {isLoggedIn && (
              <div className="mb-4 text-right">
                <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
                  Logout
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </body>
  </html>
 )
}

