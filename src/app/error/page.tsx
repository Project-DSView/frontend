'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ErrorPage = () => {
  return (
    <div className="from-background via-background to-muted/20 relative flex min-h-dvh w-full flex-col items-center justify-center gap-8 bg-gradient-to-br px-4 py-16">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Error Icon */}
        <div className="bg-error/10 dark:bg-error/20 flex h-24 w-24 items-center justify-center rounded-full">
          <AlertTriangle className="text-error h-12 w-12" strokeWidth={2} />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-error text-5xl font-extrabold sm:text-6xl md:text-7xl">
            เกิดข้อผิดพลาด
          </h1>
          <h2 className="text-foreground text-xl font-semibold sm:text-2xl">
            Something went wrong
          </h2>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base">
            เกิดข้อผิดพลาดบางอย่างขึ้น กรุณาลองใหม่อีกครั้งหรือกลับไปที่หน้าหลัก
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              กลับหน้าหลัก
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t to-transparent" />
    </div>
  );
};

export default ErrorPage;
