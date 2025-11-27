import { api } from '../index';
import { StepthroughRequest, StepthroughResponse } from '@/types';

const executeStepthrough = async (request: StepthroughRequest): Promise<StepthroughResponse> => {
  const response = await api.post<StepthroughResponse>('/api/playground/run', request);
  return response.data;
};

export { executeStepthrough };
