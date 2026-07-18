"use client";

import { useEffect, useState } from "react";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/app/actions/account";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import type { SavedAddress } from "@/lib/types";

export default function AddressesPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadAddresses() {
      const res = await getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
      } else {
        toast({ type: "error", title: res.error || "โหลดข้อมูลที่อยู่ล้มเหลว" });
      }
      setLoading(false);
    }
    loadAddresses();
  }, [toast]);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address: SavedAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const reloadAddresses = async () => {
    const res = await getAddresses();
    if (res.success && res.data) {
      setAddresses(res.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const label = formData.get("label") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const addressLine1 = formData.get("addressLine1") as string;
    const addressLine2 = formData.get("addressLine2") as string;
    const state = formData.get("state") as string;
    const city = formData.get("city") as string;
    const postalCode = formData.get("postalCode") as string;
    const isDefault = formData.get("isDefault") === "true";

    const payload = {
      label,
      first_name: firstName,
      last_name: lastName,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2 || null,
      city,
      state,
      postal_code: postalCode,
      country: "Thailand",
      is_default: isDefault,
    };

    let res;
    if (editingAddress) {
      res = await updateAddress(editingAddress.id, payload);
    } else {
      res = await createAddress(payload);
    }

    setSubmitting(false);

    if (res.success) {
      toast({
        type: "success",
        title: editingAddress ? "แก้ไขที่อยู่สำเร็จ" : "เพิ่มที่อยู่สำเร็จ",
      });
      setIsModalOpen(false);
      reloadAddresses();
    } else {
      toast({
        type: "error",
        title: res.error || "เกิดข้อผิดพลาดในการบันทึกที่อยู่",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบที่อยู่นี้ใช่หรือไม่?")) return;

    const res = await deleteAddress(id);
    if (res.success) {
      toast({ type: "success", title: "ลบที่อยู่เรียบร้อยแล้ว" });
      reloadAddresses();
    } else {
      toast({ type: "error", title: res.error || "ไม่สามารถลบที่อยู่ได้" });
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await setDefaultAddress(id);
    if (res.success) {
      toast({ type: "success", title: "ตั้งค่าที่อยู่หลักสำเร็จ" });
      reloadAddresses();
    } else {
      toast({ type: "error", title: res.error || "ไม่สามารถตั้งค่าที่อยู่หลักได้" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="text-gray-500 mt-4 text-sm">กำลังโหลดข้อมูลที่อยู่...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">ที่อยู่จัดส่ง</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการที่อยู่ของคุณสำหรับใช้ในการสั่งซื้อสินค้า</p>
        </div>
        {addresses.length < 5 && (
          <Button onClick={handleOpenAddModal} className="flex items-center gap-1.5 shrink-0 py-2.5">
            <Plus className="h-4 w-4" />
            <span>เพิ่มที่อยู่ใหม่</span>
          </Button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="font-semibold text-lg text-gray-900">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            เพิ่มที่อยู่จัดส่งของคุณตอนนี้ เพื่อเพิ่มความสะดวกรวดเร็วในการเลือกที่อยู่จัดส่งขณะชำระเงิน
          </p>
          <Button onClick={handleOpenAddModal} className="mt-6 flex items-center gap-1.5 mx-auto">
            <Plus className="h-4 w-4" />
            <span>เพิ่มที่อยู่แรกของคุณ</span>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-2xl p-5 bg-white relative flex flex-col justify-between transition-all ${
                address.is_default ? "border-red-600 ring-1 ring-red-600/30" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Header Label / Badge */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                  {address.label}
                </span>
                {address.is_default && (
                  <span className="text-green-600 flex items-center gap-1 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>ที่อยู่เริ่มต้น</span>
                  </span>
                )}
              </div>

              {/* Info detail */}
              <div className="text-sm text-gray-600 space-y-1 mb-5">
                <p className="font-semibold text-gray-900">
                  {address.first_name} {address.last_name}
                </p>
                <p>โทร: {address.phone}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.state} {address.city} {address.postal_code}
                </p>
              </div>

              {/* Action buttons */}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center gap-2 mt-auto">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEditModal(address)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-50 transition-colors"
                    title="แก้ไขที่อยู่"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-50 transition-colors"
                    title="ลบที่อยู่"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                  >
                    ตั้งเป็นค่าเริ่มต้น
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? "แก้ไขที่อยู่จัดส่ง" : "เพิ่มที่อยู่จัดส่งใหม่"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="ชื่อเล่นที่อยู่ (เช่น บ้าน, ที่ทำงาน, คอนโด)"
              name="label"
              defaultValue={editingAddress?.label || "บ้าน"}
              required
              placeholder="กรอกชื่อเล่นที่อยู่"
            />
            <div className="hidden sm:block"></div>
            
            <Input
              label="ชื่อ"
              name="firstName"
              defaultValue={editingAddress?.first_name || ""}
              required
            />
            <Input
              label="นามสกุล"
              name="lastName"
              defaultValue={editingAddress?.last_name || ""}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="เบอร์โทรศัพท์"
                name="phone"
                defaultValue={editingAddress?.phone || ""}
                required
                placeholder="กรอกเบอร์โทรศัพท์ติดต่อ"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="ที่อยู่ (บ้านเลขที่, ถนน, หมู่บ้าน/ซอย)"
                name="addressLine1"
                defaultValue={editingAddress?.address_line1 || ""}
                required
                placeholder="เช่น 123/45 หมู่ 1 ซอยประชาราษฎร์ 3"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="รายละเอียดที่อยู่เพิ่มเติม (ถ้ามี)"
                name="addressLine2"
                defaultValue={editingAddress?.address_line2 || ""}
                placeholder="เช่น แขวง/ตำบล หรือสถานที่ใกล้เคียง"
              />
            </div>
            <Input
              label="อำเภอ/เขต"
              name="state"
              defaultValue={editingAddress?.state || ""}
              required
            />
            <Input
              label="จังหวัด"
              name="city"
              defaultValue={editingAddress?.city || ""}
              required
            />
            <Input
              label="รหัสไปรษณีย์"
              name="postalCode"
              defaultValue={editingAddress?.postal_code || ""}
              required
              maxLength={5}
            />
            
            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                value="true"
                defaultChecked={editingAddress?.is_default || false}
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 select-none">
                ตั้งเป็นที่อยู่จัดส่งค่าเริ่มต้น
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" isLoading={submitting}>
              บันทึกที่อยู่
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
