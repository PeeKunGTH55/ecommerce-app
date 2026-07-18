export function formatTHB(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "฿0.00";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(num: number | string): string {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return new Intl.NumberFormat("th-TH").format(n);
}

export function parseTHB(thbString: string): number {
  return parseFloat(thbString.replace(/[^\d.-]/g, "")) || 0;
}

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function calculateTotal(
  subtotal: number,
  shipping: number = 0,
  discount: number = 0
): number {
  return Math.max(0, subtotal + shipping - discount);
}

export function roundTHB(amount: number): number {
  return Math.round(amount * 100) / 100;
}