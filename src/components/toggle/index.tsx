'use client';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { modes, structures } from '@/data';

const Toggle = () => {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  const currentStructure = parts.slice(1).join('/');

  const pageName = structures[currentStructure] || '';

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold">{pageName}</h2>
      <ToggleGroup type="single" value={pathname}>
        {Object.entries(modes).map(([mode, label]) => (
          <ToggleGroupItem key={mode} value={`/${mode}/${currentStructure}`} asChild>
            <Link href={`/${mode}/${currentStructure}`}>{label}</Link>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default Toggle;
