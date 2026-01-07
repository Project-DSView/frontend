import React, { useState, useRef, useCallback } from 'react';
import ZoomControls from './ZoomControls';
import { ZoomableContainerProps } from '@/types';

const ZoomableContainer: React.FC<ZoomableContainerProps> = ({
  children,
  className = '',
  minZoom = 0.1,
  maxZoom = 3,
  initialZoom = 1,
  showControls = true,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Simple zoom functions for controls
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.25, maxZoom));
  }, [maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.25, minZoom));
  }, [minZoom]);

  const resetZoom = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    // Calculate content size without current zoom
    const contentWidth = contentRect.width / zoom;
    const contentHeight = contentRect.height / zoom;

    // Calculate scale needed to fit
    const scaleX = containerRect.width / contentWidth;
    const scaleY = containerRect.height / contentHeight;
    const scale = Math.min(scaleX, scaleY, maxZoom) * 0.85;

    setZoom(Math.max(scale, minZoom));
    setPan({ x: 0, y: 0 });
  }, [minZoom, maxZoom, zoom]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        ref={contentRef}
        className="origin-center transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>

      {showControls && (
        <ZoomControls
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
          onFitToScreen={fitToScreen}
          minZoom={minZoom}
          maxZoom={maxZoom}
        />
      )}
    </div>
  );
};

export default ZoomableContainer;
