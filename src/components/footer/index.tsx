// components/footer.tsx
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-neutral/10 border-t py-8 px-6">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* โลโก้ + ข้อความ */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="DSView Logo"
            width={100}
            height={40}
            className="object-contain"
          />
          <div className="text-sm text-neutral text-left">
            <p>© 2025 DSView. All rights reserved.</p>
            <p>School of Information Technology, KMITL</p>
            <p>1 Chalongkrung Road, Bangkok, Thailand 10520</p>
          </div>
        </div>

        {/* เวอร์ชัน/รายละเอียดเพิ่มเติม */}
        <div className="text-sm text-neutral text-left">
          <p>DSView</p>
          <p>Online Structural Validation based System</p>
        </div>
      </div>
    </footer>
  );
}
