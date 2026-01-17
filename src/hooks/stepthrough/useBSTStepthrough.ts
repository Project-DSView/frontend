import { useMemo } from 'react';
import { useBaseStepthrough } from './useBaseStepthrough';
import {
  BSTData,
  BSTStatsExtended,
  BaseStepthroughState,
  BaseStepthroughService,
  StepthroughStep,
  BSTNode,
} from '@/types';
import { bstCodeTemplate } from '@/data';

// BST Stepthrough Service
class BSTStepthroughService implements BaseStepthroughService<BSTData, BSTStatsExtended> {
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): BSTData {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return { root: null };
    }

    // Search backward from current step to find the most recent step with valid BST data
    // This ensures visualization persists even when stepping through lines without instances
    for (let searchIndex = stepIndex; searchIndex >= 0; searchIndex--) {
      const step = steps[searchIndex];
      const state = step.state;

      // Extract BST root from instances
      let root: BSTNode | null = null;

      if (state.instances) {
        // Look for BST instances in the state
        Object.entries(state.instances).forEach(([, instanceData]) => {
          if (instanceData && typeof instanceData === 'object' && 'root' in instanceData) {
            const instance = instanceData as Record<string, unknown>;
            if (instance.root) {
              root = this.convertToBSTNode(instance.root);
            }
          }
        });

        // If we found valid BST data, return it
        if (root) {
          return { root };
        }
      }
    }

    // If no instance data found via backward search, use fallback methods
    const step = steps[stepIndex];
    const state = step.state;
    let root: BSTNode | null = null;

    // If no root found, try to extract from step detail
    if (!root && state.step_detail) {
      const stepDetail = state.step_detail as Record<string, unknown>;

      // Check for insert operations
      if (stepDetail.operation === 'insert' && stepDetail.after_tree) {
        root = this.convertToBSTNode(stepDetail.after_tree);
      }
      // Check for delete operations
      else if (stepDetail.operation === 'delete' && stepDetail.after_tree) {
        root = this.convertToBSTNode(stepDetail.after_tree);
      }
      // Check for traverse operations
      else if (stepDetail.operation === 'traverse' && stepDetail.value) {
        // For traverse operations, we need to reconstruct the tree from the current state
        // This is more complex and would require maintaining tree state across steps
        root = null; // Will be handled by building from all steps
      }
    }

    // If still no root, build from all steps up to current step
    if (!root) {
      root = this.buildTreeFromSteps(steps, stepIndex);
    }

    return { root };
  }

  extractStatsFromSteps(steps: StepthroughStep[], stepIndex: number): BSTStatsExtended {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return {
        size: 0,
        height: 0,
        isEmpty: true,
      };
    }

    const step = steps[stepIndex];
    const state = step.state;

    // Get root to determine stats
    const data = this.extractDataFromSteps(steps, stepIndex);
    const root = data.root;

    // Extract stats from step detail if available
    let size = 0;
    let height = 0;
    let isEmpty = true;

    if (state.step_detail) {
      const stepDetail = state.step_detail as Record<string, unknown>;

      if (typeof stepDetail.size === 'number') {
        size = stepDetail.size;
      }
      if (typeof stepDetail.height === 'number') {
        height = stepDetail.height;
      }
      if (typeof stepDetail.isEmpty === 'boolean') {
        isEmpty = stepDetail.isEmpty;
      }
    }

    // If no stats from step detail, calculate from tree
    if (size === 0 && root) {
      size = this.calculateSize(root);
      height = this.calculateHeight(root);
      isEmpty = false;
    }

    return {
      size: size,
      height: height,
      isEmpty: isEmpty,
    };
  }

  private convertToBSTNode(nodeData: unknown): BSTNode | null {
    if (!nodeData || typeof nodeData !== 'object') {
      return null;
    }

    const data = nodeData as Record<string, unknown>;
    const node: BSTNode = {
      value: String(data.data || data.value || ''),
      left: null,
      right: null,
      id: Math.random().toString(36).substring(2, 11),
    };

    if (data.left) {
      node.left = this.convertToBSTNode(data.left);
    }
    if (data.right) {
      node.right = this.convertToBSTNode(data.right);
    }

    return node;
  }

  private buildTreeFromSteps(steps: StepthroughStep[], stepIndex: number): BSTNode | null {
    let root: BSTNode | null = null;

    for (let i = 0; i <= stepIndex; i++) {
      const step = steps[i];
      const state = step.state;

      // Check for insert operations in step detail
      if (state.step_detail?.operation === 'insert') {
        const stepDetail = state.step_detail as Record<string, unknown>;
        if (stepDetail.after_tree) {
          root = this.convertToBSTNode(stepDetail.after_tree);
        }
      }
      // Check for delete operations
      else if (state.step_detail?.operation === 'delete') {
        const stepDetail = state.step_detail as Record<string, unknown>;
        if (stepDetail.after_tree) {
          root = this.convertToBSTNode(stepDetail.after_tree);
        }
      }
    }

    return root;
  }

  private calculateSize(node: BSTNode | null): number {
    if (!node) return 0;
    return 1 + this.calculateSize(node.left) + this.calculateSize(node.right);
  }

  private calculateHeight(node: BSTNode | null): number {
    if (!node) return 0;
    return 1 + Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right));
  }
}

const defaultState: BaseStepthroughState<BSTData, BSTStatsExtended> = {
  code: bstCodeTemplate,
  filename: 'playground.py',
  steps: [],
  data: { root: null },
  stats: {
    size: 0,
    height: 0,
    isEmpty: true,
  },
};

const useStepthroughBST = () => {
  const baseHook = useBaseStepthrough<BSTData, BSTStatsExtended, BSTStepthroughService>(
    defaultState,
    BSTStepthroughService,
    'binarysearchtree',
  );

  const bstData = useMemo(
    () => ({
      root: baseHook.state.data.root,
      size: baseHook.state.stats.size,
      height: baseHook.state.stats.height,
      isEmpty: baseHook.state.stats.isEmpty,
    }),
    [
      baseHook.state.data.root,
      baseHook.state.stats.size,
      baseHook.state.stats.height,
      baseHook.state.stats.isEmpty,
    ],
  );

  // Convert BST data to linkedListData format for compatibility
  const linkedListData = useMemo(() => {
    const data = {
      nodes: [], // BST doesn't use nodes array
      head: null,
      tail: null,
      count: bstData.size,
      root: bstData.root, // Add root for BST visualization
    };
    return data;
  }, [bstData.size, bstData.root]);

  return {
    ...baseHook,
    bstData,
    linkedListData,
  };
};

export { useStepthroughBST };
