import Image from 'next/image';

function Footer() {
  return (
    <footer className="bg-neutral/10 border-t px-6 py-8">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* โลโก้ + ข้อความ */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="DSView Logo"
            width={100}
            height={40}
            className="object-contain"
            priority
            sizes="100px"
          />
          <div className="text-neutral text-left text-sm">
            <p>© 2025 DSView. All rights reserved.</p>
            <p>School of Information Technology, KMITL</p>
            <p>1 Chalongkrung Road, Bangkok, Thailand 10520</p>
          </div>
        </div>

        {/* เวอร์ชัน/รายละเอียดเพิ่มเติม */}
        <div className="text-neutral text-left text-sm">
          <p>DSView</p>
          <p>Online Structural Validation based System</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
