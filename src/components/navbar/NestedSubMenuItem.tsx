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
        <DropdownMenuItem className="focus:bg-muted data-[highlighted]:bg-muted cursor-pointer">
          {item.label}
        </DropdownMenuItem>
      </Link>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="data-[state=open]:bg-muted data-[state=open]:text-accent-foreground">
        <span className="text-foreground font-medium">{item.label}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          className="border-border bg-background max-w-[calc(100vw-32px)] min-w-[160px] border shadow-lg"
          sideOffset={8}
          alignOffset={-4}
        >
          {item.subItems?.map((subItem) => (
            <Link key={subItem.href} href={subItem.href}>
              <DropdownMenuItem className="focus:bg-muted data-[highlighted]:bg-muted cursor-pointer">
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
