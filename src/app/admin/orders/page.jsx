"use client";

import * as React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Clock,
  Users,
  Package,
  DollarSign,
  Search,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Package2,
  Truck,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  StickyNote,
  FileText,
  Trash,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [selectedOrders, setSelectedOrders] = React.useState([]);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [toDelete, setToDelete] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [paymentFilter, setPaymentFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState("all");
  const [adminNotes, setAdminNotes] = React.useState("");
  const [editingNotes, setEditingNotes] = React.useState(null);

  const API = (path) => {
    const base = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}${path}`;
  };

  // Statistics
  const stats = React.useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const confirmed = orders.filter(
      (o) => o.status === "confirmed" || o.status === "processing"
    ).length;
    const delivered = orders.filter(
      (o) => o.status === "delivered" || o.status === "completed"
    ).length;
    const totalRevenue = orders
      .filter((o) => o.status === "delivered" || o.status === "completed")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      total,
      pending,
      confirmed,
      delivered,
      totalRevenue,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" || order.paymentStatus === paymentFilter;

      const matchesDate =
        dateFilter === "all" ||
        (() => {
          const orderDate = new Date(order.createdAt);
          const today = new Date();
          const startOfToday = new Date(today.setHours(0, 0, 0, 0));
          const startOfWeek = new Date(
            today.setDate(today.getDate() - today.getDay())
          );
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );

          switch (dateFilter) {
            case "today":
              return orderDate >= startOfToday;
            case "week":
              return orderDate >= startOfWeek;
            case "month":
              return orderDate >= startOfMonth;
            default:
              return true;
          }
        })();

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, dateFilter]);

  const loadOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API("/api/orders"));
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Yuklashda xatolik");

      setOrders(data.data.orders || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const deleteOrder = async (orderId) => {
    try {
      setDeleting(true);
      setError(null); // Clear previous errors
      let res = await fetch(API(`/api/orders/${orderId}`), { method: "DELETE" });
      let data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        res = await fetch(API(`/api/orders/${orderId}/delete`), { method: "POST" });
        data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          const msg = data?.error || `${res.status} ${res.statusText}` || "O'chirishda xatolik";
          throw new Error(msg);
        }
      }
      await loadOrders();
      setDeleteOpen(false);
      setToDelete(null);
    } catch (e) {
      setError(e?.message || "O'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  const updateOrderStatus = async (orderId, status, paymentStatus = null) => {
    try {
      setLoading(true);
      const updates = { status };
      if (paymentStatus) updates.paymentStatus = paymentStatus;

      const res = await fetch(API(`/api/orders/${orderId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Yangilashda xatolik");

      await loadOrders();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (keep other functions like updateAdminNotes, bulkUpdateStatus, exportOrders, printOrder)

  const openView = (order) => {
    setViewing(order);
    setViewOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", text: "Kutilmoqda" },
      confirmed: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", text: "Tasdiqlangan" },
      processing: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", text: "Tayyorlanmoqda" },
      delivered: { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Yetkazilgan" },
      completed: { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Yakunlangan" },
      cancelled: { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Bekor qilingan" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant="outline" className={config.color}>{config.text}</Badge>;
  };

  const getPaymentBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", text: "Kutilmoqda" },
      paid: { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "To'langan" },
      failed: { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Muvaffaqiyatsiz" },
    };
    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return <Badge variant="outline" className={config.color}>{config.text}</Badge>;
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length
        ? []
        : filteredOrders.map((order) => order._id)
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* ... (keep all stat cards) ... */}
        </div>

        {/* Main Orders Card */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            {/* ... (keep card header) ... */}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* ... (keep all filters) ... */}
            </div>

            {loading && <p>Yuklanmoqda...</p>}
            {error && !deleteOpen && <p className="text-red-500">{error}</p>}

            {!loading && !error && orders.length === 0 && (
              <div className="text-center py-10 space-y-4">
                <Package className="mx-auto h-16 w-16 text-gray-500" />
                <p>Hozircha buyurtmalar yo'q.</p>
              </div>
            )}

            {!loading && filteredOrders.length > 0 && (
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                {/* Desktop/Table view */}
                <div className="hidden sm:block">
                  <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Mijoz</TableHead>
                      <TableHead className="text-gray-300 hidden md:table-cell">Telefon</TableHead>
                      <TableHead className="text-gray-300 hidden lg:table-cell">Manzil</TableHead>
                      <TableHead className="text-gray-300">Mahsulotlar</TableHead>
                      <TableHead className="text-gray-300">Jami</TableHead>
                      <TableHead className="text-gray-300 hidden md:table-cell">To'lov</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300 hidden lg:table-cell">Sana</TableHead>
                      <TableHead className="text-gray-300"><span className="sr-only">Harakatlar</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{order.customerName || '—'}</span>
                            <span className="text-xs text-gray-400 font-mono">#{String(order._id).slice(-8)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-300">{order.phone || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-400 max-w-[280px] truncate" title={order.address}>{order.address || '—'}</TableCell>
                        <TableCell className="text-sm text-gray-200">
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            <div className="space-y-1">
                              <div className="truncate max-w-[260px]">
                                {order.items.slice(0, 2).map((it, idx) => (
                                  <span key={idx} className="inline-block text-gray-300">
                                    {it.name}{it.quantity ? ` ×${it.quantity}` : ''}{idx < Math.min(1, order.items.length - 1) ? ', ' : ''}
                                  </span>
                                ))}
                                {order.items.length > 2 && (
                                  <span className="text-gray-400"> va {order.items.length - 2} ta...</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">{order.items.length} ta</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-400">
                            {Number(order.total || 0).toLocaleString()} so'm
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getPaymentBadge(order.paymentStatus || 'pending')}
                          <div className="text-xs text-gray-400 mt-1">{order.paymentMethod === 'card' ? 'Karta' : 'Naqd'}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status || 'pending')}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString("uz-UZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => { setToDelete(order); setDeleteOpen(true); }}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash className="h-4 w-4 mr-1" /> O'chirish
                            </Button>
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
                                <DropdownMenuItem onClick={() => openView(order)} className="text-gray-300 hover:bg-gray-700">
                                  <Eye className="mr-2 h-4 w-4" /> Ko'rish
                                </DropdownMenuItem>
                                {/* ... (other menu items) ... */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>

                {/* Mobile/Card view */}
                <div className="sm:hidden p-3 space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="rounded-xl border border-gray-700 bg-gray-800/80 p-4 shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{order.customerName || '—'}</div>
                          <div className="text-xs text-gray-400 font-mono">#{String(order._id).slice(-8)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">{Number(order.total || 0).toLocaleString()} so'm</div>
                          <div className="text-xs text-gray-400 mt-1">{order.paymentMethod === 'card' ? 'Karta' : 'Naqd'}</div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        {order.phone && (
                          <div className="text-gray-300"><span className="text-gray-400">Telefon:</span> {order.phone}</div>
                        )}
                        {order.address && (
                          <div className="text-gray-300"><span className="text-gray-400">Manzil:</span> {order.address}</div>
                        )}
                        <div className="text-gray-300">
                          <span className="text-gray-400">Mahsulotlar:</span>{' '}
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            <span>
                              {order.items.map((it, i) => `${it.name}${it.quantity ? ` ×${it.quantity}` : ''}`).join(', ')}
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getPaymentBadge(order.paymentStatus || 'pending')}
                          {getStatusBadge(order.status || 'pending')}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString('uz-UZ')} • {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <Button
                          onClick={() => { setToDelete(order); setDeleteOpen(true); }}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash className="h-4 w-4 mr-1" /> O'chirish
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9 px-3 border-gray-600 text-gray-300">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuLabel className="text-gray-300">Harakatlar</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem onClick={() => openView(order)} className="text-gray-300 hover:bg-gray-700">
                              <Eye className="mr-2 h-4 w-4" /> Ko'rish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        {/* ... (keep details dialog) ... */}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[450px] bg-gray-800 border-gray-700 text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash className="h-5 w-5" /> O'chirishni tasdiqlang
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {toDelete ? (
                <>Buyurtma <span className="font-mono">#{toDelete._id.slice(-8)}</span> ni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.</>
              ) : ("")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {toDelete && (
              <div className="bg-gray-700/50 rounded p-3">
                <div className="flex justify-between"><span className="text-gray-400">Mijoz:</span><span className="font-medium">{toDelete.customerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Telefon:</span><span className="font-medium">{toDelete.phone}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Summa:</span><span className="font-medium text-green-400">{Number(toDelete.total || 0).toLocaleString()} so'm</span></div>
              </div>
            )}
            {error && <p className="text-red-400">{error}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300"
              onClick={() => { if (!deleting) { setDeleteOpen(false); setToDelete(null); setError(null); } }}
              disabled={deleting}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={() => toDelete && deleteOrder(toDelete._id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}