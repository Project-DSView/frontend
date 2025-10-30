'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import DesktopMenu from './DesktopMenu';
import AuthButtonsWrapper from './AuthButtonsWrapper';
import MobileMenu from './MobileMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Navbar = () => {
  return (
    <nav className="border-border bg-background/80 border-b px-4 py-2 shadow-md backdrop-blur-md md:px-6 lg:px-8">
      <div className="flex h-12 w-full items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <div className="rounded-xl p-1">
              <Link href="/">
                <div className="relative h-10 w-10 md:h-12 md:w-12 lg:h-32 lg:w-32">
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
              className="bg-error hover:bg-error/90 hidden items-center space-x-2 rounded-lg px-3 py-1.5 text-white shadow-sm transition-all duration-200 hover:text-white hover:shadow-md sm:px-4 md:flex"
            >
              <span>Report Issue</span>
            </Button>
          </a>
          <AuthButtonsWrapper />
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
