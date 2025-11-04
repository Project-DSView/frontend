'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import DesktopMenu from './DesktopMenu';
import AuthButtonsWrapper from './AuthButtonsWrapper';
import MobileMenu from './MobileMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useScrollPosition } from '@/hooks';

const Navbar = () => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { hasScrolled } = useScrollPosition(100);

  return (
    <nav className="border-border bg-background/95 sticky top-0 z-50 border-b px-4 py-3 shadow-sm backdrop-blur-sm md:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between">
        {/* Left side - Menu items */}
        <div className="hidden flex-1 items-center justify-start md:flex">
          <DesktopMenu />
        </div>

        {/* Center - Logo */}
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            {(hasScrolled || !isLandingPage) && (
              <motion.div
                key="navbar-logo"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Link href="/" className="flex items-center">
                  <div className="relative h-14 w-14 md:h-20 md:w-20 lg:h-24 lg:w-24">
                    <Image src="/logo.svg" alt="logo" fill className="object-contain" priority />
                  </div>
                </Link>
              </motion.div>
            )}
            {!hasScrolled && isLandingPage && (
              <motion.div
                key="navbar-logo-placeholder"
                className="h-14 w-14 md:h-20 md:w-20 lg:h-24 lg:w-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right side - Auth buttons and actions */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          <a
            href="https://forms.gle/y8GzM5HxdVd8stjo6"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block"
          >
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hidden items-center space-x-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-transparent sm:px-4 lg:flex"
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
