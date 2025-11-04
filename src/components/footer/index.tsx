'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { getProcessedPlaygroundItems } from '@/lib';

function Footer() {
  // Use pre-processed items from lib
  const processedItems = useMemo(() => getProcessedPlaygroundItems(), []);

  return (
    <footer className="border-border bg-background border-t px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-screen-2xl">
        {/* Main Footer Content - Grid Layout */}
        <div className="grid grid-cols-2 gap-6 pb-8 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
          {/* Column 1: Playground Links */}
          {processedItems.map((playgroundItem) => (
            <div key={playgroundItem.title} className="space-y-3">
              <h3 className="text-foreground text-sm font-semibold">{playgroundItem.title}</h3>
              <ul className="space-y-2">
                {playgroundItem.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Additional Links Column */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://forms.gle/y8GzM5HxdVd8stjo6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Report Issue
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-border border-t pt-6">
          <div className="text-center sm:text-left">
            <div className="text-muted-foreground text-sm">
              <p>© 2025 DSView. All rights reserved.</p>
            </div>
            <div className="mt-3">
              <p className="text-muted-foreground text-xs sm:text-sm">
                School of Information Technology, KMITL • 1 Chalongkrung Road, Bangkok, Thailand
                10520
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
