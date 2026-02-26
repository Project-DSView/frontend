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
  enablePan = false,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

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

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enablePan) return;
    setIsDragging(true);
    startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !enablePan) return;
    e.preventDefault();
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden ${enablePan ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''} ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      // Touch events support
      onTouchStart={(e) => {
        if (!enablePan) return;
        setIsDragging(true);
        const touch = e.touches[0];
        startPanRef.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
      }}
      onTouchMove={(e) => {
        if (!isDragging || !enablePan) return;
        // Prevent default only if we are actually dragging/panning to stop page scroll
        // But we might want page scroll if we are at edge? For now prevent default to act like a canvas app
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - startPanRef.current.x;
        const newY = touch.clientY - startPanRef.current.y;
        setPan({ x: newX, y: newY });
      }}
      onTouchEnd={() => {
        setIsDragging(false);
      }}
    >
      <div
        ref={contentRef}
        className="origin-center transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out', // Disable transition during drag for smoothness
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
    </section>
  );
};

export default ZoomableContainer;
