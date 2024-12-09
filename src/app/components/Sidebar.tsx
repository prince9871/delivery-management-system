'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Menu } from 'lucide-react'

export function Sidebar() {
 const [isOpen, setIsOpen] = useState(false)
 const [userRole, setUserRole] = useState<string | null>(null)
 const pathname = usePathname()

 useEffect(() => {
   setUserRole(localStorage.getItem('userRole'))
 }, [])

 const isActive = (path: string) => pathname === path

 const toggleSidebar = () => setIsOpen(!isOpen)

 const navItems = [
   { name: 'Dashboard', path: '/dashboard' },
   { name: 'Orders', path: '/orders' },
   { name: 'Drivers', path: '/drivers' },
   { name: 'Routes', path: '/routes' },
 ]

 return (
   <>
     <button
       className="fixed top-4 left-4 z-50 md:hidden"
       onClick={toggleSidebar}
     >
       <Menu size={24} />
     </button>

     <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}>
       <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold">Delivery Management</h1>
           <button className="md:hidden" onClick={toggleSidebar}>
             <X size={24} />
           </button>
         </div>
         <nav>
           <ul className="space-y-2">
             {navItems.map((item) => (
               <li key={item.path}>
                 <Link 
                   href={item.path} 
                   className={`block p-2 rounded ${isActive(item.path) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                   onClick={() => setIsOpen(false)}
                 >
                   {item.name}
                 </Link>
               </li>
             ))}
           </ul>
         </nav>
       </div>
     </div>

     {isOpen && (
       <div 
         className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
         onClick={toggleSidebar}
       ></div>
     )}
   </>
 )
}

