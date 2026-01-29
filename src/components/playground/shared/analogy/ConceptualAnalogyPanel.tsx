import React from 'react';

import { ConceptualAnalogyPanelProps } from '@/types';

import LinkedListAnalogy from './SinglyLinkedListAnalogy';
import DoublyLinkedListAnalogy from './DoublyLinkedListAnalogy';
import StackAnalogy from './StackAnalogy';
import ZoomableContainer from '@/components/playground/shared/action/ZoomableContainer';

const ConceptualAnalogyPanel: React.FC<ConceptualAnalogyPanelProps> = ({
  type,
  data,
  className = '',
  isVisible = true,
}) => {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-gray-800/50 ${className}`}
    >
      <div className="absolute top-4 left-4 z-10 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-gray-500 backdrop-blur-sm dark:bg-black/30 dark:text-gray-400">
        CONCEPTUAL ANALOGY
      </div>

      <ZoomableContainer
        className="h-full w-full"
        minZoom={0.5}
        maxZoom={2}
        initialZoom={1}
        enablePan={true}
        enableWheelZoom={true}
        showControls={true}
      >
        <div className="flex min-h-full items-center justify-center p-6">
          {type === 'linked-list' && (
            <LinkedListAnalogy nodes={data.nodes || []} isVisible={isVisible} />
          )}
          {type === 'doubly-linked-list' && (
            <DoublyLinkedListAnalogy nodes={data.nodes || []} isVisible={isVisible} />
          )}
          {type === 'stack' && <StackAnalogy elements={data.elements || data.nodes || []} />}

          {type === 'queue' && (
            <div className="text-center text-gray-500">Queue Analogy (Coming Soon)</div>
          )}
        </div>
      </ZoomableContainer>
    </div>
  );
};

export default ConceptualAnalogyPanel;
