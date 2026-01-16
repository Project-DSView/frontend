export function generateStackCode(operations: any[]) {
  let code: string[] = [];

  code.push("stack = []\n");

  for (const op of operations) {
    switch (op.type) {
      case "push":
        code.push(`stack.append(${JSON.stringify(op.value)})`);
        break;

      case "pop":
        code.push("if stack:\n    stack.pop()");
        break;

      case "peek":
        code.push("top = stack[-1] if stack else None");
        break;

      case "is_empty":
        code.push("is_empty = len(stack) == 0");
        break;

      case "size":
        code.push("size = len(stack)");
        break;

      default:
        code.push(`# Unknown operation: ${op.type}`);
        break;
    }
  }

  code.push("\nprint('Final Stack:', stack)");

  return code.join("\n");
}
