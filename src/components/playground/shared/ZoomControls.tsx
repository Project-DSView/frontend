import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { ZoomControlsProps } from '@/types';

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
  minZoom = 0.1,
  maxZoom = 3,
}) => {
  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 rounded-xl bg-white/95 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:bg-gray-800/95 dark:ring-white/10">
      {/* Zoom Level Display */}
      <div className="rounded-md bg-gray-100 px-2 py-1 text-center text-xs font-semibold tabular-nums text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        {Math.round(zoom * 100)}%
      </div>

      {/* Zoom Controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          disabled={zoom >= maxZoom}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-gray-600"
          title="Zoom In (Scroll Up)"
        >
          <ZoomIn size={16} />
        </button>

        <button
          onClick={onZoomOut}
          disabled={zoom <= minZoom}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-gray-600"
          title="Zoom Out (Scroll Down)"
        >
          <ZoomOut size={16} />
        </button>

        <div className="my-0.5 h-px bg-gray-200 dark:bg-gray-600" />

        <button
          onClick={onReset}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500 text-white shadow-sm transition-all hover:bg-gray-600 hover:shadow-md active:scale-95 dark:bg-gray-600 dark:hover:bg-gray-500"
          title="Reset (Ctrl+0 or Double-click)"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onFitToScreen}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          title="Fit to Screen"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
