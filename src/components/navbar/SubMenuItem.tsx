'use client';

import { SubMenuItemProps } from '@/types';

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import NestedSubMenuItem from './NestedSubMenuItem';

const SubMenuItem = ({ title, description, items }: SubMenuItemProps) => (
  <DropdownMenuSub>
    <DropdownMenuSubTrigger className="data-[state=open]:bg-neutral/40 data-[state=open]:text-accent-foreground">
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="text-sm text-gray-500">{description}</span>
      </div>
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent
        className="min-w-[180px] border border-gray-200 bg-white shadow-lg"
        sideOffset={8}
        alignOffset={-4}
      >
        {items?.map((item, index) => (
          <DropdownMenuItem key={index} asChild>
            <NestedSubMenuItem item={item} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  </DropdownMenuSub>
);

export default SubMenuItem;
