'use client';

import Link from 'next/link';
import { NestedSubMenuItemProps } from '@/types';
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

const NestedSubMenuItem = ({ item }: NestedSubMenuItemProps) => {
  if (!item.hasSubItems) {
    return (
      <Link href={item.href ?? '#'}>
        <DropdownMenuItem className="cursor-pointer focus:bg-gray-50 data-[highlighted]:bg-gray-50">
          {item.label}
        </DropdownMenuItem>
      </Link>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="data-[state=open]:bg-neutral/40 data-[state=open]:text-accent-foreground">
        <span className="font-medium text-gray-900">{item.label}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          className="min-w-[200px] border border-gray-200 bg-white shadow-lg"
          sideOffset={8}
          alignOffset={-4}
        >
          {item.subItems?.map((subItem) => (
            <Link key={subItem.href} href={subItem.href}>
              <DropdownMenuItem className="cursor-pointer focus:bg-gray-50 data-[highlighted]:bg-gray-50">
                {subItem.label}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export default NestedSubMenuItem;
