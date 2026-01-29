/**
 * AST-related types for stepthrough visualization
 */

interface ASTNodeMetadata {
  type: string;
  typeDisplay?: string;
  line?: number;
  colOffset?: number;
  category?: string;
  functionName?: string;
  methodName?: string;
  objectName?: string;
  variableName?: string;
  attributeName?: string;
  className?: string;
  operator?: string;
  parentId?: string | null;
}

interface ASTInfo {
  node_count: number;
  has_input: boolean;
  classes?: string[];
  ast_nodes?: ASTNodeMetadata[];
  executable_lines?: number[];
}

interface ASTClassification {
  has_class_definitions: boolean;
  has_method_calls: boolean;
  has_assignments: boolean;
  has_loops: boolean;
  has_conditionals: boolean;
  has_input: boolean;
  visualization_type: string;
}

interface ASTVisualizationProps {
  astNodes?: ASTNodeMetadata[];
  currentASTNodeIndex?: number;
  astInfo?: ASTInfo;
  classification?: ASTClassification;
}

interface ASTNodeTypeInfo {
  type: string;
  displayName: string;
  description: string;
  thaiDescription: string;
  category: string;
  example: string;
  whyShapedThisWay: string;
  executionFlow: string;
}

export type { ASTNodeMetadata, ASTInfo, ASTClassification, ASTVisualizationProps, ASTNodeTypeInfo };
