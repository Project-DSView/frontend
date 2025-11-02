import { useState, useEffect, useCallback } from 'react';
import { BSTRealtimeService } from '@/services';
import { validatePythonCodeSecurity, executeCodeWithService } from '@/lib';
import { SecurityStatus, SecurityExecutionResult } from '@/types';
import { BSTData as RealtimeBSTData, ParsedCode } from '@/types/realtime/BST.types';

const useRealtimeBST = (code: string) => {
  const [data, setData] = useState<RealtimeBSTData>({
    elements: [],
    count: 0,
    root: null,
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSafe: true,
    violations: [],
    warnings: [],
  });
  const [parsedCode, setParsedCode] = useState<ParsedCode>({
    operations: [],
    isValid: true,
    errors: [],
  });

  // Security validation
  const validateSecurity = useCallback((code: string): SecurityStatus => {
    return validatePythonCodeSecurity(code);
  }, []);

  // Parse code
  const parseCode = useCallback(
    (code: string): ParsedCode => {
      try {
        const service = new BSTRealtimeService(data);
        const result = service.parseCode(code);
        return result;
      } catch (error) {
        return {
          operations: [],
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
      }
    },
    [data],
  );

  // Execute code
  const executeCode = useCallback(
    (code: string, securityStatus: SecurityStatus): SecurityExecutionResult<RealtimeBSTData> => {
      const service = new BSTRealtimeService({ elements: [], count: 0, root: null });

      // Parse code to get operations and tree variables
      const parseResult = service.parseCode(code);

      if (parseResult.isValid && parseResult.operations.length > 0) {
        // Execute operations with tree variables
        const result = service.executeOperations(parseResult.operations, parseResult.treeVariables);
        return {
          success: true,
          data: result,
          error: null,
        };
      }

      return executeCodeWithService(code, service, securityStatus);
    },
    [],
  );

  // Update data when code changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Validate security
      const security = validateSecurity(code);
      setSecurityStatus(security);

      // Parse code
      const parsed = parseCode(code);
      setParsedCode(parsed);

      // Execute if safe and valid
      if (security.isSafe && parsed.isValid) {
        const result = executeCode(code, security);
        if (result.success && result.data) {
          setData(result.data);
          setError(null);
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        setError('Code contains security violations or syntax errors');
      }
    }, 300); // Debounced

    return () => clearTimeout(timeoutId);
  }, [code, validateSecurity, parseCode, executeCode]);

  // Update executing state
  useEffect(() => {
    setIsExecuting(parsedCode.isValid && securityStatus.isSafe);
  }, [parsedCode.isValid, securityStatus.isSafe]);

  return {
    data,
    isExecuting,
    error,
    securityStatus,
    parsedCode,
  };
};

export default useRealtimeBST;
