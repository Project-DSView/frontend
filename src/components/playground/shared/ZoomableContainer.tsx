import React, { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import ZoomControls from './ZoomControls';

interface ZoomableContainerProps {
  children: ReactNode;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  enablePan?: boolean;
  enableWheelZoom?: boolean;
  enableKeyboardZoom?: boolean;
  showControls?: boolean;
}

const ZoomableContainer: React.FC<ZoomableContainerProps> = ({
  children,
  className = '',
  minZoom = 0.1,
  maxZoom = 3,
  initialZoom = 1,
  enablePan = true,
  enableWheelZoom = true,
  enableKeyboardZoom = true,
  showControls = true,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, maxZoom));
  }, [maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, minZoom));
  }, [minZoom]);

  const resetZoom = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    // Calculate the scale needed to fit content in container
    const scaleX = containerRect.width / contentRect.width;
    const scaleY = containerRect.height / contentRect.height;
    const scale = Math.min(scaleX, scaleY, maxZoom) * 0.9; // 90% to add some padding

    setZoom(Math.max(scale, minZoom));
    setPan({ x: 0, y: 0 });
  }, [minZoom, maxZoom]);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!enableWheelZoom) return;

      e.preventDefault();

      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    },
    [enableWheelZoom, zoomIn, zoomOut],
  );

  // Keyboard zoom
  useEffect(() => {
    if (!enableKeyboardZoom) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardZoom, zoomIn, zoomOut, resetZoom]);

  // Pan functions
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan) return;

      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    },
    [enablePan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !enablePan) return;

      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;

      setPan((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    },
    [isPanning, enablePan, lastPanPoint],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enablePan || e.touches.length !== 1) return;

      const touch = e.touches[0];
      setIsPanning(true);
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    },
    [enablePan],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPanning || !enablePan || e.touches.length !== 1) return;

      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPanPoint.x;
      const deltaY = touch.clientY - lastPanPoint.y;

      setPan((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    },
    [isPanning, enablePan, lastPanPoint],
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
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
