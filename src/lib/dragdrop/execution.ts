const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createExecutionStep = (step: string, description: string, duration: number = 1000) => ({
  step,
  description,
  duration,
});

const addToExecutionHistory = (history: string[], message: string): string[] => {
  return [...history, message];
};

const validateOperationInput = (
  operationType: string,
  value?: string,
  position?: string,
  newValue?: string,
): { isValid: boolean; error?: string } => {
  switch (operationType) {
    case 'insert_beginning':
    case 'insert_end':
    case 'delete_value':
    case 'search_value':
    case 'update_value':
      if (!value || value.trim() === '') {
        return { isValid: false, error: 'Value is required' };
      }
      if (isNaN(Number(value))) {
        return { isValid: false, error: 'Value must be a number' };
      }
      break;

    case 'insert_position':
    case 'delete_position':
    case 'search_position':
    case 'update_position':
      if (!position || position.trim() === '') {
        return { isValid: false, error: 'Position is required' };
      }
      if (isNaN(Number(position)) || Number(position) < 0) {
        return { isValid: false, error: 'Position must be a non-negative number' };
      }
      break;

    case 'update_value':
    case 'update_position':
      if (!newValue || newValue.trim() === '') {
        return { isValid: false, error: 'New value is required' };
      }
      if (isNaN(Number(newValue))) {
        return { isValid: false, error: 'New value must be a number' };
      }
      break;
  }

  return { isValid: true };
};

const formatExecutionMessage = (
  operation: string,
  value?: string,
  position?: string,
  newValue?: string,
): string => {
  const parts = [operation];

  if (value !== undefined) {
    parts.push(`(${value}`);
    if (position !== undefined) {
      parts.push(`, ${position}`);
    }
    if (newValue !== undefined) {
      parts.push(`, ${newValue}`);
    }
    parts.push(')');
  }

  return parts.join('');
};

export {
  delay,
  createExecutionStep,
  addToExecutionHistory,
  validateOperationInput,
  formatExecutionMessage,
};
