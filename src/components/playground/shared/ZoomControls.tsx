import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
  minZoom?: number;
  maxZoom?: number;
}

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
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 rounded-lg bg-white/90 p-2 shadow-lg backdrop-blur-sm">
      {/* Zoom Level Display */}
      <div className="text-center text-xs font-medium text-gray-600">{Math.round(zoom * 100)}%</div>

      {/* Zoom Controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          disabled={zoom >= maxZoom}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        <button
          onClick={onZoomOut}
          disabled={zoom <= minZoom}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <button
          onClick={onReset}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-500 text-white transition-colors hover:bg-gray-600"
          title="Reset Zoom"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onFitToScreen}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white transition-colors hover:bg-green-600"
          title="Fit to Screen"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
