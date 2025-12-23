/**
 * AST-related types for stepthrough visualization
 */

export interface ASTNodeMetadata {
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

export interface ASTInfo {
  node_count: number;
  has_input: boolean;
  classes?: string[];
  ast_nodes?: ASTNodeMetadata[];
  executable_lines?: number[];
}

export interface ASTClassification {
  has_class_definitions: boolean;
  has_method_calls: boolean;
  has_assignments: boolean;
  has_loops: boolean;
  has_conditionals: boolean;
  has_input: boolean;
  visualization_type: string;
}

export interface ASTVisualizationProps {
  astNodes?: ASTNodeMetadata[];
  currentASTNodeIndex?: number;
  astInfo?: ASTInfo;
  classification?: ASTClassification;
}
