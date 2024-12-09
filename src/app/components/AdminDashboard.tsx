'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpIcon, ArrowDownIcon, TruckIcon, MapIcon, PackageIcon } from 'lucide-react'

interface DashboardData {
  totalOrders: number
  totalDrivers: number
  totalRoutes: number
  recentOrders: {
    date: string
    count: number
  }[]
  driverPerformance: {
    name: string
    completedOrders: number
  }[]
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, driversRes, routesRes] = await Promise.all([
        fetch('https://backend-delivery-management.vercel.app/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('https://backend-delivery-management.vercel.app/api/drivers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('https://backend-delivery-management.vercel.app/api/routes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ])

      const [ordersData, driversData, routesData] = await Promise.all([
        ordersRes.json(),
        driversRes.json(),
        routesRes.json(),
      ])

      // Process the data for charts
      const recentOrders = processRecentOrders(ordersData.data)
      const driverPerformance = processDriverPerformance(driversData.data, ordersData.data)

      setDashboardData({
        totalOrders: ordersData.data.length,
        totalDrivers: driversData.data.length,
        totalRoutes: routesData.data.length,
        recentOrders,
        driverPerformance,
      })
    } catch (err) {
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const processRecentOrders = (orders: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    const orderCounts = orders.reduce((acc: { [key: string]: number }, order: any) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return last7Days.map(date => ({
      date,
      count: orderCounts[date] || 0,
    }))
  }

  const processDriverPerformance = (drivers: any[], orders: any[]) => {
    const driverOrderCounts = orders.reduce((acc: { [key: string]: number }, order: any) => {
      acc[order.driverId] = (acc[order.driverId] || 0) + 1
      return acc
    }, {})

    return drivers
      .map(driver => ({
        name: driver.name,
        completedOrders: driverOrderCounts[driver.driverId] || 0,
      }))
      .sort((a, b) => b.completedOrders - a.completedOrders)
      .slice(0, 5)
  }

  if (loading) return <div className="text-center py-10">Loading dashboard data...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalDrivers}</div>
            <p className="text-xs text-muted-foreground">+10.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <MapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.recentOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {dashboardData?.driverPerformance.map((driver, index) => (
              <div className="flex items-center" key={index}>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{driver.name}</p>
                  <p className="text-sm text-muted-foreground">{driver.completedOrders} orders completed</p>
                </div>
                <div className="ml-auto font-medium">
                  {index === 0 ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
