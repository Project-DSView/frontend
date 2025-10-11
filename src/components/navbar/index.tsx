'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DesktopMenu from './DesktopMenu';
import AuthButtonsWrapper from './AuthButtonsWrapper';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  return (
    <nav className="border-b border-gray-100 bg-white/80 px-8 py-2 shadow-md backdrop-blur-md">
      <div className="flex h-12 w-full items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-8 sm:space-x-12">
          <div className="flex items-center space-x-2">
            <div className="rounded-xl p-1">
              <Link href="/">
                <div className="relative h-12 w-12 sm:h-32 sm:w-32">
                  <Image src="/logo.svg" alt="logo" fill className="object-contain" />
                </div>
              </Link>
            </div>
          </div>
          <DesktopMenu />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <a href="https://forms.gle/y8GzM5HxdVd8stjo6" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className="bg-error hover:bg-error/90 hidden items-center space-x-2 rounded-lg px-3 py-1.5 text-white shadow-sm transition-all duration-200 hover:shadow-md sm:px-4 md:flex"
            >
              <Bug size={16} />
              <span>Report Issue</span>
            </Button>
          </a>
          <AuthButtonsWrapper />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
