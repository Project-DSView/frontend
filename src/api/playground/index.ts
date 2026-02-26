import { api } from '../index';
import { StepthroughRequest, StepthroughResponse } from '@/types';
import { ComplexityAnalysis } from '@/types/stepthrough/common.types';

const executeStepthrough = async (request: StepthroughRequest): Promise<StepthroughResponse> => {
  const response = await api.post<StepthroughResponse>('/api/playground/run', request);
  return response.data;
};

/**
 * Analyze code complexity using AST (Performance/Fast) endpoint
 */
const analyzePerformance = async (code: string): Promise<ComplexityAnalysis> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await api.post<any>('/api/complexity/performance', { code });
  const data = response.data;

  return {
    timeComplexity: data.time_complexity,
    spaceComplexity: data.space_complexity,
    timeExplanation: data.time_explanation,
    spaceExplanation: data.space_explanation,
    analysisDetails: data.analysis_details,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionComplexities: data.function_complexities?.map((fc: any) => ({
      functionName: fc.function_name,
      timeComplexity: fc.time_complexity,
      spaceComplexity: fc.space_complexity,
      lineStart: fc.line_start,
      lineEnd: fc.line_end,
      timeComplexityRank: fc.time_complexity_rank,
    })),
  };
};

/**
 * Analyze code complexity using LLM (Detailed Explanation) endpoint
 */
const analyzeWithLLM = async (
  token: string | null,
  code: string,
  model: string = 'qwen2.5-coder:1.5b',
): Promise<{ complexity: string; explanation: string }> => {
  // Set a longer timeout for LLM requests (e.g., 5 minutes)
  const isDev = process.env.NEXT_PUBLIC_NODE_ENV === 'development';
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (!isDev) {
    throw new Error('Authentication required in production');
  }

  const response = await api.post<{ complexity: string; explanation: string }>(
    '/api/complexity/llm',
    { code, model },
    {
      headers,
      timeout: 300000,
    },
  );
  return response.data;
};

export { executeStepthrough, analyzePerformance, analyzeWithLLM };
