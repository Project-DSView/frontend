type SubItem = {
  href: string;
  label: string;
};

type MenuItem = {
  href: string | null;
  label: string;
  hasSubItems: boolean;
  subItems?: SubItem[];
};

type PlaygroundItem = {
  title: string;
  description: string;
  items: MenuItem[];
};

interface SubMenuItemProps {
  title: string;
  description: string;
  items: PlaygroundItem['items'];
}

interface NestedSubMenuItemProps {
  item: MenuItem;
}

export type { SubItem, MenuItem, PlaygroundItem, SubMenuItemProps, NestedSubMenuItemProps };
