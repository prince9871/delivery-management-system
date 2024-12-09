import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white shadow">
      
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Delivery Management
        </Link>
        <div className="space-x-4">
          <Link href="/orders" className="text-gray-600 hover:text-gray-800">
            Orders
          </Link>
          <Link href="/drivers" className="text-gray-600 hover:text-gray-800">
            Drivers
          </Link>
          <Link href="/routes" className="text-gray-600 hover:text-gray-800">
            Routes
          </Link>
        </div>
      </nav>
    </header>
  )
}

