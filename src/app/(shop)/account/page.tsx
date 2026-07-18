"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile, getOrders } from "@/app/actions/account";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatTHB } from "@/lib/currency";
import { ShoppingBag, ChevronRight, User as UserIcon, Calendar } from "lucide-react";
import Link from "next/link";
import { ORDER_STATUSES, Profile, Order } from "@/lib/types";

export default function AccountPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<(Profile & { email?: string }) | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [profileRes, ordersRes] = await Promise.all([
        getProfile(),
        getOrders(),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.data as (Profile & { email?: string }));
      } else {
        toast({ type: "error", title: profileRes.error || "โหลดข้อมูลโปรไฟล์ล้มเหลว" });
      }

      if (ordersRes.success) {
        setOrders((ordersRes.data as Order[]) || []);
      }

      setLoading(false);
    }
    loadData();
  }, [toast]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);
    setSubmitting(false);

    if (res.success) {
      toast({ type: "success", title: "อัปเดตข้อมูลสำเร็จ" });
      // Reload profile
      const profileRes = await getProfile();
      if (profileRes.success) {
        setProfile(profileRes.data as (Profile & { email?: string }));
      }
    } else {
      toast({ type: "error", title: res.error || "เกิดข้อผิดพลาด" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="text-gray-500 mt-4 text-sm">กำลังโหลดข้อมูลบัญชี...</p>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">ภาพรวมบัญชี</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการโปรไฟล์และความปลอดภัยของบัญชีคุณ</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Info Form */}
        <section className="space-y-6">
          <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-gray-400" />
            ข้อมูลส่วนตัว
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="อีเมล (ไม่สามารถเปลี่ยนได้)"
              value={profile?.email || ""}
              disabled
              readOnly
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <Input
              label="ชื่อ-นามสกุล"
              name="fullName"
              defaultValue={profile?.full_name || ""}
              required
              placeholder="กรอกชื่อ-นามสกุลของคุณ"
            />
            <Input
              label="เบอร์โทรศัพท์"
              name="phone"
              defaultValue={profile?.phone || ""}
              placeholder="เช่น 0812345678"
            />
            <Button type="submit" className="w-full sm:w-auto" isLoading={submitting}>
              บันทึกการเปลี่ยนแปลง
            </Button>
          </form>
        </section>

        {/* Recent Orders Summary */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
              คำสั่งซื้อล่าสุด
            </h2>
            {orders.length > 3 && (
              <Link
                href="/account/orders"
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-0.5"
              >
                ดูทั้งหมด
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center bg-gray-50">
              <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">คุณยังไม่มีประวัติการสั่งซื้อ</p>
              <Link href="/products" className="btn-primary mt-4 inline-flex">
                เริ่มช้อปปิ้งเลย
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const statusInfo = ORDER_STATUSES.find((s) => s.value === order.status);
                const orderDate = new Date(order.created_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          #{order.order_number}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            statusInfo?.color || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusInfo?.label || order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {orderDate}
                        </span>
                        <span>ยอดรวม: {formatTHB(Number(order.total))}</span>
                      </div>
                    </div>
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="btn-secondary py-1.5 px-3 text-xs w-full sm:w-auto text-center"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
