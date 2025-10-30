'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { getProcessedPlaygroundItems } from '@/lib';

function Footer() {
  // Use pre-processed items from lib
  const processedItems = useMemo(() => getProcessedPlaygroundItems(), []);

  return (
    <footer className="border-border bg-background border-t px-4 py-6 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-screen-xl">
        {/* Main Footer Content - 4 Columns */}
        <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 sm:gap-8 sm:pb-8 lg:grid-cols-4">
          {/* Column 1: About Section */}
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <Image
                src="/logo.svg"
                alt="DSView Logo"
                width={90}
                height={90}
                className="h-10 w-auto object-contain sm:h-16"
                sizes="(max-width: 640px) 48px, 90px"
                loading="lazy"
              />
            </div>
            <h3 className="text-foreground text-center text-base font-bold sm:text-left sm:text-lg">
              DSView
            </h3>
            <p className="text-muted-foreground text-center text-xs sm:text-left sm:text-sm">
              Online Structural Validation based System
            </p>
            <div className="text-muted-foreground text-center text-xs sm:text-left sm:text-sm">
              <p>School of Information Technology</p>
              <p>KMITL</p>
            </div>
          </div>

          {/* Columns 2-4: Playground Links */}
          {processedItems.map((playgroundItem) => (
            <div key={playgroundItem.title} className="space-y-2 sm:space-y-4">
              <div className="text-center sm:text-left">
                <h3 className="text-foreground text-xs font-semibold sm:text-sm">
                  {playgroundItem.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
                  {playgroundItem.description}
                </p>
              </div>
              <ul className="space-y-1 sm:space-y-2">
                {playgroundItem.links.map((link) => (
                  <li key={link.href} className="text-center sm:text-left">
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary inline-block text-xs transition-colors sm:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-border border-t pt-3 sm:pt-6">
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:gap-4 sm:text-left md:flex-row">
            <div className="text-muted-foreground text-xs leading-tight sm:text-sm">
              <p>© 2025 DSView. All rights reserved.</p>
              <p className="mt-1">1 Chalongkrung Road, Bangkok, Thailand 10520</p>
            </div>
            <div className="text-muted-foreground flex items-center gap-6 text-xs sm:text-sm">
              <a
                href="https://forms.gle/y8GzM5HxdVd8stjo6"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Report Issue
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
