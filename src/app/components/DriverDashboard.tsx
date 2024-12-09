'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardData {
  totalOrders: number
  totalRoutes: number
  totalEarnings: number
}

export function DriverDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, routesRes, paymentRes] = await Promise.all([
          fetch('https://backend-delivery-management.vercel.app/api/orders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('https://backend-delivery-management.vercel.app/api/routes', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('https://backend-delivery-management.vercel.app/api/drivers/payment', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ])

        const [ordersData, routesData, paymentData] = await Promise.all([
          ordersRes.json(),
          routesRes.json(),
          paymentRes.json()
        ])

        setDashboardData({
          totalOrders: ordersData.data.length,
          totalRoutes: routesData.data.length,
          totalEarnings: paymentData.totalPayment
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
          <CardTitle>Total Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dashboardData?.totalRoutes}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${dashboardData?.totalEarnings.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

