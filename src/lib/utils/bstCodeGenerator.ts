import { BSTOperation } from "@/types";

export const generatePythonCodeFromOperations = (operations: BSTOperation[]): string => {
  let lines = [
    "from bst import BST",
    "",
    "tree = BST()",
    ""
  ];

  operations.forEach(op => {
    const value = op.value ? parseFloat(op.value) : null;

    switch (op.type) {
      case "insert":
        lines.push(`tree.insert(${value})`);
        break;

      case "delete":
        lines.push(`tree.delete(${value})`);
        break;

      case "search":
        lines.push(`tree.search(${value})`);
        break;

      case "traverse_inorder":
        lines.push("tree.inorder()");
        break;

      case "traverse_preorder":
        lines.push("tree.preorder()");
        break;

      case "traverse_postorder":
        lines.push("tree.postorder()");
        break;
    }
  });

  return lines.join("\n");
};
