import React, {
  forwardRef,
  useMemo,
  useState,
  useEffect,
  memo,
  useCallback,
  useRef,
} from 'react';

import { BSTVisualizationProps, BSTNode, PositionedNode } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';

const BSTDragDropVisualization = forwardRef<HTMLDivElement, BSTVisualizationProps>(
  (
    {
      root,
      stats,
      isRunning,
      currentStep,
      searchPath = [],
      currentOperation,
      selectedStep,
      currentOperationData,
    },
    ref,
  ) => {
    const [traverseIndex, setTraverseIndex] = useState(0);
    const [isTraversing, setIsTraversing] = useState(false);
    const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    // เก็บ DOM Node แต่ละโหนด
    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

    /* ============================================================
        Generate traversal
    ============================================================ */
    const generateTraversalOrder = useCallback((node: BSTNode | null, type: string): string[] => {
      if (!node) return [];
      const result: string[] = [];

      const inorder = (n: BSTNode | null) => {
        if (!n) return;
        inorder(n.left);
        result.push(n.value);
        inorder(n.right);
      };

      const preorder = (n: BSTNode | null) => {
        if (!n) return;
        result.push(n.value);
        preorder(n.left);
        preorder(n.right);
      };

      const postorder = (n: BSTNode | null) => {
        if (!n) return;
        postorder(n.left);
        postorder(n.right);
        result.push(n.value);
      };

      if (type === 'traverse_inorder') inorder(node);
      if (type === 'traverse_preorder') preorder(node);
      if (type === 'traverse_postorder') postorder(node);

      return result;
    }, []);

    /* ============================================================
        Highlight Insert/Delete/Search
    ============================================================ */
    useEffect(() => {
      if (
        isRunning &&
        currentOperation &&
        ['insert', 'delete', 'search'].includes(currentOperation)
      ) {
        setIsAnimating(true);

        if (root) setHighlightedNodes([root.value]);

        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodes([]);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [isRunning, currentOperation, root]);

    /* ============================================================
        Highlight specific node
    ============================================================ */
    useEffect(() => {
      if (isRunning && !isAnimating) {
        setIsAnimating(true);

        let targetNode = currentOperationData?.value ?? null;

        if (targetNode) setHighlightedNodes([targetNode]);
        else if (root) setHighlightedNodes([root.value]);

        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodes([]);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [isRunning, isAnimating, currentOperationData, root]);

    /* ============================================================
        Traversal Animation
    ============================================================ */
    useEffect(() => {
      if (
        selectedStep !== null &&
        selectedStep !== undefined &&
        currentOperation?.includes('traverse')
      ) {
        const order = generateTraversalOrder(root, currentOperation);
        setTraversalOrder(order);
        setIsTraversing(true);
        setTraverseIndex(0);

        const interval = setInterval(() => {
          setTraverseIndex((prev) => {
            const next = prev + 1;
            if (next >= order.length) {
              setIsTraversing(false);
              clearInterval(interval);
              return prev;
            }
            return next;
          });
        }, 900);

        return () => clearInterval(interval);
      } else {
        setIsTraversing(false);
        setTraverseIndex(0);
        setTraversalOrder([]);
      }
    }, [selectedStep, currentOperation, root, generateTraversalOrder]);

    /* ============================================================
        Compute Node Layout
    ============================================================ */
    const positionedNodes = useMemo(() => {
      if (!root) return [];

      const nodes: PositionedNode[] = [];
      const levelHeight = 100;
      const nodeWidth = 80;

      const calc = (n: BSTNode | null, level = 0, x = 0, y = 0) => {
        if (!n) return;
        nodes.push({ ...n, x, y, level });

        const childY = y + levelHeight;
        const offset = nodeWidth * Math.pow(0.6, level + 1);

        if (n.left) calc(n.left, level + 1, x - offset, childY);
        if (n.right) calc(n.right, level + 1, x + offset, childY);
      };

      calc(root, 0, 0, 0);
      return nodes;
    }, [root]);

    /* ============================================================
        Node Component
    ============================================================ */
    const NodeComponent = memo(
      ({ node, isHighlighted, isInSearchPath, isTraverseSelected, isCurrentlyTraversing }) => (
        <div
          ref={(el) => (nodeRefs.current[node.value] = el)}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `calc(50% + ${node.x}px)`,
            top: `${node.y + 50}px`,
          }}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300
            ${
              isHighlighted
                ? 'border-yellow-500 bg-yellow-200 text-yellow-900'
                : isInSearchPath
                  ? 'border-blue-500 bg-blue-200 text-blue-900'
                  : isTraverseSelected || isCurrentlyTraversing
                    ? 'border-green-500 bg-green-200 text-green-900'
                    : 'border-gray-600 bg-white text-gray-800'
            }
          `}
          >
            {node.value}
          </div>
        </div>
      ),
    );

    NodeComponent.displayName = 'NodeComponent';

    /* ============================================================
        Render Node Wrapper
    ============================================================ */
    const renderNode = useCallback(
      (node: PositionedNode) => {
        const isInSearchPath = searchPath.includes(node.value);

        const isTraverseSelected =
          currentOperation?.includes('traverse') &&
          isTraversing &&
          traversalOrder[traverseIndex] === node.value;

        const isCurrentlyTraversing =
          isTraversing && traversalOrder[traverseIndex] === node.value;

        const isHighlighted = highlightedNodes.includes(node.value);

        return (
          <NodeComponent
            key={node.id}
            node={node}
            isHighlighted={isHighlighted && !isCurrentlyTraversing}
            isInSearchPath={isInSearchPath}
            isTraverseSelected={isTraverseSelected}
            isCurrentlyTraversing={isCurrentlyTraversing}
          />
        );
      },
      [
        highlightedNodes,
        searchPath,
        currentOperation,
        isTraversing,
        traverseIndex,
        traversalOrder,
      ],
    );

    /* ============================================================
        Render Connections (เส้นเวอร์ชันแก้แล้ว)
    ============================================================ */
    const renderConnections = useCallback(() => {
      if (!root) return null;

      const connections: React.ReactNode[] = [];

      const addConnection = (parent: PositionedNode, child: PositionedNode | null) => {
        if (!child) return;

        const parentEl = nodeRefs.current[parent.value];
        const childEl = nodeRefs.current[child.value];

        if (!parentEl || !childEl) return;

        // หา container ที่เป็นตำแหน่งอ้างอิง
        const container = parentEl.closest(".relative");
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const pRect = parentEl.getBoundingClientRect();
        const cRect = childEl.getBoundingClientRect();

        const pX = pRect.left + pRect.width / 2 - containerRect.left;
        const pY = pRect.top + pRect.height / 2 - containerRect.top;

        const cX = cRect.left + cRect.width / 2 - containerRect.left;
        const cY = cRect.top + cRect.height / 2 - containerRect.top;

        const dx = cX - pX;
        const dy = cY - pY;

        const angle = Math.atan2(dy, dx);
        const radius = pRect.width / 2;

        const startX = pX + Math.cos(angle) * radius;
        const startY = pY + Math.sin(angle) * radius;

        const endX = cX - Math.cos(angle) * radius;
        const endY = cY - Math.sin(angle) * radius;

        const length = Math.hypot(endX - startX, endY - startY);
        const deg = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

        connections.push(
          <div
            key={`${parent.id}-${child.id}`}
            className="pointer-events-none absolute bg-gray-600"
            style={{
              left: `${startX}px`,
              top: `${startY}px`,
              width: `${length}px`,
              height: '3px',
              transformOrigin: '0 50%',
              transform: `rotate(${deg}deg)`,
              borderRadius: '2px',
            }}
          />
        );
      };

      positionedNodes.forEach((p) => {
        const left = positionedNodes.find((n) => n.id === p.left?.id) ?? null;
        const right = positionedNodes.find((n) => n.id === p.right?.id) ?? null;

        addConnection(p, left);
        addConnection(p, right);
      });

      return <>{connections}</>;
    }, [root, positionedNodes]);

    /* ============================================================
        RETURN
    ============================================================ */
    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">

        {/* Visualization */}
        <ZoomableContainer
          className="min-h-[400px] rounded-lg bg-gray-50 dark:bg-gray-900"
          minZoom={0.3}
          maxZoom={2}
          initialZoom={1}
          enablePan
          enableWheelZoom
          showControls
        >
          <div className="relative min-h-[400px] w-full p-6">
            {renderConnections()}
            {positionedNodes.map(renderNode)}
          </div>
        </ZoomableContainer>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold">{stats.size}</div>
            <div className="text-xs text-gray-500">Size</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold">{stats.height}</div>
            <div className="text-xs text-gray-500">Height</div>
          </div>
        </div>
      </div>
    );
  },
);

BSTDragDropVisualization.displayName = 'BSTDragDropVisualization';
export default BSTDragDropVisualization;
