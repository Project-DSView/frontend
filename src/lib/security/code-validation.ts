import { CodeValidationConfig, SecurityStatus } from '@/types';

const DEFAULT_CONFIG: CodeValidationConfig = {
  dangerousImports: ['os', 'subprocess', 'sys', 'requests', 'socket', 'urllib', 'http'],
  dangerousFunctions: ['open', 'file', 'input', 'exec', 'eval', 'compile', '__import__'],
  allowedImports: [],
  allowedFunctions: [],
};

/**
 * Validates code for security violations
 * @param code - The code to validate
 * @param config - Optional configuration for validation rules
 * @returns SecurityStatus object with validation results
 */
export function validateCodeSecurity(
  code: string,
  config: CodeValidationConfig = {},
): SecurityStatus {
  const validationConfig = { ...DEFAULT_CONFIG, ...config };
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check for dangerous imports
  validationConfig.dangerousImports?.forEach((importName) => {
    if (code.includes(`import ${importName}`) || code.includes(`from ${importName}`)) {
      violations.push(`Dangerous import: ${importName}`);
    }
  });

  // Check for dangerous functions
  validationConfig.dangerousFunctions?.forEach((funcName) => {
    if (code.includes(funcName + '(')) {
      violations.push(`Dangerous function: ${funcName}`);
    }
  });

  // Check for allowed imports (whitelist approach)
  if (validationConfig.allowedImports && validationConfig.allowedImports.length > 0) {
    // More precise regex to match actual import statements only
    const importRegex =
      /^\s*(?:import\s+(\w+)(?:\s+as\s+\w+)?(?:\s*,\s*\w+(?:\s+as\s+\w+)?)*|from\s+(\w+)\s+import)/gm;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const importName = match[1] || match[2]; // match[1] for import, match[2] for from
      if (importName && !validationConfig.allowedImports.includes(importName)) {
        violations.push(`Unauthorized import: ${importName}`);
      }
    }
  }

  // Check for allowed functions (whitelist approach)
  if (validationConfig.allowedFunctions && validationConfig.allowedFunctions.length > 0) {
    // Parse code line by line to handle docstrings properly
    const lines = code.split('\n');
    let inDocstring = false;
    let docstringDelimiter = '';
    const cleanLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check for docstring start
      if (!inDocstring && (trimmedLine.startsWith('"""') || trimmedLine.startsWith("'''"))) {
        inDocstring = true;
        docstringDelimiter = trimmedLine.substring(0, 3);
        // Check if docstring ends on same line
        if (trimmedLine.endsWith(docstringDelimiter) && trimmedLine.length > 3) {
          inDocstring = false;
          docstringDelimiter = '';
        }
        cleanLines.push(''); // Add empty line instead of docstring
        continue;
      }

      // Check for docstring end
      if (inDocstring && trimmedLine.endsWith(docstringDelimiter)) {
        inDocstring = false;
        docstringDelimiter = '';
        cleanLines.push(''); // Add empty line instead of docstring
        continue;
      }

      // Skip lines inside docstring or comments
      if (inDocstring || trimmedLine.startsWith('#')) {
        cleanLines.push(''); // Add empty line
        continue;
      }

      // Keep the line for function checking
      cleanLines.push(line);
    }

    // Now check for function calls in clean code
    const cleanCode = cleanLines.join('\n');
    const functionRegex = /(\w+)\s*\(/g;
    let match;
    while ((match = functionRegex.exec(cleanCode)) !== null) {
      const funcName = match[1];
      if (
        validationConfig.allowedFunctions &&
        !validationConfig.allowedFunctions.includes(funcName)
      ) {
        violations.push(`Unauthorized function: ${funcName}`);
      }
    }
  }

  // Check for suspicious patterns
  // Note: input() pattern is conditionally checked based on config
  const suspiciousPatterns = [
    { pattern: /eval\s*\(/, message: 'Use of eval() function' },
    { pattern: /exec\s*\(/, message: 'Use of exec() function' },
    { pattern: /__import__\s*\(/, message: 'Use of __import__() function' },
    { pattern: /compile\s*\(/, message: 'Use of compile() function' },
    { pattern: /open\s*\(/, message: 'File operations detected' },
  ];

  // Only check for input() if it's in dangerousFunctions
  if (validationConfig.dangerousFunctions?.includes('input')) {
    suspiciousPatterns.push({ pattern: /input\s*\(/, message: 'User input detected' });
  }

  suspiciousPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      violations.push(message);
    }
  });

  // Check for potential infinite loops
  const loopPatterns = [
    { pattern: /while\s+True:/, message: 'Potential infinite loop detected' },
    { pattern: /for\s+\w+\s+in\s+range\s*\(\s*\)/, message: 'Empty range loop detected' },
  ];

  loopPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      warnings.push(message);
    }
  });

  return {
    isSafe: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Validates Python code specifically for data structure operations
 * @param code - The Python code to validate
 * @param mode - Validation mode: 'stepthrough' allows input() for educational purposes, 'normal' blocks it
 * @returns SecurityStatus object with validation results
 */
export function validatePythonCodeSecurity(
  code: string,
  mode: 'stepthrough' | 'normal' = 'normal',
): SecurityStatus {
  // Build dangerous functions list - exclude input() in stepthrough mode
  const dangerousFunctions = [
    'open',
    'file',
    'exec',
    'eval',
    'compile',
    '__import__',
    'raw_input',
    'reload',
    'dir',
    'vars',
    'locals',
    'globals',
  ];

  // Add input() only if not in stepthrough mode
  if (mode !== 'stepthrough') {
    dangerousFunctions.push('input');
  }

  return validateCodeSecurity(code, {
    dangerousImports: [
      'os',
      'subprocess',
      'sys',
      'requests',
      'socket',
      'urllib',
      'http',
      'pickle',
      'marshal',
      'shelve',
      'dbm',
      'sqlite3',
      'psycopg2',
      'ctypes',
      'multiprocessing',
      'threading',
      'asyncio',
    ],
    dangerousFunctions,
    allowedImports: [
      'collections',
      'math',
      'random',
      'time',
      'datetime',
      'json',
      're',
      'string',
      'itertools',
      'functools',
      'operator',
    ],
  });
}

/**
 * Validates JavaScript/TypeScript code specifically
 * @param code - The JavaScript/TypeScript code to validate
 * @returns SecurityStatus object with validation results
 */
export function validateJSCodeSecurity(code: string): SecurityStatus {
  return validateCodeSecurity(code, {
    dangerousImports: [
      'fs',
      'path',
      'child_process',
      'os',
      'crypto',
      'http',
      'https',
      'net',
      'dgram',
      'cluster',
      'worker_threads',
    ],
    dangerousFunctions: [
      'eval',
      'Function',
      'setTimeout',
      'setInterval',
      'setImmediate',
      'require',
      'import',
      'process',
      'global',
      'window',
    ],
  });
}
