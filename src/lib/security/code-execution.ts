import { SecurityStatus } from '@/types';
import { CodeExecutionConfig, SecurityExecutionResult } from '@/types';
/**
 * Executes code safely with security validation
 * @param code - The code to execute
 * @param config - Configuration for code execution
 * @param securityStatus - Security validation result
 * @returns ExecutionResult with success status and data
 */
function executeCodeSafely<T>(
  code: string,
  config: CodeExecutionConfig<T>,
  securityStatus: SecurityStatus,
): SecurityExecutionResult<T> {
  try {
    // Check if code is safe
    if (!securityStatus.isSafe) {
      return {
        success: false,
        data: null,
        error: `Security violations detected: ${securityStatus.violations.join(', ')}`,
      };
    }

    // Parse the code
    const parsed = config.parseCode(code);

    if (!parsed.isValid) {
      return {
        success: false,
        data: null,
        error: parsed.errors.join(', '),
      };
    }

    // Execute operations
    const result = config.executeOperations(parsed.operations);

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Creates a code execution function for a specific data structure
 * @param config - Configuration for the data structure
 * @returns Function that executes code safely
 */
function createCodeExecutor<T>(config: CodeExecutionConfig<T>) {
  return (code: string, securityStatus: SecurityStatus): SecurityExecutionResult<T> => {
    return executeCodeSafely(code, config, securityStatus);
  };
}

/**
 * Generic code execution with service instance
 * @param code - The code to execute
 * @param service - Service instance for execution
 * @param securityStatus - Security validation result
 * @returns ExecutionResult
 */
function executeCodeWithService<T>(
  code: string,
  service: unknown,
  securityStatus: SecurityStatus,
): SecurityExecutionResult<T> {
  try {
    // Check if code is safe
    if (!securityStatus.isSafe) {
      return {
        success: false,
        data: null,
        error: `Security violations detected: ${securityStatus.violations.join(', ')}`,
      };
    }

    // Parse the code using service
    const parsed = (
      service as {
        parseCode: (code: string) => { operations: unknown[]; isValid: boolean; errors: string[] };
      }
    ).parseCode(code);

    if (!parsed.isValid) {
      return {
        success: false,
        data: null,
        error: parsed.errors.join(', '),
      };
    }

    // Execute operations using service
    const result = (
      service as { executeOperations: (operations: unknown[]) => T }
    ).executeOperations(parsed.operations);

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Batch execute multiple code snippets
 * @param codeSnippets - Array of code snippets to execute
 * @param config - Configuration for code execution
 * @param securityStatus - Security validation result
 * @returns Array of execution results
 */
function executeCodeBatch<T>(
  codeSnippets: string[],
  config: CodeExecutionConfig<T>,
  securityStatus: SecurityStatus,
): SecurityExecutionResult<T>[] {
  return codeSnippets.map((code) => executeCodeSafely(code, config, securityStatus));
}

/**
 * Execute code with timeout protection
 * @param code - The code to execute
 * @param config - Configuration for code execution
 * @param securityStatus - Security validation result
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Promise<ExecutionResult>
 */
function executeCodeWithTimeout<T>(
  code: string,
  config: CodeExecutionConfig<T>,
  securityStatus: SecurityStatus,
  timeoutMs: number = 5000,
): Promise<SecurityExecutionResult<T>> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        data: null,
        error: `Code execution timeout after ${timeoutMs}ms`,
      });
    }, timeoutMs);

    try {
      const result = executeCodeSafely(code, config, securityStatus);
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  });
}

export {
  executeCodeSafely,
  createCodeExecutor,
  executeCodeWithService,
  executeCodeBatch,
  executeCodeWithTimeout,
};
