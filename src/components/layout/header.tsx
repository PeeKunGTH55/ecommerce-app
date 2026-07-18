"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, ShoppingBag, User, Search, Heart, LogOut, MapPin } from "lucide-react";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useCart } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mounted = useMounted();
  const count = useCart((s) => s.count());
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
    window.location.href = "/";
  };

  return (
    <header className="header">
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="MyShop Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-lg">
              M
            </div>
            <span className="hidden font-heading font-bold text-xl text-gray-900 sm:block">
              MyShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link href="/products" className="nav-link">
              สินค้าทั้งหมด
            </Link>
            <Link href="/products?category=featured" className="nav-link">
              ขายดี
            </Link>
            <Link href="/products?category=new" className="nav-link">
              สินค้าใหม่
            </Link>
            <Link href="/categories" className="nav-link">
              หมวดหมู่
            </Link>
          </nav>

          {/* Search, Wishlist, Cart, User */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="ค้นหาสินค้า..."
                className="input pl-10! pr-4 w-64"
                aria-label="Search products"
              />
            </div>

            {/* Wishlist */}
            <button
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-medium px-1">
                  {count}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative hidden md:block">
              {mounted && user ? (
                <Dropdown
                  align="end"
                  trigger={
                    <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-all duration-200 select-none">
                      <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold border border-red-200 shadow-sm">
                        {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden lg:block">
                        {user.user_metadata?.full_name || user.email?.split("@")[0]}
                      </span>
                    </button>
                  }
                  content={
                    <div className="w-56 p-1.5">
                      <div className="px-3 py-2 text-xs text-gray-400 font-semibold select-none">
                        ผู้ใช้งาน: {user.email}
                      </div>
                      <DropdownDivider />
                      <DropdownItem
                        icon={<User className="h-4 w-4" />}
                        onClick={() => window.location.href = "/account"}
                      >
                        บัญชีของฉัน
                      </DropdownItem>
                      <DropdownItem
                        icon={<ShoppingBag className="h-4 w-4" />}
                        onClick={() => window.location.href = "/account/orders"}
                      >
                        ประวัติการสั่งซื้อ
                      </DropdownItem>
                      <DropdownItem
                        icon={<MapPin className="h-4 w-4" />}
                        onClick={() => window.location.href = "/account/addresses"}
                      >
                        ที่อยู่จัดส่งสินค้า
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem
                        icon={<LogOut className="h-4 w-4 text-red-500" />}
                        danger
                        onClick={handleSignOut}
                      >
                        ออกจากระบบ
                      </DropdownItem>
                    </div>
                  }
                />
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}