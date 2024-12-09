'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'

// const MapWithNoSSR = dynamic(() => import('./Map'), { ssr: false })
const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading map...</div>
})

interface Route {
  _id: string
  routeId: string
  orderId: string
  driverId: string
  status: string
  distanceTraveled: number
  steps: Step[]
}

interface Step {
  location: {
    latitude: number
    longitude: number
  }
  timestamp: string
}

interface Driver {
  _id: string
  driverId: string
  name: string
}

interface Order {
  _id: string
  orderId: string
  customerName: string
}

export function Routes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newRoute, setNewRoute] = useState({
    orderId: '',
    driverId: '',
    steps: [] as Step[],
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [showAddRoute, setShowAddRoute] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false)

  useEffect(() => {
    fetchRoutes()
    fetchDrivers()
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://backend-delivery-management.vercel.app/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data.data)
    } catch (err) {
      toast({
        title:"Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    }
  }

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://backend-delivery-management.vercel.app/api/routes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch routes')
      }
      const data = await response.json()
      setRoutes(data.data)
    } catch (err) {
      setError('Failed to fetch routes. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://backend-delivery-management.vercel.app/api/drivers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch drivers')
      }
      const data = await response.json()
      setDrivers(data.data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive",
      })
    }
  }

  const createRoute = async () => {
    try {
      const response = await fetch('https://backend-delivery-management.vercel.app/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newRoute),
      })
      if (!response.ok) {
        throw new Error('Failed to create route')
      }
      const createdRoute = await response.json()
      setRoutes([...routes, createdRoute.data])
      setNewRoute({ orderId: '', driverId: '', steps: [] })
      toast({
        title: "Route Created",
        description: "Route created successfully",
      })
    } catch (err) {
      toast({
        title: "Failed to Create Route",
        description: "Failed to create route. Please try again.",
      })
    }
  }

  const updateRouteStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`https://backend-delivery-management.vercel.app/api/routes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error('Failed to update route status')
      }
      setRoutes(routes.map(route => 
        route._id === id ? { ...route, status } : route
      ))
      toast({
        title: "Route Status Updated",
        description: "Route status updated successfully",
      })
    } catch (err) {
      toast({
        title: "Failed to Update Route Status",
        description: "Failed to update route status. Please try again.",
      })
    }
  }

  const deleteRoute = async (id: string) => {
    try {
      const response = await fetch(`https://backend-delivery-management.vercel.app/api/routes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to delete route')
      }
      setRoutes(routes.filter(route => route._id !== id))
      toast({
        title: "Route Deleted",
        description: "Route deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Failed to Delete Route",
        description: "Failed to delete route. Please try again.",
      })
    }
  }

  const addStep = useCallback((lat: number, lng: number) => {
    setNewRoute(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          location: { latitude: lat, longitude: lng },
          timestamp: new Date().toISOString(),
        },
      ],
    }))
  }, [])

  if (loading) {
    return <div className="text-center py-4">Loading routes...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-5">
      <Button onClick={() => setShowAddRoute(prev => !prev)}>
        {showAddRoute ? 'View Routes' : 'Add Route'}
      </Button>

      {showAddRoute ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                value={newRoute.orderId}
                onChange={(e) => setNewRoute({ ...newRoute, orderId: e.target.value })}
                required
              >
                <option value="">Select Order</option>
                {orders.map((order) => (
                  <option key={order.orderId} value={order.orderId}>
                    {order.customerName} (Order: {order.orderId})
                  </option>
                ))}
              </select>
              <select
                className="w-full p-2 border rounded"
                value={newRoute.driverId}
                onChange={(e) => setNewRoute({ ...newRoute, driverId: e.target.value })}
                required
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.driverId} value={driver.driverId}>
                    {driver.name} ({driver.driverId})
                  </option>
                ))}
              </select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Add Steps</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] sm:h-[600px]">
                  <DialogHeader>
                    <DialogTitle>Choose location</DialogTitle>
                  </DialogHeader>
                  <div className="h-[500px] mt-4">
                    <MapWithNoSSR onLocationSelected={addStep} steps={newRoute.steps} />
                    
                  </div>
                </DialogContent>
              </Dialog>
              <div>
                <h3 className="font-bold mb-2">Steps:</h3>
                {newRoute.steps.map((step, index) => (
                  <div key={index} className="mb-2">
                    Step {index + 1}: Lat: {step.location.latitude.toFixed(4)}, Lng: {step.location.longitude.toFixed(4)}
                  </div>
                ))}
              </div>
              <Button onClick={createRoute}>Create Route</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Driver ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Distance Traveled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route._id}>
                    <TableCell>{route.routeId}</TableCell>
                    <TableCell>{route.orderId}</TableCell>
                    <TableCell>{route.driverId}</TableCell>
                    <TableCell>{route.status}</TableCell>
                    <TableCell>{route.distanceTraveled.toFixed(2)} km</TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <select
                          value={route.status}
                          onChange={(e) => updateRouteStatus(route._id, e.target.value)}
                          className="p-2 border rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <Button variant="destructive" onClick={() => deleteRoute(route._id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

