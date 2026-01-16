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

  /**
   * ✅ NEW:
   * true  = clip ขอบ (เหมาะกับพื้นที่วาด/ซูม/แพน)
   * false = ไม่ clip (ใช้เมื่อมี footer/stats อยู่ใน container แล้วโดนตัด)
   */
  clipContent?: boolean;
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
  clipContent = true,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ================= Zoom functions ================= */

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

    if (contentRect.width === 0 || contentRect.height === 0) return;

    const scaleX = containerRect.width / contentRect.width;
    const scaleY = containerRect.height / contentRect.height;
    const scale = Math.min(scaleX, scaleY, maxZoom) * 0.9;

    setZoom(Math.max(scale, minZoom));
    setPan({ x: 0, y: 0 });
  }, [minZoom, maxZoom]);

  /* ================= Mouse wheel zoom ================= */

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!enableWheelZoom) return;
      e.preventDefault();

      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    },
    [enableWheelZoom, zoomIn, zoomOut],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  /* ================= Keyboard zoom ================= */

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

  /* ================= Pan ================= */

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

      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    },
    [isPanning, enablePan, lastPanPoint],
  );

  const handleMouseUp = useCallback(() => setIsPanning(false), []);
  const handleMouseLeave = useCallback(() => setIsPanning(false), []);

  /* ================= Touch pan ================= */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStartNative = (e: TouchEvent) => {
      if (!enablePan || e.touches.length !== 1) return;
      const t = e.touches[0];
      setIsPanning(true);
      setLastPanPoint({ x: t.clientX, y: t.clientY });
    };

    const handleTouchMoveNative = (e: TouchEvent) => {
      if (!isPanning || !enablePan || e.touches.length !== 1) return;
      e.preventDefault();

      const t = e.touches[0];
      const deltaX = t.clientX - lastPanPoint.x;
      const deltaY = t.clientY - lastPanPoint.y;

      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: t.clientX, y: t.clientY });
    };

    const handleTouchEndNative = () => setIsPanning(false);

    container.addEventListener('touchstart', handleTouchStartNative, { passive: true });
    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    container.addEventListener('touchend', handleTouchEndNative, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStartNative);
      container.removeEventListener('touchmove', handleTouchMoveNative);
      container.removeEventListener('touchend', handleTouchEndNative);
    };
  }, [isPanning, enablePan, lastPanPoint]);

  /* ================= Render ================= */

  return (
    <div
      ref={containerRef}
      className={`relative ${clipContent ? 'overflow-hidden' : 'overflow-visible'} ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: enablePan ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
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
