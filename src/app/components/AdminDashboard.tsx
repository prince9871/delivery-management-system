'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardData {
  totalOrders: number
  totalDrivers: number
  totalRoutes: number
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, driversRes, routesRes] = await Promise.all([
          fetch('https://backend-delivery-management.vercel.app/api/orders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('https://backend-delivery-management.vercel.app/api/drivers', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('https://backend-delivery-management.vercel.app/api/routes', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ])

        const [ordersData, driversData, routesData] = await Promise.all([
          ordersRes.json(),
          driversRes.json(),
          routesRes.json()
        ])

        setDashboardData({
          totalOrders: ordersData.data.length,
          totalDrivers: driversData.data.length,
          totalRoutes: routesData.data.length
        })
      } catch (err) {
        setError('Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dashboardData?.totalOrders}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dashboardData?.totalDrivers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dashboardData?.totalRoutes}</p>
        </CardContent>
      </Card>
    </div>
  )
}

