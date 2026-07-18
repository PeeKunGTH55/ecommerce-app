import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
    email: z.string().email("อีเมลไม่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  phone: z.string().min(10, "เบอร์โทรไม่ถูกต้อง").max(10, "เบอร์โทรไม่ถูกต้อง"),
  addressLine1: z.string().min(1, "กรุณากรอกที่อยู่"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "กรุณากรอกจังหวัด"),
  state: z.string().min(1, "กรุณากรอกอำเภอ/เขต"),
  postalCode: z.string().min(5, "รหัสไปรษณีย์ไม่ถูกต้อง").max(5, "รหัสไปรษณีย์ไม่ถูกต้อง"),
  country: z.string().default("TH"),
});

export const checkoutSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  phone: z.string().min(10, "เบอร์โทรไม่ถูกต้อง").max(10, "เบอร์โทรไม่ถูกต้อง"),
  paymentMethod: z.enum(["promptpay", "cod"]),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().optional(),
  sameAsBilling: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  slug: z.string().min(1, "กรุณากรอก slug"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "ราคาต้องมากกว่า 0"),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, "สต็อกต้องมากกว่าหรือเท่ากับ 0"),
  categoryId: z.string().uuid("กรุณาเลือกหมวดหมู่").optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่"),
  slug: z.string().min(1, "กรุณากรอก slug"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;