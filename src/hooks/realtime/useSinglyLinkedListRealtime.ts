import { useState, useEffect, useCallback } from 'react';
import { SinglyLinkedListRealtimeService } from '@/services';
import { validatePythonCodeSecurity, executeCodeWithService } from '@/lib';
import {
  RealtimeSinglyLinkedListData,
  SinglyLinkedListParsedCode,
  SecurityStatus,
  SecurityExecutionResult,
} from '@/types';

const useRealtimeSinglyLinkedList = (code: string) => {
  const [data, setData] = useState<RealtimeSinglyLinkedListData>({
    head: null,
    tail: null,
    count: 0,
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSafe: true,
    violations: [],
    warnings: [],
  });
  const [parsedCode, setParsedCode] = useState<SinglyLinkedListParsedCode>({
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
    (code: string): SinglyLinkedListParsedCode => {
      try {
        const service = new SinglyLinkedListRealtimeService(data);
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
    (
      code: string,
      securityStatus: SecurityStatus,
    ): SecurityExecutionResult<RealtimeSinglyLinkedListData> => {
      const service = new SinglyLinkedListRealtimeService({ head: null, tail: null, count: 0 });
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

export { useRealtimeSinglyLinkedList };
