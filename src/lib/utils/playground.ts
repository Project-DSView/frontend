import { playgroundItems } from '@/data';

/**
 * Flatten nested menu items into a simple array of links
 * Used for displaying playground navigation in various components
 */
const getFlattenedLinks = (items: (typeof playgroundItems)[0]['items']) => {
  const links: Array<{ href: string; label: string }> = [];

  items?.forEach((item) => {
    if (!item.hasSubItems && item.href) {
      // Direct link
      links.push({ href: item.href, label: item.label });
    } else if (item.hasSubItems && item.subItems) {
      // Nested items (LinkList, Graph)
      item.subItems.forEach((subItem) => {
        if (subItem.href) {
          links.push({ href: subItem.href, label: subItem.label });
        }
      });
    }
  });

  return links;
};

/**
 * Process playground items with flattened links
 * This is memoized to avoid recalculating on every render
 */
const getProcessedPlaygroundItems = () => {
  return playgroundItems.map((item) => ({
    ...item,
    links: getFlattenedLinks(item.items),
  }));
};

export { getFlattenedLinks, getProcessedPlaygroundItems };
