"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signUp } from "@/app/actions/auth";

export default function RegisterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    setLoading(false);

    if (result.success) {
      toast({ type: "success", title: result.message || "สมัครสมาชิกสำเร็จ" });
      setDone(true);
    } else {
      toast({ type: "error", title: result.error || "เกิดข้อผิดพลาด" });
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ตรวจสอบอีเมลของคุณ</h1>
        <p className="text-gray-600">
          เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาคลิกลิงก์เพื่อเปิดใช้งานบัญชี
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-flex">
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">สมัครสมาชิก</h1>
      <p className="text-gray-500 mb-6">สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้ง</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="ชื่อ-นามสกุล" name="fullName" required placeholder="สมชาย ใจดี" />
        <Input label="อีเมล" name="email" type="email" required placeholder="you@email.com" />
        <Input label="รหัสผ่าน" name="password" type="password" required placeholder="••••••••" helperText="อย่างน้อย 6 ตัวอักษร" />
        <Button type="submit" className="w-full" isLoading={loading}>
          สมัครสมาชิก
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="text-red-600 font-medium hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}