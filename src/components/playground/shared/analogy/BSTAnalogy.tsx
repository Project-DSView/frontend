import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type BSTNode = {
  value: string;
  left?: BSTNode | null;
  right?: BSTNode | null;
  id: string;
};

interface BSTAnalogyProps {
  root: BSTNode | null;
}

// Helper to calculate tree layout positions
type LayoutNode = {
  node: BSTNode;
  x: number;
  y: number;
  level: number;
  parent?: LayoutNode;
  isLeftChild?: boolean;
};

const NODE_RADIUS = 24;
const LEVEL_HEIGHT = 80;
const CANVAS_WIDTH = 800; // Fixed width for coordinate system

const calculateTreeLayout = (root: BSTNode | null): LayoutNode[] => {
  if (!root) return [];

  const layout: LayoutNode[] = [];
  
  const traverse = (
    node: BSTNode,
    level: number,
    boundLeft: number,
    boundRight: number,
    parent?: LayoutNode,
    isLeftChild?: boolean
  ): LayoutNode => {
    // Current node x is exactly in the middle of its bounds
    const x = boundLeft + (boundRight - boundLeft) / 2;
    const y = level * LEVEL_HEIGHT + NODE_RADIUS * 2;
    
    // Create layout node
    const layoutNode: LayoutNode = {
      node, x, y, level, parent, isLeftChild
    };
    layout.push(layoutNode);
    
    // Recursively process children
    if (node.left) {
      traverse(node.left, level + 1, boundLeft, x, layoutNode, true);
    }
    if (node.right) {
      traverse(node.right, level + 1, x, boundRight, layoutNode, false);
    }
    
    return layoutNode;
  };
  
  // Start from root using the whole canvas width
  traverse(root, 0, 0, CANVAS_WIDTH);
  
  return layout;
};

// SVG components for the Pachinko machine parts
const Pin = ({ cx, cy }: { cx: number, cy: number }) => (
  <g>
    <circle cx={cx} cy={cy} r="6" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" />
    <circle cx={cx-2} cy={cy-2} r="2" fill="white" opacity="0.6" />
  </g>
);

const Basket = ({ cx, cy, value }: { cx: number, cy: number, value: string }) => (
  <g>
    {/* Basket body */}
    <path 
      d={`M ${cx-20} ${cy-10} L ${cx-15} ${cy+15} L ${cx+15} ${cy+15} L ${cx+20} ${cy-10} Z`} 
      fill="#3B82F6" 
      stroke="#2563EB" 
      strokeWidth="2" 
    />
    {/* Rim */}
    <ellipse cx={cx} cy={cy-10} rx="20" ry="6" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
    {/* Highlight */}
    <ellipse cx={cx} cy={cy-10} rx="16" ry="3" fill="none" stroke="white" opacity="0.4" />
    
    {/* Value tag attached to basket */}
    <rect x={cx-14} y={cy+18} width="28" height="16" rx="3" fill="white" stroke="#2563EB" strokeWidth="1.5" />
    <text x={cx} y={cy+30} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">
      {value}
    </text>
  </g>
);

const TrackPath = ({ from, to, isLeft }: { from: LayoutNode, to: LayoutNode, isLeft: boolean }) => {
  // Draw a curved track path from parent bucket to child bucket
  const startX = isLeft ? from.x - 12 : from.x + 12;
  const startY = from.y + 15;
  const endX = to.x;
  const endY = to.y - 20; // Top of the bucket
  
  // Control points for a smooth curve
  const cp1X = startX;
  const cp1Y = startY + 20;
  const cp2X = endX;
  const cp2Y = endY - 20;
  
  return (
    <g>
      {/* Outer track line */}
       <path 
        d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
        fill="none" 
        stroke="#E5E7EB" 
        strokeWidth="16" 
        strokeLinecap="round"
      />
      {/* Inner track line */}
      <path 
        d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
        fill="none" 
        stroke="#D1D5DB" 
        strokeWidth="10" 
        strokeLinecap="round"
      />
      {/* Track center dashed line to indicate drop path */}
      <path 
        d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
        fill="none" 
        stroke="#9CA3AF" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
      />
      
      {/* Left/Right Label attached to track */}
      <g transform={`translate(${(startX + endX)/2 + (isLeft ? 15 : -15)}, ${(startY + endY)/2 - 5})`}>
        <rect x="-12" y="-8" width="24" height="16" rx="4" fill="white" opacity="0.9" />
        <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="bold" fill={isLeft ? "#EF4444" : "#10B981"}>
          {isLeft ? '<' : '>'}
        </text>
      </g>
    </g>
  );
};

const Marble = ({ value, isAnimated = false }: { value: string, isAnimated?: boolean }) => (
  <motion.div 
    className="relative flex items-center justify-center drop-shadow-md"
    initial={isAnimated ? { y: -200, opacity: 0 } : {}}
    animate={isAnimated ? { y: 0, opacity: 1 } : {}}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
  >
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
      {/* Glossy reflection */}
      <path d="M 10 16 A 8 6 0 0 1 20 8 A 12 10 0 0 0 10 16" fill="white" opacity="0.6" />
      <circle cx="16" cy="12" r="2" fill="white" opacity="0.8" />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center font-bold text-amber-900 text-sm">
      {value}
    </div>
  </motion.div>
);

const BSTAnalogy: React.FC<BSTAnalogyProps> = ({ root }) => {
  // Add state to trigger entrance animation
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation when root reference changes (new node inserted)
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [root]);

  // Calculate layout coordinates
  const layout = useMemo(() => calculateTreeLayout(root), [root]);
  
  if (!root) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex items-center justify-center text-center">
          <h3 className="mb-8 text-xl font-bold text-gray-700 dark:text-gray-200">
            BST = ตู้เกมลูกแก้วตกท่อ (Pachinko) 🔵
          </h3>
        </div>
        <div className="flex min-h-[300px] flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="mb-4 h-16 w-16 opacity-30">
            <Marble value="?" />
          </div>
          <p className="text-sm font-medium">Tree ว่างเปล่า — ลอง Insert โหนดเพื่อเริ่มเกม!</p>
        </div>
      </div>
    );
  }

  // Determine actual bounds used by the tree to center it within the container
  const minX = layout.length > 0 ? Math.min(...layout.map(node => node.x)) : 0;
  const maxX = layout.length > 0 ? Math.max(...layout.map(node => node.x)) : CANVAS_WIDTH;
  const maxY = layout.length > 0 ? Math.max(...layout.map(node => node.y)) : LEVEL_HEIGHT;
  
  const viewBoxPadding = 60;
  
  // ViewBox settings to center and scale the specific tree size
  const viewBoxLeft = Math.max(0, minX - viewBoxPadding);
  const viewBoxRight = Math.min(CANVAS_WIDTH, maxX + viewBoxPadding);
  const vbWidth = viewBoxRight - viewBoxLeft;
  // Make height responsive to depth but with minimum height
  const vbHeight = Math.max(400, maxY + 100);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center text-center">
        <h3 className="mb-4 text-xl font-bold text-gray-700 dark:text-gray-200">
          BST = ตู้เกมลูกแก้วตกท่อ (Pachinko) 🔵
        </h3>
      </div>
      
      {/* Drop zone indicator */}
      <div className="relative mb-2 w-full max-w-xl">
         <div className="flex justify-center animate-bounce opacity-80">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
         </div>
         <div className="text-center text-xs font-bold text-amber-600 dark:text-amber-400">
            DROP ZONE
         </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-blue-50/50 to-indigo-100/50 p-4 shadow-inner dark:from-gray-800/80 dark:to-gray-900/80">
        
        {/* Pachinko Machine Frame */}
        <div className="absolute inset-0 rounded-xl border-4 border-indigo-200 dark:border-indigo-900 pointer-events-none"></div>
        <div className="absolute inset-x-0 top-0 h-4 bg-indigo-300 dark:bg-indigo-800"></div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-indigo-300 dark:bg-indigo-800"></div>

        <svg 
          width="100%" 
          height="100%" 
          viewBox={`${viewBoxLeft} 0 ${vbWidth} ${vbHeight}`}
          preserveAspectRatio="xMidYMin meet"
          className="min-h-[400px] overflow-visible"
        >
          {/* 1. Draw all tracks first so they are behind buckets */}
          {layout.map((node) => 
            node.parent ? (
              <TrackPath 
                key={`track-${node.node.id}`} 
                from={node.parent} 
                to={node} 
                isLeft={node.isLeftChild!} 
              />
            ) : null
          )}

          {/* 2. Draw all decorative pins */}
          {layout.map((node) => (
            <React.Fragment key={`pins-${node.node.id}`}>
               {/* Decorative pins above basket to bounce off */}
               {node.parent && (
                 <>
                   <Pin cx={node.x - 20} cy={node.y - 35} />
                   <Pin cx={node.x + 20} cy={node.y - 35} />
                 </>
               )}
            </React.Fragment>
          ))}

          {/* 3. Draw all buckets (Nodes) */}
          {layout.map((node) => (
            <Basket key={`basket-${node.node.id}`} cx={node.x} cy={node.y} value={node.node.value} />
          ))}
        </svg>

        {/* 4. Overlay Marbles using HTML/Framer Motion for better animation support */}
        <div className="pointer-events-none absolute inset-0">
          <div className="relative h-full w-full mx-auto" style={{ maxWidth: vbWidth, aspectRatio: `${vbWidth}/${vbHeight}` }}>
            {/* The root node gets a dropping marble animation whenever tree updates */}
            {layout.length > 0 && (
              <div 
                key={`marble-root-${animationKey}`}
                className="absolute"
                style={{ 
                  left: `${((layout[0].x - viewBoxLeft) / vbWidth) * 100}%`, 
                  top: `${layout[0].y - 20}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                  <Marble value={layout[0].node.value} isAnimated={true} />
              </div>
            )}
            
            {/* Other nodes already resting in their buckets */}
            {layout.slice(1).map((node) => (
              <div 
                key={`marble-${node.node.id}`}
                className="absolute"
                style={{ 
                  left: `${((node.x - viewBoxLeft) / vbWidth) * 100}%`, 
                  top: `${node.y - 2}px`, // Slight offset so it sits IN the basket
                  transform: 'translate(-50%, -50%) scale(0.9)' // Slightly smaller to fit basket
                }}
              >
                 <Marble value={node.node.value} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 max-w-lg text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          ในเกมลูกแก้วตกท่อ: ลูกแก้วใหม่ที่หยอดลงมา จะเจอตะกร้า (Node) รูด้านซ้ายสำหรับ &quot;<strong>ค่าน้อยกว่า</strong>&quot; และรูด้านขวาสำหรับ &quot;<strong>ค่ามากกว่า</strong>&quot;
          <br/>ลูกแก้วจะไหลลงไปเรื่อยๆ จนกว่าจะเจอตะกร้าที่ยังว่างอยู่!
        </p>
      </div>
    </div>
  );
};

export default BSTAnalogy;
