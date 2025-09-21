'use client';
import Image from 'next/image';
import Link from 'next/link';
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
          <AuthButtonsWrapper />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
