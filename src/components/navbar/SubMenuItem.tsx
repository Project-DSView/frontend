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
    <DropdownMenuSubTrigger className="data-[state=open]:bg-muted data-[state=open]:text-accent-foreground">
      <div className="flex flex-col">
        <span className="text-foreground font-medium">{title}</span>
        <span className="text-muted-foreground text-sm">{description}</span>
      </div>
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent
        className="border-border bg-background max-w-[calc(100vw-32px)] min-w-[160px] border shadow-lg"
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
