'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkIcon, Layers, TreePine, Network } from 'lucide-react';
import { DataStructure } from '@/types/components/tutorial.types';

interface DataStructureCardProps {
  structure: DataStructure;
}

const DataStructureCard: React.FC<DataStructureCardProps> = ({ structure }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LinkIcon': return <LinkIcon className="h-6 w-6" />;
      case 'Layers': return <Layers className="h-6 w-6" />;
      case 'TreePine': return <TreePine className="h-6 w-6" />;
      case 'Network': return <Network className="h-6 w-6" />;
      default: return <LinkIcon className="h-6 w-6" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className={structure.iconColor}>
            {getIcon(structure.iconName)}
          </div>
          {structure.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{structure.description}</p>
      </CardContent>
    </Card>
  );
};

export default DataStructureCard;
