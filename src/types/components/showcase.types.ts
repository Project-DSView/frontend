import { Code } from 'lucide-react';

interface CTASectionProps {
  onGetStarted?: () => void;
}

interface Structure {
  id: string;
  name: string;
  icon: typeof Code;
  description: string;
  preview: string;
  color: string;
}

export type { Structure, CTASectionProps };
