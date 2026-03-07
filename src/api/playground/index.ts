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
 * Analyze code complexity using LLM (Detailed Explanation) endpoint with Streaming
 */
const analyzeWithLLM = async (
  token: string | null,
  code: string,
  model: string = 'qwen2.5-coder:1.5b',
  onChunk?: (chunk: string) => void,
): Promise<{ complexity: string; explanation: string }> => {
  // Set a longer timeout for LLM requests (e.g., 5 minutes)
  const isDev = process.env.NEXT_PUBLIC_NODE_ENV === 'development';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [process.env.NEXT_PUBLIC_API_KEY_NAME || 'dsview-api-key']:
      process.env.NEXT_PUBLIC_API_KEY || '',
  };

  // Only add Bearer token if it's a real JWT, not the 'cookie-managed' placeholder
  if (token && token !== 'cookie-managed') {
    headers.Authorization = `Bearer ${token}`;
  } else if (!isDev && !token) {
    throw new Error('Authentication required in production');
  }

  // Include safe headers if needed (for environment variables)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  try {
    const response = await fetch(`${baseUrl}/api/complexity/llm`, {
      method: 'POST',
      headers,
      credentials: 'include', // Ensure HttpOnly cookies are sent
      body: JSON.stringify({ code, model }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullExplanation = '';
    let complexityLabel = 'See explanation';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.complexity_label) {
              complexityLabel = data.complexity_label;
            } else if (data.chunk) {
              fullExplanation += data.chunk;
              if (onChunk) onChunk(data.chunk);
            } else if (data.error) {
              fullExplanation += `\n**Error**: ${data.error}`;
              if (onChunk) onChunk(`\n**Error**: ${data.error}`);
            }
          } catch {
            // ignore JSON parse errors for incomplete chunks
          }
        }
      }
    }

    return { complexity: complexityLabel, explanation: fullExplanation };
  } catch (error) {
    console.error('Streaming LLM request failed:', error);
    throw error;
  }
};

export { executeStepthrough, analyzePerformance, analyzeWithLLM };
