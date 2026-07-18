"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { name: "ข้อมูลบัญชีผู้ใช้", href: "/account", icon: User },
  { name: "ประวัติการสั่งซื้อ", href: "/account/orders", icon: ShoppingBag },
  { name: "ที่อยู่จัดส่งสินค้า", href: "/account/addresses", icon: MapPin },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="section bg-gray-50 min-h-screen py-10">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                เมนูบัญชี
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/account" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-red-50 text-red-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", isActive ? "text-red-600" : "text-gray-400")} />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className={cn("h-4 w-4 transition-transform", isActive ? "text-red-500 translate-x-0.5" : "text-gray-300")} />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
