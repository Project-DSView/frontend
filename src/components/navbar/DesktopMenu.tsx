'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { playgroundItems } from '@/data';
import SubMenuItem from './SubMenuItem';
import useAuth from '@/hooks/auth/useAuth';

const DesktopMenu = () => {
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const { profile, isInitialized } = useAuth();

  return (
    <div className="hidden items-center space-x-1 md:flex">
      <DropdownMenu onOpenChange={setIsPlaygroundOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center space-x-1 rounded-lg border-0 px-3 py-1.5 text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 data-[state=open]:bg-gray-100"
          >
            <span>Playground</span>
            {isPlaygroundOpen ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-[280px] border border-gray-200 bg-white shadow-lg"
          sideOffset={8}
          align="start"
        >
          <DropdownMenuGroup>
            {playgroundItems.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                <SubMenuItem {...item} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {isInitialized && profile && (
        <Link href="/course">
          <Button
            variant="ghost"
            className="rounded-lg px-3 py-1.5 text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100"
          >
            My Course
          </Button>
        </Link>
      )}

      <Link href="/about">
        <Button
          variant="ghost"
          className="rounded-lg px-3 py-1.5 text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100"
        >
          About us
        </Button>
      </Link>
    </div>
  );
};

export default DesktopMenu;
