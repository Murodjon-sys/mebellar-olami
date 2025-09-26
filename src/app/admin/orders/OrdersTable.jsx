"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import Lucide from "lucide-react";
const {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Printer,
  Phone,
  MapPin,
  Calendar,
} = Lucide;

export default function OrdersTable({
  data = [],
  pagination = {},
  onSelectOrder,
  onSelectAll,
  selectedOrders = [],
  onViewOrder,
  onUpdateStatus,
  onPrintOrder,
}) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        text: "Kutilmoqda",
      },
      confirmed: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        text: "Tasdiqlangan",
      },
      processing: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        text: "Tayyorlanmoqda",
      },
      delivered: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        text: "Yetkazilgan",
      },
      completed: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        text: "Yakunlangan",
      },
      cancelled: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        text: "Bekor qilingan",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const statusConfig = {
      pending: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        text: "Kutilmoqda",
      },
      paid: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        text: "To'langan",
      },
      failed: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        text: "Muvaffaqiyatsiz",
      },
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const isAllSelected =
    selectedOrders.length === data.length && data.length > 0;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Buyurtmalar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700/50">
            {onSelectAll && (
              <TableHead className="w-12 text-gray-300">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="text-gray-300">ID</TableHead>
            <TableHead className="text-gray-300">Mijoz</TableHead>
            <TableHead className="text-gray-300">Mahsulotlar</TableHead>
            <TableHead className="text-gray-300">Summa</TableHead>
            <TableHead className="text-gray-300">Holat</TableHead>
            <TableHead className="text-gray-300">To'lov</TableHead>
            <TableHead className="hidden lg:table-cell text-gray-300">
              Sana
            </TableHead>
            <TableHead>
              <span className="sr-only">Harakatlar</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow
              key={order._id}
              className="border-gray-700 hover:bg-gray-700/50"
            >
              {onSelectOrder && (
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order._id)}
                    onCheckedChange={() => onSelectOrder(order._id)}
                  />
                </TableCell>
              )}
              <TableCell className="font-mono text-sm">
                #{order._id.slice(-8)}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {order.phone}
                  </div>
                  {order.address && (
                    <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">
                        {order.address}
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {order.items?.length || 0} ta mahsulot
                </div>
              </TableCell>
              <TableCell>
                <div className="font-semibold text-green-400">
                  {Number(order.total || 0).toLocaleString()} so'm
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menyuni ochish</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-gray-800 border-gray-700"
                  >
                    <DropdownMenuLabel className="text-gray-300">
                      Harakatlar
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    {onViewOrder && (
                      <DropdownMenuItem
                        onClick={() => onViewOrder(order)}
                        className="text-gray-300 hover:bg-gray-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ko'rish
                      </DropdownMenuItem>
                    )}
                    {onPrintOrder && (
                    <DropdownMenuItem
                        onClick={() => onPrintOrder(order)}
                        className="text-gray-300 hover:bg-gray-700"
                      >
                      <Printer className="mr-2 h-4 w-4" />
                        Chop etish
                      </DropdownMenuItem>
                    )}
                    {onUpdateStatus && (
                      <>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(order._id, "confirmed")}
                          className="text-blue-400 hover:bg-gray-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Tasdiqlash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(order._id, "delivered")}
                          className="text-green-400 hover:bg-gray-700"
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Yetkazilgan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(order._id, "cancelled")}
                          className="text-red-400 hover:bg-red-900/20"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Bekor qilish
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination info */}
      {pagination && pagination.total > 0 && (
        <div className="px-4 py-3 border-t border-gray-700 text-sm text-gray-400">
          {pagination.limit * (pagination.page - 1) + 1}-
          {Math.min(pagination.limit * pagination.page, pagination.total)} of{" "}
          {pagination.total} buyurtma
        </div>
      )}
    </div>
  );
}
