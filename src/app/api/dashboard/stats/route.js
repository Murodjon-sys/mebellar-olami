// React Router API route handler
export async function loader() {
  try {
    // In a real app, you would fetch this data from your database
    const stats = {
      totalOrders: 124,
      pendingOrders: 12,
      completedOrders: 98,
      totalRevenue: 12500000,
      monthlyRevenue: 3200000,
      revenueChange: 12.5,
      recentOrders: [
        {
          id: 'ORD-001',
          customer: 'John Doe',
          amount: 125000,
          status: 'completed',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 'ORD-002',
          customer: 'Jane Smith',
          amount: 98000,
          status: 'processing',
          date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
        },
        {
          id: 'ORD-003',
          customer: 'Bob Johnson',
          amount: 215000,
          status: 'pending',
          date: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
        },
        {
          id: 'ORD-004',
          customer: 'Alice Brown',
          amount: 175000,
          status: 'completed',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: 'ORD-005',
          customer: 'Charlie Wilson',
          amount: 89000,
          status: 'cancelled',
          date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
        }
      ],
      topProducts: [
        { id: 1, name: 'Smartphone X', sales: 45 },
        { id: 2, name: 'Wireless Earbuds', sales: 32 },
        { id: 3, name: 'Smart Watch', sales: 28 },
        { id: 4, name: 'Laptop Pro', sales: 22 },
        { id: 5, name: 'Bluetooth Speaker', sales: 18 }
      ]
    };

    return Response.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}