"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signIn, signInWithOAuth } from "@/app/actions/auth";

export default function LoginPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    setLoading(false);

    if (result.success) {
      toast({ type: "success", title: result.message || "เข้าสู่ระบบสำเร็จ" });
      window.location.href = "/";
    } else {
      toast({ type: "error", title: result.error || "เกิดข้อผิดพลาด" });
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">เข้าสู่ระบบ</h1>
      <p className="text-gray-500 mb-6">ยินดีต้อนรับกลับมา!</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="อีเมล" name="email" type="email" required placeholder="you@email.com" />
        <Input label="รหัสผ่าน" name="password" type="password" required placeholder="••••••••" />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-red-600 hover:underline">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <Button type="submit" className="w-full" isLoading={loading}>
          เข้าสู่ระบบ
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">หรือ</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => signInWithOAuth("google")}
        >
          เข้าสู่ระบบด้วย Google
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="text-red-600 font-medium hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}