'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface Order {
  _id: string
  orderId: string
  customerName: string
  deliveryAddress: string
  totalAmount: number
  orderStatus: string
  driverName: string
}

interface Driver {
  _id: string
  driverId: string
  name: string
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    deliveryAddress: '',
    totalAmount: 0,
    driverId: '', 
  })
  const [activeSection, setActiveSection] = useState<'create' | 'manage'>('manage')
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    fetchOrders()
    fetchDrivers()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
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
      setError('Failed to fetch orders. Please try again later.')
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
      if (!response.ok) throw new Error('Failed to fetch drivers')
      const data = await response.json()
      setDrivers(data.data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch drivers. Please try again.",
        variant: "destructive",
      })
    }
  }

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('https://backend-delivery-management.vercel.app/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newOrder),
      })
      if (!response.ok) {
        throw new Error('Failed to create order')
      }
      const data = await response.json()
      setOrders([...orders, data.data])
      setNewOrder({ customerName: '', deliveryAddress: '', totalAmount: 0, driverId: '' })
      toast({
        title: "Order Created",
        description: "New order has been created successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`https://backend-delivery-management.vercel.app/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ orderStatus: status }),
      })
      if (!response.ok) {
        throw new Error('Failed to update order status')
      }
      setOrders(orders.map(order =>
        order._id === id ? { ...order, orderStatus: status } : order
      ))
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteOrder = async (id: string) => {
    try {
      const response = await fetch(`https://backend-delivery-management.vercel.app/api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to delete order')
      }
      setOrders(orders.filter(order => order._id !== id))
      toast({
        title: "Order Deleted",
        description: "Order has been deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading orders...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-8">
      <Button onClick={() => setActiveSection(activeSection === 'manage' ? 'create' : 'manage')}>
        {activeSection === 'manage' ? 'Add New Order' : 'Manage Orders'}
      </Button>

      {activeSection === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createOrder} className="space-y-4">
              <Input
                placeholder="Customer Name"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                required
              />
              <Input
                placeholder="Delivery Address"
                value={newOrder.deliveryAddress}
                onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Total Amount"
                value={newOrder.totalAmount}
                onChange={(e) => setNewOrder({ ...newOrder, totalAmount: parseFloat(e.target.value) })}
                required
              />
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={newOrder.driverId}
                onChange={(e) => setNewOrder({ ...newOrder, driverId: e.target.value })}
                required
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.driverId} value={driver.driverId}>
                    {driver.name}
                  </option>
                ))}
              </select>
              <Button type="submit">Create Order</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeSection === 'manage' && (
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto md:overflow-x-hidden">
              <Table className="w-full min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Order ID</TableHead>
                    <TableHead className="text-left">Customer Name</TableHead>
                    <TableHead className="text-left">Delivery Address</TableHead>
                    <TableHead className="text-left">Total Amount</TableHead>
                    <TableHead className="text-left">Status</TableHead>
                    <TableHead className="text-left">Driver Name</TableHead>
                    <TableHead className="text-left">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="overflow-y-scroll max-h-96">
                  {orders.map((order) => (
                    <TableRow key={order._id} className="break-inside-avoid-all">
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.deliveryAddress}</TableCell>
                      <TableCell>₹ {order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{order.orderStatus}</TableCell>
                      <TableCell>{order.driverName}</TableCell>
                      <TableCell>
                        <div className="space-x-2">
                          <Button onClick={() => updateOrderStatus(order._id, 'delivered')}>Mark Delivered</Button>
                          <Button variant="destructive" onClick={() => deleteOrder(order._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

