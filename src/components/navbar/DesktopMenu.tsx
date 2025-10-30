'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { playgroundItems } from '@/data';
import { useAuth } from '@/hooks';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import SubMenuItem from './SubMenuItem';

const DesktopMenu = () => {
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { profile, isInitialized } = useAuth();

  // Prevent hydration issues by only rendering on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="hidden items-center space-x-1 md:flex">
        <div className="bg-muted h-8 w-20 animate-pulse rounded"></div>
        <div className="bg-muted h-8 w-16 animate-pulse rounded"></div>
        <div className="bg-muted h-8 w-16 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="hidden items-center space-x-1 md:flex">
      <DropdownMenu onOpenChange={setIsPlaygroundOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-muted data-[state=open]:bg-muted flex items-center space-x-1 rounded-lg border-0 px-3 py-1.5 text-base font-semibold transition-all duration-200"
          >
            <span>Playground</span>
            {isPlaygroundOpen ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="border-border bg-background min-w-[280px] border shadow-lg"
          sideOffset={8}
          align="start"
        >
          <DropdownMenuGroup>
            {playgroundItems.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                {item.href ? (
                  <Link href={item.href} className="block">
                    <div className="flex flex-col p-2">
                      <span className="text-foreground font-medium">{item.title}</span>
                      <span className="text-muted-foreground text-sm">{item.description}</span>
                    </div>
                  </Link>
                ) : (
                  <SubMenuItem {...item} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {isInitialized && profile && (
        <Link href="/course">
          <Button
            variant="ghost"
            className="text-foreground hover:bg-muted rounded-lg px-3 py-1.5 text-base font-semibold transition-all duration-200"
          >
            Course
          </Button>
        </Link>
      )}

      <Link href="/about">
        <Button
          variant="ghost"
          className="text-foreground hover:bg-muted rounded-lg px-3 py-1.5 text-base font-semibold transition-all duration-200"
        >
          About us
        </Button>
      </Link>
    </div>
  );
};

export default DesktopMenu;
