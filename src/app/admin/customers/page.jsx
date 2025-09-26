'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User,
  MoreHorizontal, 
  Pencil, 
  Search,
  Filter,
  Download,
  Eye,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  MessageSquare,
  UserCheck,
  UserX,
  Ban
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [customerOrders, setCustomerOrders] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [orderCountFilter, setOrderCountFilter] = React.useState('all');
  const [spendingFilter, setSpendingFilter] = React.useState('all');
  const [noteText, setNoteText] = React.useState('');
  const [editForm, setEditForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const API = (path) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
    return `${base}${path}`;
  };

  // Filter customers
  const filteredCustomers = React.useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = !searchTerm || 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm));
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        const customerDate = new Date(customer.createdAt);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            return customerDate.toDateString() === now.toDateString();
          case 'week':
            return (now - customerDate) <= 7 * 24 * 60 * 60 * 1000;
          case 'month':
            return (now - customerDate) <= 30 * 24 * 60 * 60 * 1000;
          case '3months':
            return (now - customerDate) <= 90 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      })();
      
      const matchesOrderCount = (() => {
        if (orderCountFilter === 'all') return true;
        const count = customer.totalOrders || 0;
        switch (orderCountFilter) {
          case 'none':
            return count === 0;
          case 'few':
            return count >= 1 && count <= 3;
          case 'some':
            return count >= 4 && count <= 10;
          case 'many':
            return count > 10;
          default:
            return true;
        }
      })();
      
      const matchesSpending = (() => {
        if (spendingFilter === 'all') return true;
        const spent = customer.totalSpent || 0;
        switch (spendingFilter) {
          case 'low':
            return spent < 1000000;
          case 'medium':
            return spent >= 1000000 && spent < 5000000;
          case 'high':
            return spent >= 5000000;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesDate && matchesOrderCount && matchesSpending;
    });
  }, [customers, searchTerm, statusFilter, dateFilter, orderCountFilter, spendingFilter]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const thisMonth = customers.filter(c => {
      const customerDate = new Date(c.createdAt);
      const now = new Date();
      return customerDate.getMonth() === now.getMonth() && 
             customerDate.getFullYear() === now.getFullYear();
    }).length;
    
    return { total, active, thisMonth };
  }, [customers]);

  const loadCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API('/api/customers'));
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Yuklashda xatolik');
      
      const normalized = (data.data || data.customers || []).map((c) => ({
        id: c._id || c.id,
        name: c.name || c.fullName || '',
        email: c.email || '',
        phone: c.phone || '',
        totalOrders: c.totalOrders || 0,
        totalSpent: c.totalSpent || 0,
        status: c.status || 'active',
        createdAt: c.createdAt || c.registrationDate,
        updatedAt: c.updatedAt,
        notes: c.notes || '',
        lastOrderDate: c.lastOrderDate
      }));
      setCustomers(normalized);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCustomerOrders = React.useCallback(async (customerId) => {
    try {
      const res = await fetch(API(`/api/orders?customerId=${customerId}`));
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Buyurtmalar yuklanmadi');
      setCustomerOrders(data.data || data.orders || []);
    } catch (e) {
      console.error('Orders load error:', e);
      setCustomerOrders([]);
    }
  }, []);

  React.useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const openView = async (customer) => {
    setViewing(customer);
    setViewOpen(true);
    await loadCustomerOrders(customer.id);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status || 'active'
    });
    setEditOpen(true);
  };

  const openNote = (customer) => {
    setViewing(customer);
    setNoteText(customer.notes || '');
    setNoteOpen(true);
  };

  const closeModals = () => {
    setViewOpen(false);
    setEditOpen(false);
    setNoteOpen(false);
    setViewing(null);
    setEditing(null);
    setCustomerOrders([]);
  };

  const updateCustomer = async () => {
    try {
      setLoading(true);
      const res = await fetch(API(`/api/customers/${editing.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Yangilashda xatolik');
      
      setEditOpen(false);
      await loadCustomers();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (customer, newStatus) => {
    try {
      const res = await fetch(API(`/api/customers/${customer.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customer, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Status yangilanmadi');
      await loadCustomers();
    } catch (e) {
      setError(e.message);
    }
  };

  const saveNote = async () => {
    try {
      setLoading(true);
      const res = await fetch(API(`/api/customers/${viewing.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...viewing, notes: noteText })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Izoh saqlanmadi');
      
      setNoteOpen(false);
      await loadCustomers();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Ism', 'Email', 'Telefon', 'Jami buyurtmalar', 'Jami sarflangan', 'Ro\'yxatdan o\'tgan sana', 'Status'];
    const rows = filteredCustomers.map(customer => [
      customer.name,
      customer.email,
      customer.phone || '',
      customer.totalOrders || 0,
      customer.totalSpent || 0,
      new Date(customer.createdAt).toLocaleDateString('uz-UZ'),
      customer.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mijozlar-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: "bg-green-600/20 text-green-400 border-green-500/30",
      inactive: "bg-gray-600/20 text-gray-400 border-gray-500/30",
      blocked: "bg-red-600/20 text-red-400 border-red-500/30"
    };
    const labels = {
      active: "Faol",
      inactive: "Faol emas",
      blocked: "Bloklangan"
    };
    
    return (
      <Badge variant="outline" className={variants[status] || variants.active}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    // Format: +998 XX XXX XX XX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      return `+${cleaned.slice(0,3)} ${cleaned.slice(3,5)} ${cleaned.slice(5,8)} ${cleaned.slice(8,10)} ${cleaned.slice(10)}`;
    }
    return phone;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Jami mijozlar</CardTitle>
              <User className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Faol mijozlar</CardTitle>
              <UserCheck className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Shu oyda yangi</CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.thisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Mijozlar
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {filteredCustomers.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Barcha mijozlarni boshqaring va ularning ma'lumotlarini ko'ring.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Download className="h-4 w-4 mr-2" />
                  CSV eksport
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Ism, email yoki telefon raqamini qidiring..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha statuslar</SelectItem>
                    <SelectItem value="active">Faol</SelectItem>
                    <SelectItem value="inactive">Faol emas</SelectItem>
                    <SelectItem value="blocked">Bloklangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Ro'yxat sanasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha vaqtlar</SelectItem>
                    <SelectItem value="today">Bugun</SelectItem>
                    <SelectItem value="week">So'nggi hafta</SelectItem>
                    <SelectItem value="month">So'nggi oy</SelectItem>
                    <SelectItem value="3months">So'nggi 3 oy</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={orderCountFilter} onValueChange={setOrderCountFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Buyurtmalar soni" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha miqdorlar</SelectItem>
                    <SelectItem value="none">Buyurtmasiz</SelectItem>
                    <SelectItem value="few">1-3 ta</SelectItem>
                    <SelectItem value="some">4-10 ta</SelectItem>
                    <SelectItem value="many">10 dan ortiq</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={spendingFilter} onValueChange={setSpendingFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Sarflangan mablag'" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha miqdorlar</SelectItem>
                    <SelectItem value="low">1M dan kam</SelectItem>
                    <SelectItem value="medium">1M - 5M</SelectItem>
                    <SelectItem value="high">5M dan ortiq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading && <p className="text-gray-400">Yuklanmoqda...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            {!loading && !error && customers.length === 0 && (
              <div className="text-center py-10 space-y-4">
                <p className="text-gray-400">Hozircha mijozlar yo'q.</p>
              </div>
            )}

            {!loading && !error && filteredCustomers.length === 0 && customers.length > 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400">Qidiruv bo'yicha mijozlar topilmadi.</p>
              </div>
            )}

            {!loading && !error && filteredCustomers.length > 0 && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                {/* Desktop/Table view */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/50">
                        <TableHead className="text-gray-300">Mijoz nomi</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="hidden sm:table-cell text-gray-300">Telefon</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-300">Buyurtmalar</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-300">Sarflangan</TableHead>
                        <TableHead className="hidden lg:table-cell text-gray-300">Ro'yxat sanasi</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead>
                          <span className="sr-only">Harakatlar</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-300" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{customer.name}</div>
                                {customer.notes && (
                                  <div className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                                    <MessageSquare className="h-3 w-3" />
                                    Izoh bor
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{customer.email || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{formatPhone(customer.phone)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-300">{customer.totalOrders || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-400">
                                {Number(customer.totalSpent || 0).toLocaleString()} so'm
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('uz-UZ') : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(customer.status)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Menyuni ochish</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuLabel className="text-gray-300">Harakatlar</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem 
                                  onClick={() => openView(customer)}
                                  className="text-gray-300 hover:bg-gray-700"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  To'liq ma'lumot
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openEdit(customer)}
                                  className="text-gray-300 hover:bg-gray-700"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Tahrirlash
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openNote(customer)}
                                  className="text-gray-300 hover:bg-gray-700"
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Izoh qo'shish
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                {customer.status === 'active' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateStatus(customer, 'inactive')}
                                    className="text-gray-300 hover:bg-gray-700"
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Faol emas qilish
                                  </DropdownMenuItem>
                                )}
                                {customer.status !== 'active' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateStatus(customer, 'active')}
                                    className="text-green-400 hover:bg-green-900/20"
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Faol qilish
                                  </DropdownMenuItem>
                                )}
                                {customer.status !== 'blocked' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateStatus(customer, 'blocked')}
                                    className="text-red-400 hover:bg-red-900/20"
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Bloklash
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile/Card view */}
                <div className="sm:hidden p-3 space-y-3">
                  {filteredCustomers.map((c) => (
                    <div key={c.id} className="rounded-xl border border-gray-700 bg-gray-800/80 p-4 shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-300" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.email || '-'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(c.status)}
                          <div className="text-xs text-gray-400 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('uz-UZ') : '-'}</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        {c.phone && (
                          <div className="text-gray-300"><span className="text-gray-400">Telefon:</span> {formatPhone(c.phone)}</div>
                        )}
                        <div className="text-gray-300"><span className="text-gray-400">Buyurtmalar:</span> {c.totalOrders || 0} ta</div>
                        <div className="text-gray-300"><span className="text-gray-400">Sarflangan:</span> {Number(c.totalSpent || 0).toLocaleString()} so'm</div>
                        {c.notes && (
                          <div className="text-xs text-blue-400 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Izoh bor</div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button onClick={() => openView(c)} variant="outline" className="h-9 px-3 border-gray-600 text-gray-300">
                          <Eye className="h-4 w-4 mr-1" /> Ko'rish
                        </Button>
                        <Button onClick={() => openEdit(c)} className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white">
                          <Pencil className="h-4 w-4 mr-1" /> Tahrirlash
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Customer Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Mijoz ma'lumotlari</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Ism-familiya</Label>
                  <p className="font-medium">{viewing.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Status</Label>
                  <div>{getStatusBadge(viewing.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-sm">{viewing.email || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Telefon</Label>
                  <p className="text-sm">{formatPhone(viewing.phone)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Ro'yxatdan o'tgan sana</Label>
                  <p className="text-sm">
                    {viewing.createdAt ? new Date(viewing.createdAt).toLocaleDateString('uz-UZ') : '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Oxirgi buyurtma</Label>
                  <p className="text-sm">
                    {viewing.lastOrderDate ? new Date(viewing.lastOrderDate).toLocaleDateString('uz-UZ') : '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Jami buyurtmalar</Label>
                  <p className="font-semibold text-blue-400">{viewing.totalOrders || 0} ta</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Jami sarflangan</Label>
                  <p className="font-semibold text-green-400">
                    {Number(viewing.totalSpent || 0).toLocaleString()} so'm
                  </p>
                </div>
              </div>

              {/* Notes */}
              {viewing.notes && (
                <div className="space-y-2">
                  <Label className="text-gray-400">Admin izohlari</Label>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm">{viewing.notes}</p>
                  </div>
                </div>
              )}

              {/* Order History */}
              <div className="space-y-3">
                <Label className="text-gray-400">Buyurtmalar tarixi</Label>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-500">Buyurtmalar mavjud emas</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {customerOrders.map((order, index) => (
                      <div key={order.id || index} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">#{order.id || order._id}</p>
                            <p className="text-sm text-gray-400">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('uz-UZ') : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-400">
                              {Number(order.total || order.totalAmount || 0).toLocaleString()} so'm
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {order.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="mt-2 text-sm text-gray-400">
                            {order.items.length} ta mahsulot
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={closeModals} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Yopish
            </Button>
            {viewing && (
              <Button onClick={() => {
                setViewOpen(false);
                openEdit(viewing);
              }} className="bg-blue-600 hover:bg-blue-700 text-white">
                Tahrirlash
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Mijoz ma'lumotlarini tahrirlash</DialogTitle>
            <DialogDescription className="text-gray-400">
              Mijoz ma'lumotlarini yangilang.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Ism-familiya *</Label>
              <Input 
                id="name" 
                value={editForm.name} 
                onChange={(e) => setEditForm(s => ({...s, name: e.target.value}))}
                placeholder="Ism-familiyani kiriting" 
                className="bg-gray-700 border-gray-600 text-white" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email *</Label>
              <Input 
                id="email" 
                type="email"
                value={editForm.email} 
                onChange={(e) => setEditForm(s => ({...s, email: e.target.value}))}
                placeholder="Email manzilini kiriting" 
                className="bg-gray-700 border-gray-600 text-white" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">Telefon</Label>
              <Input 
                id="phone" 
                value={editForm.phone} 
                onChange={(e) => setEditForm(s => ({...s, phone: e.target.value}))}
                placeholder="+998 XX XXX XX XX" 
                className="bg-gray-700 border-gray-600 text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm(s => ({...s, status: value}))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="inactive">Faol emas</SelectItem>
                  <SelectItem value="blocked">Bloklangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeModals} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Bekor qilish
            </Button>
            <Button onClick={updateCustomer} className="bg-green-600 hover:bg-green-700 text-white">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Admin izohi</DialogTitle>
            <DialogDescription className="text-gray-400">
              Mijoz haqida eslatma yoki izoh qo'shing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Izoh matnini kiriting..."
              className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button onClick={closeModals} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Bekor qilish
            </Button>
            <Button onClick={saveNote} className="bg-green-600 hover:bg-green-700 text-white">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
