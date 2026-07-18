"use client";

import Link from "next/link";
import { X, Search, User, Package, Home, Grid3x3, Star, LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    window.location.href = "/";
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const links = [
    { href: "/", label: "หน้าแรก", icon: Home },
    { href: "/products", label: "สินค้าทั้งหมด", icon: Package },
    { href: "/categories", label: "หมวดหมู่", icon: Grid3x3 },
    { href: "/products?category=featured", label: "ขายดี", icon: Star },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed left-0 top-0 h-full w-full max-w-xs bg-white shadow-xl flex flex-col animate-slide-in-left"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-lg">
              M
            </div>
            <span className="font-heading font-bold text-xl text-gray-900">MyShop</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="ค้นหาสินค้า..."
              className="input pl-10! pr-4 w-full"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1" aria-label="Mobile navigation">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4 space-y-2">
          {user ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className="block px-3 py-2.5 rounded-xl bg-gray-50 mb-2 border border-gray-150 hover:bg-gray-100 transition-colors"
              >
                <p className="text-xs text-gray-500">บัญชีผู้ใช้</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
              </Link>

              <div className="space-y-1 py-1 mb-3">
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Package className="h-4 w-4 text-gray-400" />
                  <span>ประวัติการสั่งซื้อ</span>
                </Link>
                <Link
                  href="/account/addresses"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Grid3x3 className="h-4 w-4 text-gray-400" />
                  <span>ที่อยู่จัดส่งสินค้า</span>
                </Link>
              </div>

              <button
                onClick={handleSignOut}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="btn-primary w-full"
              >
                <User className="h-5 w-5" />
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="btn-secondary w-full"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}