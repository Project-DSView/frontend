'use client';

import { useState, useEffect, useCallback } from 'react';
import { UndirectedGraphRealtimeService } from '@/services';
import { validatePythonCodeSecurity, executeCodeWithService } from '@/lib';
import { SecurityStatus, SecurityExecutionResult } from '@/types';
import { RealtimeUndirectedGraphData, UndirectedGraphParsedCode } from '@/types';

const useRealtimeUndirectedGraph = (code: string) => {
  const [service] = useState(() => new UndirectedGraphRealtimeService());
  const [data, setData] = useState<RealtimeUndirectedGraphData>({
    nodes: [],
    edges: [],
    vertices: 0,
    edgeCount: 0,
    isConnected: true,
    hasCycle: false,
  });
  const [isExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSafe: true,
    violations: [],
    warnings: [],
  });
  const [parsedCode, setParsedCode] = useState<UndirectedGraphParsedCode>({
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
    (code: string): UndirectedGraphParsedCode => {
      try {
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
    [service],
  );

  // Execute code
  const executeCode = useCallback(
    (
      code: string,
      securityStatus: SecurityStatus,
    ): SecurityExecutionResult<RealtimeUndirectedGraphData> => {
      // Parse code to get operations and graph variables
      const parseResult = service.parseCode(code);

      if (parseResult.isValid && parseResult.operations.length > 0) {
        // Execute operations with graph variables
        const result = service.executeOperations(
          parseResult.operations,
          parseResult.graphVariables,
        );
        return {
          success: true,
          data: result,
          error: null,
        };
      }

      return executeCodeWithService(code, service, securityStatus);
    },
    [service],
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

      // Execute code
      const result = executeCode(code, security);

      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Execution failed');
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [code, validateSecurity, parseCode, executeCode]);

  // Update node position
  const updateNodePosition = useCallback(
    (nodeId: string, x: number, y: number) => {
      service.updateNodePosition(nodeId, x, y);
    },
    [service],
  );

  // Get node positions
  const getNodePositions = useCallback(() => {
    return service.getNodePositions();
  }, [service]);

  return {
    data,
    isExecuting,
    error,
    securityStatus,
    parsedCode,
    executeCode,
    validateSecurity,
    parseCode,
    updateNodePosition,
    getNodePositions,
  };
};

export default useRealtimeUndirectedGraph;
