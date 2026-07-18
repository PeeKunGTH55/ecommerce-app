"use client";

import { QRCodeSVG } from "qrcode.react";
import { formatTHB } from "@/lib/currency";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";

interface PromptPayQRProps {
  payload: string;
  amount: number;
  orderNumber: string;
  merchantName?: string;
}

export function PromptPayQR({
  payload,
  amount,
  orderNumber,
  merchantName = "MyShop",
}: PromptPayQRProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById("promptpay-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `promptpay-${orderNumber}.png`;
      link.href = pngFile;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6">
      {/* PromptPay branding */}
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded bg-blue-900 px-3 py-1 text-white font-bold text-sm">
          PromptPay
        </div>
        <span className="text-gray-500 text-sm">พร้อมเพย์</span>
      </div>

      {/* QR Code */}
      <div className="rounded-lg border-2 border-gray-100 p-4 bg-white">
        <QRCodeSVG
          id="promptpay-qr"
          value={payload}
          size={240}
          level="M"
          marginSize={1}
        />
      </div>

      {/* Details */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">ชำระเงินให้</p>
        <p className="font-semibold text-gray-900">{merchantName}</p>
        <p className="mt-2 text-2xl font-bold text-red-600">{formatTHB(amount)}</p>
        <p className="mt-1 text-xs text-gray-400">เลขที่คำสั่งซื้อ: {orderNumber}</p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2 w-full">
        <button
          onClick={handleDownload}
          className="btn-secondary flex-1"
        >
          <Download className="h-4 w-4" />
          บันทึก QR
        </button>
        <button onClick={handleCopy} className="btn-secondary flex-1">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "คัดลอกแล้ว" : "คัดลอกโค้ด"}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 w-full rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">วิธีชำระเงิน:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>เปิดแอปธนาคารของคุณ</li>
          <li>เลือกสแกน QR Code</li>
          <li>สแกน QR Code ด้านบน</li>
          <li>ตรวจสอบยอดเงินและกดยืนยัน</li>
        </ol>
      </div>
    </div>
  );
}