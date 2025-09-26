'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, ShoppingCart, Package, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentOrders: [],
        topProducts: [],
        loading: true,
        error: null
    });

    const API = (path) => {
        const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
        return `${base}${path}`;
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setStats(prev => ({ ...prev, loading: true, error: null }));
            
            // Parallel API calls for better performance
            const [productsRes, ordersRes, customersRes] = await Promise.all([
                fetch(API('/api/products?available=all')),
                fetch(API('/api/orders')),
                fetch(API('/api/customers'))
            ]);

            const [productsData, ordersData, customersData] = await Promise.all([
                productsRes.json(),
                ordersRes.json(),
                customersRes.json()
            ]);

            // Calculate stats
            const products = productsData.success ? productsData.data || [] : [];
            const orders = ordersData.success ? ordersData.data?.orders || [] : [];
            const customers = customersData.success ? customersData.data || [] : [];

            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
            const recentOrders = orders.slice(0, 5); // Last 5 orders

            // Calculate top products by order frequency
            const productFrequency = {};
            orders.forEach(order => {
                order.items?.forEach(item => {
                    const productId = item.productId || item.name;
                    if (productFrequency[productId]) {
                        productFrequency[productId].quantity += item.quantity || 1;
                    } else {
                        productFrequency[productId] = {
                            name: item.name || 'Unknown Product',
                            quantity: item.quantity || 1,
                            price: item.price || 0
                        };
                    }
                });
            });

            const topProducts = Object.values(productFrequency)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            setStats({
                totalRevenue,
                totalOrders: orders.length,
                totalCustomers: customers.length,
                totalProducts: products.length,
                recentOrders,
                topProducts,
                loading: false,
                error: null
            });

        } catch (error) {
            console.error('Dashboard ma\'lumotlarini yuklashda xatolik:', error);
            setStats(prev => ({
                ...prev,
                loading: false,
                error: 'Ma\'lumotlarni yuklashda xatolik yuz berdi'
            }));
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('uz-UZ');
    };

    const getOrderStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Kutilmoqda', variant: 'secondary' },
            confirmed: { label: 'Tasdiqlangan', variant: 'default' },
            delivered: { label: 'Yetkazilgan', variant: 'success' }
        };
        
        const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
        return (
            <Badge variant={statusInfo.variant} className={
                statusInfo.variant === 'success' ? "bg-green-600/20 text-green-400 border-green-500/30" :
                statusInfo.variant === 'default' ? "bg-blue-600/20 text-blue-400 border-blue-500/30" :
                "bg-gray-600/20 text-gray-400 border-gray-500/30"
            }>
                {statusInfo.label}
            </Badge>
        );
    };

    if (stats.loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="bg-gray-800 border-gray-700 text-white">
                            <CardHeader className="animate-pulse">
                                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent className="animate-pulse">
                                <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        );
    }

    if (stats.error) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card className="bg-red-900/20 border-red-500/30 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            Xatolik yuz berdi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-300">{stats.error}</p>
                        <button 
                            onClick={loadDashboardData}
                            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                        >
                            Qayta urinish
                        </button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Umumiy Daromad
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {formatPrice(stats.totalRevenue)}
                        </div>
                        <p className="text-xs text-gray-500">
                            Jami {stats.totalOrders} ta buyurtma
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Buyurtmalar
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                            {stats.totalOrders}
                        </div>
                        <p className="text-xs text-gray-500">
                            Jami buyurtmalar soni
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Mijozlar
                        </CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">
                            {stats.totalCustomers}
                        </div>
                        <p className="text-xs text-gray-500">
                            Ro'yxatdan o'tgan mijozlar
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Mahsulotlar
                        </CardTitle>
                        <Package className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">
                            {stats.totalProducts}
                        </div>
                        <p className="text-xs text-gray-500">
                            Jami mahsulotlar soni
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            So'nggi Buyurtmalar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentOrders.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">
                                Hozircha buyurtmalar yo'q
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentOrders.map((order, index) => (
                                    <div key={order._id || index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{order.customerName}</p>
                                            <p className="text-sm text-gray-400">
                                                {order.items?.length || 0} ta mahsulot
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">
                                                {formatPrice(order.total)}
                                            </p>
                                            {getOrderStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Mashhur Mahsulotlar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.topProducts.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">
                                Ma'lumot yo'q
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {stats.topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-gray-400">
                                                {product.quantity} marta sotilgan
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
