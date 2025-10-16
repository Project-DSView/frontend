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
import SubMenuItem from '@/components/navbar/SubMenuItem';

const PlaygroundDropdown = () => {
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsPlaygroundOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-primary hover:bg-primary flex items-center space-x-2 rounded-xl border-2 border-white/20 px-6 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:text-white hover:shadow-xl sm:px-8 sm:py-5 sm:text-xl">
          <span>Playground</span>
          {isPlaygroundOpen ? (
            <ChevronUp size={18} className="text-white/80 sm:size-5" />
          ) : (
            <ChevronDown size={18} className="text-white/80 sm:size-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[320px] border border-gray-200 bg-white shadow-xl"
        sideOffset={12}
        align="center"
      >
        <DropdownMenuGroup>
          {playgroundItems.map((item, index) => (
            <DropdownMenuItem key={index} asChild>
              {item.href ? (
                <Link href={item.href} className="block">
                  <div className="flex flex-col p-3">
                    <span className="font-medium text-gray-900">{item.title}</span>
                    <span className="text-sm text-gray-500">{item.description}</span>
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
  );
};

export default PlaygroundDropdown;
