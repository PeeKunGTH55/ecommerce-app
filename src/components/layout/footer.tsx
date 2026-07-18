import Link from "next/link";

export function Footer() {
  const footerLinks = {
    shop: [
      { label: "สินค้าทั้งหมด", href: "/products" },
      { label: "หมวดหมู่", href: "/categories" },
      { label: "สินค้าใหม่", href: "/products?sort=newest" },
      { label: "ขายดี", href: "/products?sort=popular" },
    ],
    support: [
      { label: "ติดต่อเรา", href: "/contact" },
      { label: "คำถามที่พบบ่อย", href: "/faq" },
      { label: "นโยบายจัดส่ง", href: "/shipping-policy" },
      { label: "นโยบายคืนสินค้า", href: "/return-policy" },
    ],
    account: [
      { label: "บัญชีของฉัน", href: "/account" },
      { label: "ประวัติการสั่งซื้อ", href: "/orders" },
      { label: "ที่อยู่จัดส่ง", href: "/account/addresses" },
      { label: "การตั้งค่า", href: "/account/settings" },
    ],
    legal: [
      { label: "เงื่อนไขการใช้งาน", href: "/terms" },
      { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
      { label: "คุกกี้", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { label: "Facebook", href: "https://facebook.com", icon: "📘" },
    { label: "Instagram", href: "https://instagram.com", icon: "📷" },
    { label: "Line", href: "https://line.me", icon: "💬" },
    { label: "TikTok", href: "https://tiktok.com", icon: "🎵" },
  ];

  const paymentMethods = [
    { label: "PromptPay", icon: "🏦" },
    { label: "Cash on Delivery", icon: "💵" },
    { label: "Credit Card", icon: "💳" },
    { label: "Bank Transfer", icon: "🏛️" },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="MyShop Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-xl">
                M
              </div>
              <span className="font-heading font-bold text-xl text-gray-900">MyShop</span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-xs">
              ร้านค้าออนไลน์ครบครัน สินค้าคุณภาพ ราคาคุ้มค่า ชำระเงินง่ายด้วย PromptPay QR Code
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <nav aria-label="Shop">
            <h3 className="font-semibold text-gray-900 mb-4">ช้อปปิ้ง</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support Links */}
          <nav aria-label="Support">
            <h3 className="font-semibold text-gray-900 mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account Links */}
          <nav aria-label="Account">
            <h3 className="font-semibold text-gray-900 mb-4">บัญชี</h3>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">ชำระเงินได้ด้วย:</span>
              <div className="flex items-center gap-3">
                {paymentMethods.map((method) => (
                  <span
                    key={method.label}
                    className="flex items-center gap-1.5 text-sm text-gray-600"
                  >
                    <span className="text-lg">{method.icon}</span>
                    {method.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-500">
              <p>© {new Date().getFullYear()} MyShop. สงวนลิขสิทธิ์.</p>
              <div className="flex items-center gap-4">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-red-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}