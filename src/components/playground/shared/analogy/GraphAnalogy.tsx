import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// ----- Types -----
interface GraphNode {
  id: string;
  value: string;
  x: number;
  y: number;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
}

interface GraphAnalogyProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected?: boolean;
}

// ----- Avatar color palette -----
const AVATAR_COLORS = [
  { bg: '#3B82F6', hair: '#1E3A5F', shirt: '#2563EB' }, // Blue
  { bg: '#10B981', hair: '#1A3C2A', shirt: '#059669' }, // Green
  { bg: '#F59E0B', hair: '#5C3D0A', shirt: '#D97706' }, // Amber
  { bg: '#EF4444', hair: '#4A1010', shirt: '#DC2626' }, // Red
  { bg: '#8B5CF6', hair: '#2E1A4A', shirt: '#7C3AED' }, // Purple-ish (violet-free)
  { bg: '#EC4899', hair: '#4A1030', shirt: '#DB2777' }, // Pink
  { bg: '#14B8A6', hair: '#1A3A36', shirt: '#0D9488' }, // Teal
  { bg: '#F97316', hair: '#4A2A0A', shirt: '#EA580C' }, // Orange
];

const getAvatarColor = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length];

// ----- SVG Person Avatar -----
const PersonAvatar = ({
  name,
  colorIndex,
  size = 60,
}: {
  name: string;
  colorIndex: number;
  size?: number;
}) => {
  const color = getAvatarColor(colorIndex);
  const r = size / 2;

  return (
    <g>
      {/* Body / Shirt */}
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.65} ry={r * 0.45} fill={color.shirt} />
      {/* Head */}
      <circle cx={0} cy={-r * 0.15} r={r * 0.38} fill="#FBBF24" />
      {/* Hair */}
      <ellipse cx={0} cy={-r * 0.35} rx={r * 0.38} ry={r * 0.22} fill={color.hair} />
      {/* Eyes */}
      <circle cx={-r * 0.12} cy={-r * 0.12} r={r * 0.05} fill="#1F2937" />
      <circle cx={r * 0.12} cy={-r * 0.12} r={r * 0.05} fill="#1F2937" />
      {/* Smile */}
      <path
        d={`M ${-r * 0.1} ${r * 0.02} Q 0 ${r * 0.12} ${r * 0.1} ${r * 0.02}`}
        fill="none"
        stroke="#1F2937"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Name tag */}
      <rect
        x={-22}
        y={r * 0.85}
        width={44}
        height={16}
        rx={4}
        fill="white"
        stroke={color.bg}
        strokeWidth="1.5"
      />
      <text
        x={0}
        y={r * 0.85 + 12}
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill={color.shirt}
      >
        {name.length > 5 ? name.slice(0, 4) + '..' : name}
      </text>
    </g>
  );
};

// ----- Relationship Edge -----
const RelationshipEdge = ({
  from,
  to,
  isDirected,
  index,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isDirected: boolean;
  index: number;
}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  // Shorten the line so it doesn't overlap with the avatar circles
  const shortenBy = 35;
  const nx = dx / len;
  const ny = dy / len;
  const x1 = from.x + nx * shortenBy;
  const y1 = from.y + ny * shortenBy;
  const x2 = to.x - nx * shortenBy;
  const y2 = to.y - ny * shortenBy;

  // Midpoint for the label
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  const arrowId = `arrow-${index}`;

  return (
    <g>
      {/* Arrow marker definition */}
      {isDirected && (
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
          </marker>
        </defs>
      )}
      {/* Edge line */}
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeDasharray={isDirected ? '6 3' : 'none'}
        markerEnd={isDirected ? `url(#${arrowId})` : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      />
      {/* Relationship label */}
      <g transform={`translate(${mx}, ${my})`}>
        <rect
          x="-24"
          y="-9"
          width="48"
          height="18"
          rx="9"
          fill="white"
          stroke="#D1D5DB"
          strokeWidth="1"
        />
        <text x="0" y="4" textAnchor="middle" fontSize="8" fontWeight="600" fill="#6B7280">
          {isDirected ? 'Follow' : 'Friend'}
        </text>
      </g>
    </g>
  );
};

// ----- Main Component -----
const GraphAnalogy: React.FC<GraphAnalogyProps> = ({ nodes, edges, isDirected = false }) => {
  // Compute SVG viewBox from node positions
  const viewBox = useMemo(() => {
    if (nodes.length === 0) return { x: 0, y: 0, w: 600, h: 400 };
    const padding = 80;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - padding;
    const maxX = Math.max(...xs) + padding;
    const minY = Math.min(...ys) - padding;
    const maxY = Math.max(...ys) + padding;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
          Graph = เครือข่ายเพื่อน (Social Network) 🤝
        </h3>
        <div className="flex min-h-[300px] flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <svg width="80" height="80" viewBox="0 0 80 80" className="mb-4 opacity-30">
            <circle cx="40" cy="30" r="15" fill="#D1D5DB" />
            <ellipse cx="40" cy="60" rx="20" ry="12" fill="#D1D5DB" />
          </svg>
          <p className="text-sm font-medium">ยังไม่มีคน — ลอง add_vertex เพื่อเพิ่มเพื่อนใหม่!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
        Graph = เครือข่ายเพื่อน (Social Network) 🤝
      </h3>

      {/* Type badge */}
      <div
        className={`rounded-full px-3 py-1 text-xs font-bold ${
          isDirected
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
            : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
        }`}
      >
        {isDirected ? '📱 Follow (ทางเดียว)' : '🤝 Friend (สองทาง)'}
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-sky-50/50 to-indigo-50/50 p-4 shadow-inner dark:from-gray-800/80 dark:to-gray-900/80">
        <svg
          width="100%"
          height="100%"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="min-h-[400px]"
        >
          {/* 1. Render edges first (behind nodes) */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <RelationshipEdge
                key={edge.id}
                from={fromNode}
                to={toNode}
                isDirected={isDirected}
                index={idx}
              />
            );
          })}

          {/* 2. Render person avatars */}
          {nodes.map((node, idx) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: idx * 0.08 }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            >
              <g transform={`translate(${node.x}, ${node.y})`}>
                {/* Glow behind avatar */}
                <circle cx={0} cy={0} r={35} fill={getAvatarColor(idx).bg} opacity={0.15} />
                <PersonAvatar name={node.value} colorIndex={idx} />
              </g>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Description text */}
      <div className="mt-2 max-w-lg text-center text-sm text-gray-600 dark:text-gray-400">
        {isDirected ? (
          <p>
            ใน Social Network: &quot;<strong>Follow</strong>&quot; เป็นความสัมพันธ์ทางเดียว — A
            follow B ไม่ได้หมายความว่า B follow A (เหมือน Directed Edge)
          </p>
        ) : (
          <p>
            ใน Social Network: &quot;<strong>Friend</strong>&quot; เป็นความสัมพันธ์สองทาง — ถ้า A
            เป็นเพื่อนกับ B แล้ว B ก็เป็นเพื่อนกับ A เช่นกัน (เหมือน Undirected Edge)
          </p>
        )}
      </div>
    </div>
  );
};

export default GraphAnalogy;
