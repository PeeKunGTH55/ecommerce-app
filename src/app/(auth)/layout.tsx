import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-xl">
              M
            </div>
            <span className="font-heading font-bold text-2xl text-gray-900">MyShop</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}