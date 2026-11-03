import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/mock-auth";
import { getOrdersForSeller } from "@/lib/queries/orders";
import { formatPriceIDR } from "@/lib/utils";

const COD_LABELS = {
  pending: "Menunggu",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Direfund",
};

export default async function CashOnDeliveryPage() {
  const user = await getCurrentUser();
  const orders = user ? await getOrdersForSeller(user.id) : [];
  const codOrders = orders.filter((order) => order.paymentMethod === "cod");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Cash on Delivery</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pesanan dengan metode bayar di tempat (COD) untuk toko Anda
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Transactions Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-800">
                Transaksi COD ({codOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-gray-600">
                      Order
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">
                      Total
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 text-sm text-gray-500"
                      >
                        No records found!
                      </TableCell>
                    </TableRow>
                  ) : (
                    codOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-xs font-medium text-gray-800">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700">
                          {formatPriceIDR(order.total)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700">
                          {COD_LABELS[order.status] || order.statusLabel}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {order.date}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Info Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 rounded-lg p-5 text-sm leading-relaxed">
            <span className="font-semibold text-emerald-950">Catatan:</span>{" "}
            Pesanan bayar di tempat dicatat pada tabel orders dengan{" "}
            <code className="text-[11px] font-mono">payment_method = cod</code>{" "}
            dan tampil di daftar ini. Potongan komisi otomatis dari saldo wallet
            belum diimplementasikan di backend.
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Commission Debt Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-800">
                Commission Debt
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-5 space-y-2">
              <p className="text-sm font-medium text-teal-600">
                {codOrders.length === 0
                  ? "You have no debt."
                  : `${codOrders.length} pesanan COD menunggu penyelesaian.`}
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Komisi COD belum dihitung otomatis oleh sistem (tidak ada kolom
                komisi per pesanan di database), jadi saldo utang komisi selalu
                nol.
              </p>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-800">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-xs leading-relaxed">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <p>
                  Sakelar COD per toko belum memiliki kolom di database, jadi
                  menu ini sengaja tidak menyimpan apa pun. Metode pembayaran
                  Cash on Delivery dikendalikan secara global oleh admin lewat
                  <span className="font-semibold"> Settings &rarr; Payment</span>,
                  dan checkout mengikuti pengaturan tersebut.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
